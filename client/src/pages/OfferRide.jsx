import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, Calendar, Clock, Users, Car, CreditCard, ShieldCheck, 
  ArrowRight, Loader2, Info, LayoutDashboard, LogOut, Sparkles,
  ChevronRight, Briefcase, Navigation
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LocationSelector from '../components/LocationSelector';
import { Navigation as NavIcon } from 'lucide-react';

const OfferRide = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [formData, setFormData] = useState({
    from: '',
    to: '',
    fromCoordinates: [],
    toCoordinates: [],
    date: '',
    time: '',
    seatsAvailable: 1,
    carModel: '',
    carNumber: '',
    price: '',
    genderPreference: user?.gender === 'female' ? 'female-only' : 'any',
    waitingTime: 10
  });

  const [locationLoading, setLocationLoading] = useState(false);

  // AUTO-FILL STARTING LOCATION
  const autoFillLocation = async () => {
    if (!navigator.geolocation) return;
    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data    = await response.json();
          const address = data.display_name;

          setFormData(prev => ({
            ...prev,
            from: address,
            fromCoordinates: [lng, lat]
          }));
          toast.success('Pickup location auto-filled!');
        } catch (error) {
          console.error('Nominatim error:', error);
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.log('Location access denied');
        setLocationLoading(false);
      }
    );
  };

  useEffect(() => {
    autoFillLocation();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // If user manually types, clear the pre-filled coordinates to force re-geocoding
    // This logic is now handled by LocationSelector's internal state and onCoordinatesChange
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.from || !formData.to || !formData.date || !formData.time || !formData.carModel || !formData.carNumber || !formData.price) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // REQUIREMENT 5: If all else fails, just send the text
      const res = await api.post('/rides/offer', formData);

      if (res.data.success) {
        toast.success('Your journey has been shared successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Incomplete profile or server error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputContainerClass = "relative w-full group";
  const iconClass = "absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none";
  const labelClass = "text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1 block";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-outfit selection:bg-indigo-100 selection:text-indigo-900">
      {/* Premium Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 md:px-12 py-3 md:py-4 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 group shrink-0">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 transform group-hover:rotate-12 transition-transform duration-300">
              <LayoutDashboard className="text-white h-5 w-5" />
            </div>
            <span className={`font-bold text-2xl tracking-tighter ${scrolled ? 'text-slate-800' : 'text-slate-800'}`}>Raid<span className="text-indigo-600">Dosthi</span></span>
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            <Link to="/find-rides" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Find Rides</Link>
            <Link to="/offer-ride" className="text-sm font-bold text-indigo-600 relative after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600">Offer Ride</Link>
            <Link to="/bookings" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">My Bookings</Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 bg-white py-1.5 md:py-2 px-3 md:px-4 rounded-2xl shadow-sm border border-slate-100 shrink-0">
              <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg md:rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold ring-2 ring-indigo-50">
                {user?.name?.charAt(0)}
              </div>
              <span className="text-sm font-bold text-slate-800 leading-none">{user?.name}</span>
            </div>
            <button onClick={logout} className="p-2 md:p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all active:scale-95 flex items-center justify-center h-10 w-10 md:h-12 md:w-12">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-50/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-5xl mx-auto w-full relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center lg:text-left"
          >
             <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-4 border border-indigo-100">
               <Sparkles size={14} /> Global Driver Community
             </span>
             <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
               Post Your <span className="text-indigo-600 italic">Journey.</span>
             </h1>
             <p className="text-slate-600 text-lg font-medium max-w-xl">Share your route, pick verified co-travelers, and split costs safely.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Form Area */}
            <div className="lg:col-span-2 space-y-8">
               
               {/* Route Section */}
                <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-indigo-100/50 border border-white relative overflow-visible group z-[30]">
                   <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden pointer-events-none rounded-bl-[100px] z-0">
                      <div className="w-full h-full bg-slate-50 group-hover:bg-indigo-50 transition-colors duration-700"></div>
                   </div>
                  <h3 className="text-xl font-black text-slate-800 mb-10 flex items-center gap-4">
                     <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                        <Navigation size={20} />
                     </div>
                     Route Path Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                     <div className="absolute left-1/2 top-11 bottom-11 w-0.5 bg-slate-50 hidden md:block"></div>
                      <LocationSelector
                        label="Pickup Location"
                        placeholder="Vadapalani, Chennai"
                        name="from"
                        autoTrigger={true}
                        value={formData.from}
                        coordinates={formData.fromCoordinates}
                        onChange={(v) => setFormData(p => ({ ...p, from: v }))}
                        onCoordinatesChange={(c) => setFormData(p => ({ ...p, fromCoordinates: c }))}
                      />
                      <LocationSelector
                        label="Destination City"
                        placeholder="Gachibowli, Hyderabad"
                        name="to"
                        icon={NavIcon}
                        value={formData.to}
                        coordinates={formData.toCoordinates}
                        onChange={(v) => setFormData(p => ({ ...p, to: v }))}
                        onCoordinatesChange={(c) => setFormData(p => ({ ...p, toCoordinates: c }))}
                      />
                   </div>
               </div>

               {/* Schedule & Price */}
               <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-indigo-100/50 border border-white relative z-[20]">
                  <h3 className="text-xl font-black text-slate-800 mb-10 flex items-center gap-4">
                     <div className="h-10 w-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-100">
                        <Calendar size={20} />
                     </div>
                     Timing & Pricing
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                     <div className="space-y-4">
                        <label className={labelClass}>Travel Date</label>
                        <div className={inputContainerClass}>
                           <Calendar className={iconClass} />
                           <input name="date" type="date" className="input-field !py-4 pl-14 font-bold" value={formData.date} onChange={handleChange} required />
                        </div>
                     </div>
                     <div className="space-y-4">
                        <label className={labelClass}>Departure Time</label>
                        <div className={inputContainerClass}>
                           <Clock className={iconClass} />
                           <input name="time" type="time" className="input-field !py-4 pl-14 font-bold" value={formData.time} onChange={handleChange} required />
                        </div>
                     </div>
                     <div className="space-y-4">
                        <label className={labelClass}>Available Seats</label>
                        <div className={inputContainerClass}>
                           <Users className={iconClass} />
                           <input name="seatsAvailable" type="number" min="1" max="6" className="input-field !py-4 pl-14 font-bold" value={formData.seatsAvailable} onChange={handleChange} required />
                        </div>
                     </div>
                     <div className="space-y-4">
                        <label className={labelClass}>Price Per Co-Rider</label>
                        <div className={inputContainerClass}>
                           <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-indigo-600 text-lg pointer-events-none">₹</span>
                           <input name="price" type="number" placeholder="500" className="input-field !py-4 pl-14 font-black text-lg text-indigo-600" value={formData.price} onChange={handleChange} required />
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Side-box: Vehicle & Safety */}
            <div className="space-y-8">
               <div className="bg-slate-900 p-8 md:p-10 rounded-[3.5rem] text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-x-12 -translate-y-12"></div>
                  <h3 className="text-xl font-black mb-8 flex items-center gap-4 relative z-10">
                     <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/10 backdrop-blur-md">
                        <Car size={20} />
                     </div>
                     Vehicle Specs
                  </h3>
                  <div className="space-y-8 relative z-10">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Car Model</label>
                        <input name="carModel" type="text" placeholder="Swift Dzire - White" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-white/20" value={formData.carModel} onChange={handleChange} required />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vehicle Plate No.</label>
                        <input name="carNumber" type="text" placeholder="TS 09 AB 1234" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-500 transition-all font-bold uppercase tracking-[0.2em] placeholder:text-white/40" value={formData.carNumber} onChange={handleChange} required />
                     </div>
                  </div>
               </div>

               <div className="bg-indigo-600 p-8 md:p-10 rounded-[3.5rem] text-white shadow-2xl shadow-indigo-200 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-x-12 -translate-y-12 group-hover:scale-125 transition-transform duration-1000"></div>
                  <h3 className="text-xl font-black mb-8 flex items-center gap-4 relative z-10">
                     <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center text-white border border-white/20 backdrop-blur-md">
                        <ShieldCheck size={20} />
                     </div>
                     Safety Mode
                  </h3>
                                    <div className="space-y-6 relative z-10">
                      {user?.gender === 'female' ? (
                         <div className="space-y-4">
                            <div className="bg-white/20 p-4 rounded-2xl border border-white/20 font-black italic text-sm tracking-tight text-center">
                               🛡️ FEATURE LOCKED: FEMALE ONLY
                            </div>
                            <p className="text-[11px] font-bold text-indigo-100/70 leading-relaxed text-center">
                               Your ride is automatically set to female passengers only for maximum safety.
                            </p>
                         </div>
                      ) : (
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-indigo-200 uppercase tracking-widest ml-1">Who can join your ride?</label>
                            <div className="grid grid-cols-1 gap-3">
                               <button
                                 type="button"
                                 onClick={() => setFormData({ ...formData, genderPreference: 'any' })}
                                 className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.genderPreference === 'any' ? 'bg-white border-white shadow-xl shadow-white/10' : 'bg-white/5 border-white/20 hover:border-white/40'}`}
                               >
                                  <p className={`text-sm font-black italic tracking-tight ${formData.genderPreference === 'any' ? 'text-indigo-900' : 'text-white'}`}>Any Gender</p>
                                  <p className={`text-[10px] font-bold mt-1 opacity-70 ${formData.genderPreference === 'any' ? 'text-indigo-700' : 'text-white'}`}>Open to all verified co-riders</p>
                               </button>
                               <button
                                 type="button"
                                 onClick={() => setFormData({ ...formData, genderPreference: 'male-only' })}
                                 className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.genderPreference === 'male-only' ? 'bg-white border-white shadow-xl shadow-white/10' : 'bg-white/5 border-white/20 hover:border-white/40'}`}
                               >
                                  <p className={`text-sm font-black italic tracking-tight ${formData.genderPreference === 'male-only' ? 'text-indigo-900' : 'text-white'}`}>Males Only</p>
                                  <p className={`text-[10px] font-bold mt-1 opacity-70 ${formData.genderPreference === 'male-only' ? 'text-indigo-700' : 'text-white'}`}>Strictly male-only transit pool</p>
                               </button>
                            </div>
                         </div>
                      )}
                   </div>
               </div>

               <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-slate-900 text-white p-7 rounded-[2.5rem] font-black text-xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-4 active:scale-95 group"
               >
                  {isSubmitting ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      POST JOURNEY
                      <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
               </button>
            </div>
          </form>
        </div>
      </main>
      
      {/* Trust Footer */}
      <footer className="py-12 px-6 border-t border-slate-200/60 bg-white">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
               <ShieldCheck className="text-indigo-600" size={24} />
               <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Encrypted Driver Data Protection</p>
            </div>
            <div className="flex gap-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">
               <span className="hover:text-indigo-600 cursor-pointer">Insurance Policy</span>
               <span className="hover:text-indigo-600 cursor-pointer">Identity Guidelines</span>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default OfferRide;
