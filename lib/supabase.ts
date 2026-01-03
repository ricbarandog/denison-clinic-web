
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.45.0';

/**
 * Helper to retrieve environment variables across different runtimes (Vite, Web, Vercel).
 */
const getEnv = (name: string): string => {
  const env = (import.meta as any).env;
  if (env && env[name]) return env[name];
  
  const processEnv = (window as any).process?.env;
  if (processEnv && processEnv[name]) return processEnv[name];

  // Fallback to checking window for injected globals
  if ((window as any)[name]) return (window as any)[name];
  
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// A configuration is valid only if both keys are present and not the initial placeholders
const isConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.includes('supabase.co') &&
  supabaseUrl !== 'https://placeholder-project.supabase.co'
);

// Log status for debugging (viewable in browser console)
if (!isConfigured) {
  console.warn("Denison Clinic: Supabase is NOT configured. Operating in Demo Mode.");
} else {
  console.log("Denison Clinic: Supabase connection initialized.");
}

export const supabase = createClient(
  supabaseUrl || 'https://nrhmsrhsnbbamvymjpkp.supabase.co', 
  supabaseAnonKey || 'sb_secret_cfLES1Gvwq35LiHO47XUXA_K8_1bBjI'
);

export const submitAppointment = async (appointmentData: any) => {
  if (!isConfigured) {
    console.warn("Submission blocked: API_NOT_CONFIGURED. Simulating database write...");
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
    ])
    .select(); // Ensure we return the data to verify the write

  if (error) {
    console.error("Supabase Insert Error:", error);
    throw error;
  }
  return data;
};

export const fetchAppointments = async () => {
  if (!isConfigured) {
    console.warn("Fetch blocked: API_NOT_CONFIGURED.");
    return [];
  }
  
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false }); // Show newest first

  if (error) {
    console.error("Supabase Fetch Error:", error);
    throw error;
  }
  return data || [];
};
