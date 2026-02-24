import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BookingModal from './components/BookingModal';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { SERVICES, ICONS } from './constants';

const App: React.FC = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (window.location.hash === '#admin') {
      setIsAdminMode(true);
    }
  }, []);

  const handleAdminLogin = (key: string) => {
    if (key === 'denison2024') {
      setIsLoggedIn(true);
    } else {
      alert("Unauthorized access attempt recorded.");
    }
  };

  if (isAdminMode) {
    return isLoggedIn ? <AdminDashboard /> : <AdminLogin onLogin={handleAdminLogin} />;
  }

  const CalendarIcon = ICONS.Calendar;
  const PhoneIcon = ICONS.Phone;
  const CheckIcon = ICONS.Check;

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-100 selection:text-blue-900">
      <Navbar onBookClick={() => setIsBookingOpen(true)} />
      
      {/* Dynamic Hero */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=2000&q=80" 
            alt="Dr. Tyron Denison at Denison Clinic" 
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white w-full">
          <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 backdrop-blur-xl rounded-full text-[10px] font-black tracking-[0.2em] border border-blue-400/30 uppercase">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Accepting New Patients
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tighter">
              Dental Excellence <br/> Reinvented<span className="text-blue-400">.</span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed max-w-lg font-medium">
              We merge clinical precision with patient-centric hospitality. Experience the highest standard of oral healthcare in Philippines.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <button 
                onClick={() => setIsBookingOpen(true)}
                className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-3"
              >
                <CalendarIcon />
                Secure Appointment
              </button>
              <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-4 group cursor-pointer hover:bg-white/20 transition-all">
                <div className="w-11 h-11 bg-white text-slate-900 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <PhoneIcon />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-blue-400">Emergency Line</div>
                  <div className="text-lg font-black tracking-tight">1-800-DENISON</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modernized Services */}
      <section id="services" className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="text-blue-600 font-black text-xs uppercase tracking-widest">Our Specialties</div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Clinical Solutions for <br/> Every Stage of Life.</h2>
            </div>
            <p className="text-gray-500 max-w-sm text-sm leading-relaxed font-medium">
              Leveraging the latest in 3D imaging and laser dentistry to provide pain-free, durable results for our patients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SERVICES.map((service, i) => (
              <div key={service.id} className="group p-10 border border-gray-50 rounded-[2.5rem] bg-[#fcfdfe] hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500">
                <div className="w-14 h-14 bg-white text-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  <span className="text-xl font-black">0{i+1}</span>
                </div>
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">{service.category}</div>
                <h3 className="text-xl font-black text-slate-900 mb-4">{service.name}</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">{service.description}</p>
                <button 
                  onClick={() => setIsBookingOpen(true)}
                  className="text-slate-900 text-xs font-black uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all"
                >
                  Book Treatment <span className="text-blue-500">→</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Bio */}
      <section id="about" className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 relative">
              <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
              <img 
                src="/PP.png" 
                alt="Dr. Tyron Denison DMD" 
                className="rounded-[3rem] shadow-3xl relative z-10 w-full object-cover aspect-[4/5]"
              />
              <div className="absolute -bottom-10 -right-10 bg-white p-10 rounded-[2rem] shadow-2xl z-20 border border-gray-100 max-w-[320px] animate-bounce-slow">
                <div className="text-4xl font-black text-blue-600 mb-1">20+</div>
                <div className="text-slate-900 font-black text-sm uppercase tracking-widest">Years Experience</div>
                <div className="w-10 h-1 bg-blue-600 mt-4 rounded-full"></div>
              </div>
            </div>
            <div className="flex-1 space-y-10">
              <div className="space-y-4">
                <div className="text-blue-600 font-black text-xs uppercase tracking-widest">Clinical Leadership</div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tight">Dr. Tyron Denison, <span className="text-blue-600 italic">DMD</span></h2>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                "We believe that a visit to the dentist should be the best part of your day. Our facility is designed to reduce anxiety and provide a spa-like experience alongside elite clinical results."
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  'Harvard School of Dental Medicine',
                  'Board Certified Specialist',
                  'AAID Implant Fellow',
                  'Minimally Invasive Expert'
                ].map(item => (
                  <div key={item} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-8 h-8 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
                      <CheckIcon />
                    </div>
                    <span className="text-sm font-bold text-slate-800">{item}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setIsBookingOpen(true)}
                className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
              >
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-slate-900 text-slate-400 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 border-b border-slate-800 pb-20">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20">D</div>
                <span className="text-2xl font-black text-white tracking-tighter">Denison Clinic</span>
              </div>
              <p className="text-sm font-medium leading-relaxed">
                Pioneering high-performance dental care with compassion. HIPAA compliant and patient focused.
              </p>
            </div>
            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8">Navigation</h4>
              <ul className="space-y-5 text-sm font-bold">
                <li><a href="#services" className="hover:text-blue-400 transition-colors">Treatments</a></li>
                <li><a href="#about" className="hover:text-blue-400 transition-colors">Our Practice</a></li>
                <li><button onClick={() => setIsAdminMode(true)} className="hover:text-blue-400 transition-colors text-left uppercase text-[10px] tracking-widest">Portal Access</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8">Clinical Hours</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li className="flex justify-between"><span>Mon - Thu</span> <span className="text-white font-bold">8:00 - 18:00</span></li>
                <li className="flex justify-between"><span>Friday</span> <span className="text-white font-bold">8:00 - 15:00</span></li>
                <li className="flex justify-between"><span>Sat - Sun</span> <span className="text-blue-400 font-bold uppercase text-[10px] tracking-widest">Emergency Only</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8">Location</h4>
              <p className="text-sm font-medium leading-loose">
                123 Dumaguete City, Negros Oriental<br/>Philippines<br/>
                <span className="text-white font-bold block mt-4 underline decoration-blue-500 underline-offset-4">Get Directions</span>
              </p>
            </div>
          </div>
          <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-xs font-bold uppercase tracking-widest opacity-40">© 2026 Denison Dental Group. Dumaguete City, Negros Oriental.</p>
            <div className="flex gap-6">
               <div className="text-[10px] font-black text-white hover:text-blue-400 transition-all cursor-pointer tracking-widest uppercase">Instagram</div>
               <div className="text-[10px] font-black text-white hover:text-blue-400 transition-all cursor-pointer tracking-widest uppercase">LinkedIn</div>
            </div>
          </div>
        </div>
      </footer>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
      />
      
      <style>{`
        @keyframes slow-zoom {
          from { transform: scale(1.05); }
          to { transform: scale(1.15); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s ease-in-out infinite alternate;
        }
        .animate-bounce-slow {
          animation: bounce 6s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ccc;
        }
      `}</style>
    </div>
  );
};

export default App;
