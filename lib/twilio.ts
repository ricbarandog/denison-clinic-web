
/**
 * Twilio SMS Service
 * Note: In a production environment, these calls should be routed through 
 * a secure backend/Edge Function to protect your TWILIO_AUTH_TOKEN.
 */

const getEnv = (name: string): string => {
  const metaEnv = (import.meta as any).env;
  if (metaEnv && metaEnv[name]) return metaEnv[name];
  const processEnv = typeof process !== 'undefined' ? process.env : null;
  if (processEnv && processEnv[name]) return processEnv[name];
  return '';
};

export const sendSMSReminder = async (appointment: any) => {
  const accountSid = getEnv('VITE_TWILIO_ACCOUNT_SID');
  const authToken = getEnv('VITE_TWILIO_AUTH_TOKEN');
  const fromNumber = getEnv('VITE_TWILIO_PHONE_NUMBER');

  if (!accountSid || !authToken || !fromNumber) {
    console.warn("Twilio credentials missing. SMS simulation mode active.");
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true, simulated: true };
  }

  const message = `Hi ${appointment.first_name}, this is a reminder from Denison Clinic for your appointment on ${appointment.appointment_date} at ${appointment.appointment_time}. See you soon!`;

  try {
    // Basic Twilio API REST call
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: appointment.phone,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to send SMS');
    }

    return await response.json();
  } catch (error) {
    console.error('Twilio Error:', error);
    throw error;
  }
};
