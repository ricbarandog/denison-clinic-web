
import React, { useEffect, useState, useCallback } from 'react';
import { fetchAppointments } from '../lib/supabase';
import { SERVICES } from '../constants';

const AdminDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('');

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
    
    // Auto-refresh every 30 seconds to catch new bookings
    const interval = setInterval(() => {
      loadData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadData]);

  const getServiceName = (id: string) => SERVICES.find(s => s.id === id)?.name || 'Unknown';

  const filtered = appointments.filter(a => 
    `${a.first_name} ${a.last_name}`.toLowerCase().includes(filter.toLowerCase()) ||
    a.email.toLowerCase().includes(filter.toLowerCase())
  );

  const stats = {
    total: appointments.length,
    new: appointments.filter(a => a.patient_type === 'new').length,
    today: appointments.filter(a => a.appointment_date === new Date().toISOString().split('T')[0]).length
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
            {refreshing && (
              <span className="flex items-center gap-2 text-xs font-medium text-blue-500 bg-blue-50 px-2 py-1 rounded-full animate-pulse">
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Updating...
              </span>
            )}
          </div>
          <div className="flex gap-4 items-center">
             <button 
               onClick={() => loadData()}
               className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
               title="Manual Refresh"
             >
               <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             </button>
             <input 
               type="text" 
               placeholder="Search patients..." 
               value={filter}
               onChange={(e) => setFilter(e.target.value)}
               className="px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all"
             />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Bookings</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">New Patients</div>
              <div className="text-3xl font-bold text-blue-600">{stats.new}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Today</div>
              <div className="text-3xl font-bold text-green-600">{stats.today}</div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Patient</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Service</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Schedule</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Syncing database...</span>
                      </div>
                    </td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">No appointments found matching your search.</td></tr>
                  ) : filtered.map((app) => (
                    <tr key={app.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{app.first_name} {app.last_name}</div>
                        <div className="text-xs text-gray-500">{app.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-700">{getServiceName(app.service_id)}</div>
                        <div className="text-[10px] text-gray-400">{app.insurance_provider || 'Self-Pay / No Insurance'}</div>
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
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                           <span className="text-xs font-medium text-gray-600 tracking-tight">Confirmed</span>
                        </div>
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
