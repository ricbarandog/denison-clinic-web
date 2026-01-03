
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import BookingModal from './components/BookingModal';
import { SERVICES, ICONS } from './constants';

const App: React.FC = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      <Navbar onBookClick={() => setIsBookingOpen(true)} />
      
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Modern Dental Clinic" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="max-w-2xl space-y-8">
            <div className="inline-block px-4 py-1.5 bg-blue-500/30 backdrop-blur-md rounded-full text-sm font-bold tracking-wider border border-blue-400/30">
              TRUSTED FAMILY DENTAL CARE
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1]">
              Advanced Dental Care <br/> For Your <span className="text-blue-300">Family</span>.
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-lg">
              Combining world-class technology with a personal, clinical touch. Experience dentistry redefined at Denison Clinic.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => setIsBookingOpen(true)}
                className="px-10 py-5 bg-white text-[#0056b3] rounded-full font-bold text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center justify-center gap-2"
              >
                <ICONS.Calendar />
                Book Free Consultation
              </button>
              <div className="flex items-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center text-blue-900">
                  <ICONS.Phone />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-blue-200">Emergency Line</div>
                  <div className="text-lg font-bold">1-800-DENISON</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-gray-900">Expert Specialized Care</h2>
            <div className="w-20 h-1.5 bg-medical-blue mx-auto rounded-full"></div>
            <p className="text-gray-600 text-lg">We offer a full spectrum of dental services using the latest clinical advancements and personalized care plans.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SERVICES.map((service, i) => (
              <div key={service.id} className="group p-8 border border-gray-100 rounded-3xl bg-white shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-blue-50 text-medical-blue rounded-2xl flex items-center justify-center mb-6 group-hover:bg-medical-blue group-hover:text-white transition-colors duration-300">
                  <span className="text-2xl font-bold">0{i+1}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.name}</h3>
                <p className="text-gray-500 mb-6 line-clamp-2">{service.description}</p>
                <button 
                  onClick={() => setIsBookingOpen(true)}
                  className="text-medical-blue font-bold flex items-center gap-2 group-hover:gap-3 transition-all"
                >
                  Learn More <span className="text-xl">→</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us / Trust Building */}
      <section id="about" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 relative">
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-medical-blue rounded-3xl -z-10 opacity-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1588776814546-1ffce47267a5?auto=format&fit=crop&w=800&q=80" 
                alt="Dr. Denison" 
                className="rounded-3xl shadow-2xl relative z-10 w-full object-cover aspect-[4/5]"
              />
              <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-3xl shadow-xl z-20 border border-gray-100 max-w-[280px]">
                <div className="text-3xl font-bold text-medical-blue mb-1">20+ Years</div>
                <div className="text-gray-500 font-medium">Of Clinical Excellence and Patient Trust</div>
              </div>
            </div>
            <div className="flex-1 space-y-8">
              <div className="text-medical-blue font-bold tracking-widest uppercase text-sm">Meet Our Founder</div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Dr. Sarah Denison, DMD</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                "Our philosophy is simple: provide the highest standard of dental care in a welcoming environment. We treat every patient like family, ensuring your comfort is our primary focus alongside your oral health."
              </p>
              <ul className="space-y-4">
                {['Board Certified Dental Specialist', 'Harvard School of Dental Medicine', 'Advanced Implantology Expert', '15,000+ Successful Procedures'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-800 font-semibold">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <ICONS.Check />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => setIsBookingOpen(true)}
                className="bg-medical-blue text-white px-10 py-4 rounded-full font-bold hover:bg-blue-700 shadow-xl"
              >
                Book with Dr. Denison
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-800 pb-16">
            <div className="col-span-1 md:col-span-1 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-medical-blue rounded flex items-center justify-center text-white font-bold">D</div>
                <span className="text-xl font-bold text-white tracking-tight">Denison Clinic</span>
              </div>
              <p className="text-sm">Setting the standard for excellence in dentistry through innovation and compassionate care.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#services" className="hover:text-blue-400 transition-colors">Services</a></li>
                <li><a href="#about" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#booking" className="hover:text-blue-400 transition-colors">Book Now</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Contact</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-3"><ICONS.Phone /> 1-800-DENISON</li>
                <li>support@denisonclinic.com</li>
                <li>123 Healthcare Ave, Suite 400<br/>San Francisco, CA 94103</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Clinic Hours</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between"><span>Mon - Thu:</span> <span className="text-white">8:00 AM - 6:00 PM</span></li>
                <li className="flex justify-between"><span>Friday:</span> <span className="text-white">8:00 AM - 3:00 PM</span></li>
                <li className="flex justify-between"><span>Sat - Sun:</span> <span className="text-red-400">Closed (Emergency Only)</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm">© 2024 Denison Dental Clinic. All data handled under HIPAA-compliant principles.</p>
            <div className="flex gap-4">
               <div className="w-10 h-10 bg-gray-800 rounded-full hover:bg-blue-600 transition-colors cursor-pointer"></div>
               <div className="w-10 h-10 bg-gray-800 rounded-full hover:bg-blue-600 transition-colors cursor-pointer"></div>
               <div className="w-10 h-10 bg-gray-800 rounded-full hover:bg-blue-600 transition-colors cursor-pointer"></div>
            </div>
          </div>
        </div>
      </footer>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
      />
    </div>
  );
};

export default App;
