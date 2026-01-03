
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.45.0';

// In some environments, process.env might not be directly available on the window 
// or might be structured differently. We provide empty strings as defaults to prevent 
// the "supabaseUrl is required" crash during initialization.
const supabaseUrl = (window as any).process?.env?.VITE_SUPABASE_URL || 'https://nrhmsrhsnbbamvymjpkp.supabase.co';
const supabaseAnonKey = (window as any).process?.env?.VITE_SUPABASE_ANON_KEY || 'sb_secret_cfLES1Gvwq35LiHO47XUXA_K8_1bBjI';

// Check if we are using placeholder values
const isConfigured = 
  supabaseUrl !== 'https://nrhmsrhsnbbamvymjpkp.supabase.co' && 
  supabaseAnonKey !== 'sb_secret_cfLES1Gvwq35LiHO47XUXA_K8_1bBjI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const submitAppointment = async (appointmentData: any) => {
  if (!isConfigured) {
    console.warn("Supabase is not configured. Environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing.");
    // We throw a specific error that the UI can catch to show a friendly message or fallback to demo mode.
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
