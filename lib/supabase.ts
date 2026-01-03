
import { createClient } from '@supabase/supabase-js';

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

  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('id')
      .eq('appointment_date', date)
      .eq('appointment_time', time);

    if (error) {
       console.warn("Supabase availability check error:", error.message);
       return true; // Fail safe to available in dev
    }
    return data.length === 0;
  } catch (e) {
    return true;
  }
};

/**
 * Returns all booked times for a specific date to help the UI disable slots.
 */
export const getBookedSlotsForDate = async (date: string) => {
  if (!isConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('appointment_date', date);

    if (error) {
      console.warn("Supabase slot fetch error:", error.message);
      return [];
    }
    return data.map(row => row.appointment_time);
  } catch (e) {
    return [];
  }
};

export const submitAppointment = async (appointmentData: any) => {
  if (!isConfigured) {
    if (isSecretKey) throw new Error("SECURITY_ERROR: Using service_role key in browser is forbidden.");
    throw new Error("API_NOT_CONFIGURED: Please set your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.");
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
      throw new Error("Table 'appointments' not found. Ensure you ran the SQL setup script in Supabase.");
    }
    throw error;
  }
  return data;
};

export const fetchAppointments = async () => {
  if (!isConfigured) return [];
  
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') {
         console.error("Supabase table 'appointments' not found.");
         return [];
      }
      throw error;
    }
    return data || [];
  } catch (e) {
    return [];
  }
};
