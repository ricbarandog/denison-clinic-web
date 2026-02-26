import React, { useState, useEffect } from 'react';
import { SERVICES } from '../constants';
import { supabase } from '../lib/supabase';

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: {
    firstName: string;
    lastName: string;
    phone: string;
    lastVisit: string;
    visitCount: number;
    totalSpent: number;
  } | null;
  appointments: any[];
}

const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({ isOpen, onClose, patient, appointments }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'files' | 'form'>('history');
  const [files, setFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    if (isOpen && patient) {
      fetchPatientFiles();
      fetchPatientNotes();
    }
  }, [isOpen, patient]);

  const fetchPatientFiles = async () => {
    if (!patient) return;
    try {
      const { data, error } = await supabase
        .from('patient_files')
        .select('*')
        .eq('patient_phone', patient.phone);
      
      if (error) throw error;
      setFiles(data || []);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  const fetchPatientNotes = async () => {
    if (!patient) return;
    try {
      const { data, error } = await supabase
        .from('patient_details')
        .select('notes')
        .eq('phone', patient.phone)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      setNotes(data?.notes || '');
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !patient) return;

    setIsUploading(true);
    try {
      // 1. Upload to Supabase Storage (assuming 'patient-records' bucket exists)
      const fileExt = file.name.split('.').pop();
      const fileName = `${patient.phone}/${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('patient-records')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('patient-records')
        .getPublicUrl(fileName);

      // 3. Save to patient_files table
      const { error: dbError } = await supabase
        .from('patient_files')
        .insert([{
          patient_phone: patient.phone,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type.includes('image') ? 'x-ray' : 'document'
        }]);

      if (dbError) throw dbError;

      await fetchPatientFiles();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Make sure 'patient-records' bucket exists in Supabase Storage and is public.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!patient) return;
    setIsSavingNotes(true);
    try {
      const { error } = await supabase
        .from('patient_details')
        .upsert({ 
          phone: patient.phone, 
          notes: notes,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      alert("Notes saved successfully!");
    } catch (err) {
      console.error("Error saving notes:", err);
      alert("Failed to save notes.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (!isOpen || !patient) return null;

  const patientHistory = appointments.filter(a => a.phone === patient.phone)
    .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-slate-50/50">
          <div>
            <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Patient Profile</div>
            <h2 className="text-3xl font-black text-slate-900">{patient.firstName} {patient.lastName}</h2>
            <div className="flex gap-4 mt-2">
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeWidth="2"/></svg>
                {patient.phone}
              </span>
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2"/></svg>
                Last Visit: {patient.lastVisit}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-all">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-8 bg-white">
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            Visit History
          </button>
          <button 
            onClick={() => setActiveTab('files')}
            className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'files' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            Files & X-Rays
          </button>
          <button 
            onClick={() => setActiveTab('form')}
            className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'form' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            Dental Form & Notes
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'history' && (
            <div className="space-y-6">
              {patientHistory.map((app, i) => {
                const service = SERVICES.find(s => s.id === app.service_id);
                return (
                  <div key={app.id} className="flex gap-6 items-start p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600 font-black text-xs">
                      {patientHistory.length - i}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-black text-slate-900">{service?.name || 'Consultation'}</h4>
                        <span className="text-xs font-black text-blue-600">₱{service?.price.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-4">
                        <span>{app.appointment_date} @ {app.appointment_time}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span>{app.patient_type} Patient</span>
                      </div>
                      {app.insurance_provider && (
                        <div className="mt-3 text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-50 inline-block px-2 py-1 rounded-md">
                          Insurance: {app.insurance_provider}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-slate-900">Patient Records</h3>
                <label className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                  Upload File
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                </label>
              </div>

              {files.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2"/></svg>
                  </div>
                  <p className="text-gray-400 font-bold text-sm">No files uploaded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {files.map(file => (
                    <div key={file.id} className="group relative bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                      {file.file_type === 'x-ray' ? (
                        <img src={file.file_url} alt={file.file_name} className="w-full h-40 object-cover" />
                      ) : (
                        <div className="w-full h-40 bg-slate-50 flex items-center justify-center">
                          <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth="2"/></svg>
                        </div>
                      )}
                      <div className="p-4">
                        <div className="text-xs font-bold text-slate-900 truncate mb-1">{file.file_name}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(file.created_at).toLocaleDateString()}</div>
                      </div>
                      <a 
                        href={file.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest"
                      >
                        View Full File
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'form' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="font-black text-slate-900">Clinical Notes & Dental History</h3>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter patient dental history, allergies, or specific treatment notes here..."
                  className="w-full h-64 p-6 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium leading-relaxed"
                />
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="bg-slate-900 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                >
                  {isSavingNotes ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                  Save Patient Records
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="p-8 bg-slate-50 border-t border-gray-100 grid grid-cols-3 gap-8">
          <div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Visits</div>
            <div className="text-xl font-black text-slate-900">{patient.visitCount}</div>
          </div>
          <div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lifetime Value</div>
            <div className="text-xl font-black text-blue-600">₱{patient.totalSpent.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Status</div>
            <div className="text-xl font-black text-green-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsModal;
