
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.45.0';

// Vercel/Vite standard is import.meta.env. 
// We check multiple possible locations for the variables.
const getEnv = (name: string) => {
  return (
    (import.meta as any).env?.[name] || 
    (window as any).process?.env?.[name] || 
    ''
  );
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 'https://nrhmsrhsnbbamvymjpkp.supabase.co';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || 'sb_secret_cfLES1Gvwq35LiHO47XUXA_K8_1bBjI';

// Check if we are using placeholder values
const isConfigured = 
  supabaseUrl !== 'https://nrhmsrhsnbbamvymjpkp.supabase.co' && 
  supabaseAnonKey !== 'sb_secret_cfLES1Gvwq35LiHO47XUXA_K8_1bBjI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const submitAppointment = async (appointmentData: any) => {
  if (!isConfigured) {
    console.warn("Supabase is not configured. Environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing.");
    throw new Error("API_NOT_CONFIGURED");
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
        insurance_provider: appointmentData.insuranceProvider,
        created_at: new Date().toISOString(),
      },
    ]);

  if (error) throw error;
  return data;
};
