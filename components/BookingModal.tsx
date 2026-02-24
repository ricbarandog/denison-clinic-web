import React, { useState, useEffect } from 'react';
import { SERVICES, ICONS } from '../constants';
import { AppointmentRequest, ServiceCategory } from '../types';
import { submitAppointment, getBookedSlotsForDate } from '../lib/supabase';
import { sendSMSConfirmation } from '../lib/twilio';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<AppointmentRequest>>({
    patientType: 'new',
    serviceId: SERVICES[0].id,
    date: '',
    time: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (formData.date) {
        setIsLoadingSlots(true);
        try {
          const booked = await getBookedSlotsForDate(formData.date);
          setBookedSlots(booked);
          if (formData.time && booked.includes(formData.time)) {
            setFormData(prev => ({ ...prev, time: '' }));
          }
        } catch (err) {
          console.error("Error checking availability:", err);
        } finally {
          setIsLoadingSlots(false);
        }
      }
    };
    fetchSlots();
  }, [formData.date]);

  if (!isOpen) return null;

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const getCategoryColor = (cat: ServiceCategory) => {
    switch(cat) {
      case ServiceCategory.COSMETIC: return 'bg-purple-100 text-purple-700';
      case ServiceCategory.EMERGENCY: return 'bg-red-100 text-red-700';
      case ServiceCategory.ORTHODONTICS: return 'bg-green-100 text-green-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await submitAppointment(formData);
      // Automated SMS Confirmation
      try {
        await sendSMSConfirmation(formData);
      } catch (smsErr) {
        console.error("SMS Confirmation failed to send:", smsErr);
        // We don't block the UI for SMS failure, but we log it
      }
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || "Submission failed. Please try again.");
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Select Treatment</h3>
              <p className="text-sm text-gray-500">Choose the service you require today.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {SERVICES.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setFormData({...formData, serviceId: s.id})}
                  className={`p-4 border rounded-2xl text-left transition-all relative overflow-hidden ${formData.serviceId === s.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : 'border-gray-100 hover:border-gray-300 bg-gray-50/50'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-gray-800">{s.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getCategoryColor(s.category)}`}>
                      {s.category.split(' ')[0]}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-1">{s.description}</div>
                  <div className="mt-2 text-[10px] font-bold text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Approx. {s.durationMinutes} minutes
                  </div>
                </button>
              ))}
            </div>
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 ml-2">Patient Status</span>
              <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, patientType: 'new'})}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.patientType === 'new' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >New</button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, patientType: 'returning'})}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.patientType === 'returning' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >Returning</button>
              </div>
            </div>
            <button type="button" onClick={handleNext} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2">
              Next Step
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Pick Your Time</h3>
              <p className="text-sm text-gray-500">Available slots for the selected date.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Appointment Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" 
                  />
                  {isLoadingSlots && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Select Slot</label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map(t => {
                    const isBooked = bookedSlots.includes(t);
                    
                    // Filter past times for same-day bookings
                    const isPastTime = (() => {
                      const today = new Date().toISOString().split('T')[0];
                      if (formData.date === today) {
                        const [hours, minutes] = t.split(':').map(Number);
                        const now = new Date();
                        const slotTime = new Date();
                        slotTime.setHours(hours, minutes, 0, 0);
                        return slotTime < now;
                      }
                      return false;
                    })();

                    const isDisabled = isBooked || isPastTime;

                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setFormData({...formData, time: t})}
                        className={`p-3 text-sm border-2 rounded-xl transition-all ${
                          formData.time === t 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                            : isDisabled
                            ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed'
                            : 'bg-white border-gray-100 hover:border-blue-200 text-gray-700'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={handleBack} className="flex-1 border-2 border-gray-100 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all">Back</button>
              <button 
                type="button"
                disabled={!formData.date || !formData.time || isLoadingSlots}
                onClick={handleNext} 
                className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg active:scale-[0.99]"
              >Continue</button>
            </div>
          </div>
        );
      case 3:
        return (
          <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Final Details</h3>
              <p className="text-sm text-gray-500">Provide your contact information for the reminder.</p>
            </div>
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/></svg>
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">First Name</label>
                <input placeholder="Jane" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" onChange={e => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Last Name</label>
                <input placeholder="Doe" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Mobile Number</label>
              <input type="tel" placeholder="(09) 000-000000" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
               <label className="block text-[10px] font-bold text-blue-600 uppercase tracking-widest">Insurance Provider (Optional)</label>
               <input placeholder="e.g. Blue Shield" className="w-full p-3 border border-blue-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setFormData({...formData, insuranceProvider: e.target.value})} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleBack} className="flex-1 border-2 border-gray-100 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all">Back</button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : "Confirm Booking"}
              </button>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden relative border border-white/20">
        <div className="p-8 pb-10">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`w-8 h-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`w-8 h-1 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            </div>
            <button onClick={onClose} className="bg-gray-100 text-gray-400 hover:text-gray-600 transition-all p-2 rounded-full hover:rotate-90">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          {isSuccess ? (
            <div className="text-center py-8 space-y-6 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">You're All Set!</h2>
                <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
                  Confirmation sent to your mobile number. We'll see you on {formData.date} at {formData.time}.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 text-left space-y-2">
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clinic Location</div>
                 <div className="text-sm font-bold text-gray-800">123 Healthcare Ave, Suite 400</div>
                 <div className="text-xs text-gray-500">San Francisco, CA 94103</div>
              </div>
              <button 
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new CustomEvent('appointment-added'));
                }}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98]"
              >
                Close & Return Home
              </button>
            </div>
          ) : renderStep()}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
