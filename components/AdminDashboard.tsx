
import React, { useEffect, useState } from 'react';
import { fetchAppointments } from '../lib/supabase';
import { SERVICES } from '../constants';

const AdminDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAppointments();
        setAppointments(data);
      } catch (err) {
        console.error("Failed to load appointments", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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
           <button onClick={() => window.location.reload()} className="text-gray-500 hover:text-red-500 font-medium flex items-center gap-2">
             Logout
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
          <div className="flex gap-4">
             <input 
               type="text" 
               placeholder="Search patients..." 
               value={filter}
               onChange={(e) => setFilter(e.target.value)}
               className="px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64"
             />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Bookings</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">New Patients</div>
              <div className="text-3xl font-bold text-blue-600">{stats.new}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
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
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading appointments...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No appointments found.</td></tr>
                  ) : filtered.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{app.first_name} {app.last_name}</div>
                        <div className="text-xs text-gray-500">{app.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-700">{getServiceName(app.service_id)}</div>
                        <div className="text-[10px] text-gray-400">{app.insurance_provider || 'No Insurance Info'}</div>
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
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                           <span className="text-xs font-medium text-gray-600">Confirmed</span>
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
