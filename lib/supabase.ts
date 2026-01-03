
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.45.0';

const getEnv = (name: string): string => {
  const metaEnv = (import.meta as any).env;
  if (metaEnv && metaEnv[name]) return metaEnv[name];
  
  const processEnv = typeof process !== 'undefined' ? process.env : null;
  if (processEnv && processEnv[name]) return processEnv[name];

  const windowEnv = (window as any)[name];
  if (windowEnv) return windowEnv;
  
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

const isSecretKey = supabaseAnonKey.length > 100 && (supabaseAnonKey.includes('.service_role') || !supabaseAnonKey.startsWith('eyJ'));

const isConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.includes('supabase.co') &&
  !isSecretKey
);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

/**
 * Checks if a specific date and time slot is already occupied.
 */
export const checkAvailability = async (date: string, time: string) => {
  if (!isConfigured) return true; // Default to available for demo if not configured

  const { data, error } = await supabase
    .from('appointments')
    .select('id')
    .eq('appointment_date', date)
    .eq('appointment_time', time);

  if (error) throw error;
  return data.length === 0;
};

/**
 * Returns all booked times for a specific date to help the UI disable slots.
 */
export const getBookedSlotsForDate = async (date: string) => {
  if (!isConfigured) return [];

  const { data, error } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('appointment_date', date);

  if (error) throw error;
  return data.map(row => row.appointment_time);
};

export const submitAppointment = async (appointmentData: any) => {
  if (!isConfigured) {
    if (isSecretKey) throw new Error("SECURITY_ERROR: Using service_role key in browser is forbidden.");
    throw new Error("API_NOT_CONFIGURED");
  }

  // Double check availability immediately before inserting to prevent race conditions
  const isAvailable = await checkAvailability(appointmentData.date, appointmentData.time);
  if (!isAvailable) {
    throw new Error("This time slot was just booked by another patient. Please select a different time.");
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert([
      {
        first_name: appointmentData.firstName,
        last_name: appointmentData.lastName,
        email: appointmentData.email,
        phone: appointmentData.phone,
        service_id: appointmentData.serviceId,
        appointment_date: appointmentData.date,
        appointment_time: appointmentData.time,
        patient_type: appointmentData.patientType,
        insurance_provider: appointmentData.insuranceProvider || null,
        created_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) {
    if (error.code === '42P01') {
      throw new Error("The 'appointments' table does not exist in your Supabase database. Please run the SQL script in the Supabase SQL Editor.");
    }
    throw error;
  }
  return data;
};

export const fetchAppointments = async () => {
  if (!isConfigured) return [];
  
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === '42P01') {
       console.error("Supabase table 'appointments' not found. Run the SQL setup script.");
       return [];
    }
    throw error;
  }
  return data || [];
};
