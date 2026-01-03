
import React, { useEffect, useState, useCallback } from 'react';
import { fetchAppointments } from '../lib/supabase';
import { sendSMSReminder } from '../lib/twilio';
import { SERVICES } from '../constants';

const AdminDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('');
  const [sendingSmsId, setSendingSmsId] = useState<string | null>(null);
  const [smsStatus, setSmsStatus] = useState<Record<string, 'idle' | 'sent' | 'error'>>({});

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const data = await fetchAppointments();
      setAppointments(data);
    } catch (err) {
      console.error("Failed to load appointments", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSendReminder = async (appointment: any) => {
    setSendingSmsId(appointment.id);
    try {
      await sendSMSReminder(appointment);
      setSmsStatus(prev => ({ ...prev, [appointment.id]: 'sent' }));
      // Reset status after 3 seconds
      setTimeout(() => {
        setSmsStatus(prev => ({ ...prev, [appointment.id]: 'idle' }));
      }, 3000);
    } catch (err) {
      setSmsStatus(prev => ({ ...prev, [appointment.id]: 'error' }));
      alert("Failed to send SMS. Ensure Twilio credentials are set in Environment Variables.");
    } finally {
      setSendingSmsId(null);
    }
  };

  const getServiceName = (id: string) => SERVICES.find(s => s.id === id)?.name || 'Unknown';

  const filtered = appointments.filter(a => 
    `${a.first_name} ${a.last_name}`.toLowerCase().includes(filter.toLowerCase()) ||
    a.email.toLowerCase().includes(filter.toLowerCase()) ||
    a.phone.includes(filter)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col p-6 hidden lg:flex">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 bg-medical-blue rounded flex items-center justify-center text-white font-bold">D</div>
          <span className="font-bold text-xl text-gray-800">Admin</span>
        </div>
        <nav className="space-y-2">
          <div className="p-3 bg-blue-50 text-medical-blue rounded-xl font-bold flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Appointments
          </div>
        </nav>
        <div className="mt-auto pt-6 border-t border-gray-100">
           <button onClick={() => window.location.reload()} className="text-gray-500 hover:text-red-500 font-medium flex items-center gap-2 transition-colors">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             Logout
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
            {refreshing && (
              <span className="flex items-center gap-2 text-xs font-medium text-blue-500 bg-blue-50 px-2 py-1 rounded-full animate-pulse">
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2" /></svg>
                Syncing...
              </span>
            )}
          </div>
          <div className="flex gap-4 items-center">
             <input 
               type="text" 
               placeholder="Search name, email, phone..." 
               value={filter}
               onChange={(e) => setFilter(e.target.value)}
               className="px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 w-80 transition-all"
             />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Patient</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Service</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Schedule</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No appointments found.</td></tr>
                  ) : filtered.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{app.first_name} {app.last_name}</div>
                        <div className="text-xs text-gray-500">{app.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-700">{getServiceName(app.service_id)}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold">{app.insurance_provider || 'Private'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">{app.appointment_date}</div>
                        <div className="text-xs text-gray-500">{app.appointment_time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${app.patient_type === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {app.patient_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleSendReminder(app)}
                          disabled={sendingSmsId === app.id || smsStatus[app.id] === 'sent'}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 ${
                            smsStatus[app.id] === 'sent' 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : smsStatus[app.id] === 'error'
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600'
                          }`}
                        >
                          {sendingSmsId === app.id ? (
                            <>
                              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                              Sending...
                            </>
                          ) : smsStatus[app.id] === 'sent' ? (
                            <>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                              Sent!
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                              Send SMS
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
