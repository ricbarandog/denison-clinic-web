import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchAppointments } from '../lib/supabase';
import { sendSMSReminder } from '../lib/twilio';
import { SERVICES } from '../constants';

const AdminDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'schedule' | 'patients' | 'dashboard'>('dashboard');
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

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const totalRevenue = appointments.reduce((acc, app) => {
      const service = SERVICES.find(s => s.id === app.service_id);
      return acc + (service?.price || 0);
    }, 0);

    const serviceCounts = appointments.reduce((acc: Record<string, number>, app) => {
      acc[app.service_id] = (acc[app.service_id] || 0) + 1;
      return acc;
    }, {});

    const topServiceId = Object.entries(serviceCounts).sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0]?.[0];
    const topService = SERVICES.find(s => s.id === topServiceId)?.name || 'N/A';

    return {
      total: appointments.length,
      today: appointments.filter(a => a.appointment_date === today).length,
      newPatients: appointments.filter(a => a.patient_type === 'new').length,
      revenue: totalRevenue,
      topService
    };
  }, [appointments]);

  const patients = useMemo(() => {
    const patientMap = new Map<string, any>();
    appointments.forEach(app => {
      const key = app.phone;
      if (!patientMap.has(key)) {
        patientMap.set(key, {
          firstName: app.first_name,
          lastName: app.last_name,
          phone: app.phone,
          lastVisit: app.appointment_date,
          visitCount: 1,
          totalSpent: SERVICES.find(s => s.id === app.service_id)?.price || 0
        });
      } else {
        const existing = patientMap.get(key);
        existing.visitCount += 1;
        existing.totalSpent += SERVICES.find(s => s.id === app.service_id)?.price || 0;
        if (new Date(app.appointment_date) > new Date(existing.lastVisit)) {
          existing.lastVisit = app.appointment_date;
        }
      }
    });
    return Array.from(patientMap.values());
  }, [appointments]);

  const handleSendReminder = async (appointment: any) => {
    setSendingSmsId(appointment.id);
    try {
      await sendSMSReminder(appointment);
      setSmsStatus(prev => ({ ...prev, [appointment.id]: 'sent' }));
      setTimeout(() => {
        setSmsStatus(prev => ({ ...prev, [appointment.id]: 'idle' }));
      }, 3000);
    } catch (err) {
      setSmsStatus(prev => ({ ...prev, [appointment.id]: 'error' }));
    } finally {
      setSendingSmsId(null);
    }
  };

  const getServiceName = (id: string) => SERVICES.find(s => s.id === id)?.name || 'Consultation';

  const filteredAppointments = appointments.filter(a => 
    `${a.first_name} ${a.last_name}`.toLowerCase().includes(filter.toLowerCase()) ||
    a.phone.includes(filter)
  );

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(filter.toLowerCase()) ||
    p.phone.includes(filter)
  );

  const todayStr = new Date().toISOString().split('T')[0];

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Total Revenue</div>
              <div className="text-3xl font-black text-slate-900">₱{stats.revenue.toLocaleString()}</div>
              <div className="mt-4 text-xs text-green-500 font-bold flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                +12% from last month
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">Top Service</div>
              <div className="text-xl font-black text-slate-900 truncate">{stats.topService}</div>
              <div className="mt-4 text-xs text-gray-400 font-bold">Most requested treatment</div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2">Patient Retention</div>
              <div className="text-3xl font-black text-slate-900">{Math.round((stats.total - stats.newPatients) / (stats.total || 1) * 100)}%</div>
              <div className="mt-4 text-xs text-purple-400 font-bold">Returning patient ratio</div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">New Growth</div>
              <div className="text-3xl font-black text-slate-900">+{stats.newPatients}</div>
              <div className="mt-4 text-xs text-green-400 font-bold">New patients this period</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <h3 className="font-black text-slate-900 mb-6">Service Distribution</h3>
              <div className="space-y-4">
                {SERVICES.map(s => {
                  const count = appointments.filter(a => a.service_id === s.id).length;
                  const percent = Math.round((count / (appointments.length || 1)) * 100);
                  return (
                    <div key={s.id} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600">{s.name}</span>
                        <span className="text-slate-400">{percent}%</span>
                      </div>
                      <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <h3 className="font-black text-slate-900 mb-6">Recent Activity</h3>
              <div className="space-y-6">
                {appointments.slice(0, 5).map(app => (
                  <div key={app.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xs font-black">
                      {app.first_name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900">{app.first_name} booked {getServiceName(app.service_id)}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{app.appointment_date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'patients') {
      return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-black text-slate-800">Patient Directory</h3>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{patients.length} Total Patients</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient Name</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Visit</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Visits</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPatients.map((p, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-all duration-300">
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-900 text-sm">{p.firstName} {p.lastName}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-semibold text-slate-600">{p.phone}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-bold text-slate-900">{p.lastVisit}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-bold text-slate-900">{p.visitCount}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-black text-blue-600">₱{p.totalSpent.toLocaleString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-black text-slate-800">Appointment Schedule</h3>
          {refreshing && <div className="text-[10px] font-black text-blue-500 animate-pulse tracking-widest">AUTO-SYNCING...</div>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient Details</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Treatment</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Schedule</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center">
                  <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </td></tr>
              ) : filteredAppointments.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-medium italic">No appointments match your search.</td></tr>
              ) : filteredAppointments.map((app) => (
                <tr key={app.id} className={`hover:bg-blue-50/30 transition-all duration-300 ${app.appointment_date === todayStr ? 'bg-orange-50/10' : ''}`}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
                        {app.first_name[0]}{app.last_name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{app.first_name} {app.last_name}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{app.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm font-semibold text-slate-700">{getServiceName(app.service_id)}</div>
                    <div className="text-[10px] text-blue-500 font-bold uppercase tracking-tight">{app.insurance_provider || 'Private Pay'}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className={`text-sm font-bold ${app.appointment_date === todayStr ? 'text-orange-600' : 'text-slate-900'}`}>{app.appointment_date}</div>
                    <div className="text-[10px] text-gray-400 font-bold">{app.appointment_time}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${app.patient_type === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                      {app.patient_type}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <button
                      onClick={() => handleSendReminder(app)}
                      disabled={sendingSmsId === app.id || smsStatus[app.id] === 'sent'}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                        smsStatus[app.id] === 'sent' 
                          ? 'bg-green-100 text-green-700' 
                          : smsStatus[app.id] === 'error'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600'
                      }`}
                    >
                      {sendingSmsId === app.id ? "Syncing..." : smsStatus[app.id] === 'sent' ? "Delivered" : "Notify SMS"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-72 bg-slate-900 flex flex-col p-8 hidden lg:flex">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">D</div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-white tracking-tight">Staff Portal</span>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Admin Access</span>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full p-4 rounded-2xl font-bold flex items-center gap-4 transition-all border ${activeTab === 'dashboard' ? 'bg-blue-600/10 text-blue-400 border-blue-500/20' : 'text-slate-500 hover:text-slate-300 border-transparent'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 5a1 1 0 011-1h3a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM11 5a1 1 0 011-1h3a1 1 0 011 1v12a1 1 0 01-1 1h-3a1 1 0 01-1-1V5zM17 5a1 1 0 011-1h3a1 1 0 011 1v12a1 1 0 01-1 1h-3a1 1 0 01-1-1V5z" strokeWidth="2"/></svg>
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`w-full p-4 rounded-2xl font-bold flex items-center gap-4 transition-all border ${activeTab === 'schedule' ? 'bg-blue-600/10 text-blue-400 border-blue-500/20' : 'text-slate-500 hover:text-slate-300 border-transparent'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round"/></svg>
            Schedule
          </button>
          <button 
            onClick={() => setActiveTab('patients')}
            className={`w-full p-4 rounded-2xl font-bold flex items-center gap-4 transition-all border ${activeTab === 'patients' ? 'bg-blue-600/10 text-blue-400 border-blue-500/20' : 'text-slate-500 hover:text-slate-300 border-transparent'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth="2"/></svg>
            Patients
          </button>
        </nav>
        <button onClick={() => window.location.hash = ''} className="mt-auto pt-6 text-slate-500 hover:text-red-400 font-bold flex items-center gap-3 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth="2"/></svg>
          Sign Out
        </button>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-24 bg-white border-b border-gray-100 px-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 capitalize">{activeTab}</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Welcome back, Dr. Denison</p>
          </div>
          <div className="flex gap-4 items-center">
             <div className="relative group">
                <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2"/></svg>
                <input 
                  type="text" 
                  placeholder={`Search ${activeTab}...`} 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm outline-none focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 transition-all w-72"
                />
             </div>
             <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-gray-100">SD</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 space-y-8 bg-[#fcfdfe] custom-scrollbar">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
