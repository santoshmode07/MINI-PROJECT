import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, MapPin, Calendar, Clock, Users, ArrowRight, ShieldCheck, 
  Star, Info, X, Navigation, Filter, User, IdCard, FileText, 
  ChevronRight, Car, Loader2, LayoutDashboard, LogOut, TrendingUp,
  Map, Sparkles, Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LocationSelector from '../components/LocationSelector';
import { toast } from 'react-toastify';
import { Navigation as NavIcon } from 'lucide-react';
import Navbar from '../components/Navbar';

const FindRides = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({ 
    from: '', 
    to: '', 
    date: '',
    passengerLat: '',
    passengerLng: '',
    destinationLat: '',
    destinationLng: ''
  });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setIsSearching(true);

    // Simplified to use state coordinates directly, as LocationSelector handles geocoding
    const query = new URLSearchParams({
      from: searchParams.from || '',
      to: searchParams.to || '',
      date: searchParams.date || '',
      passengerLat: searchParams.passengerLat || '',
      passengerLng: searchParams.passengerLng || '',
      destinationLat: searchParams.destinationLat || '',
      destinationLng: searchParams.destinationLng || ''
    }).toString();
    
    navigate(`/ride-results?${query}`);
  };

  const browseAll = () => {
    navigate('/ride-results?from=&to=&date=');
  };

  const inputClass = "w-full bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 text-sm font-medium placeholder:text-slate-500";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-outfit">
      <Navbar />

      <section className="relative pt-32 md:pt-36 pb-20 md:pb-32 flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-indigo-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-50/50 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-5xl mx-auto w-full relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-8 border border-indigo-100 shadow-sm">
               <Sparkles size={14} className="animate-pulse" /> START YOUR VERIFIED SEARCH
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[0.95] mb-10">
               Where do you want to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 italic">Travel</span> today?
            </h1>
            <p className="text-slate-600 text-xl font-medium max-w-2xl mx-auto mb-16 leading-relaxed">
               Find verified co-travelers and safe drivers in our ID-pass protected community. Your safe trip is just a search away.
            </p>
          </motion.div>

          {/* Luxury Search Landing Box */}
          <div className="relative max-w-6xl mx-auto">
            <motion.form 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              onSubmit={handleSearch} 
              className="bg-white/80 backdrop-blur-3xl p-4 md:p-6 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl shadow-indigo-100/50 border border-white grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5 hover:shadow-indigo-200/40 transition-shadow duration-700 relative z-[20] overflow-visible"
            >
              <div className="md:col-span-1">
                <LocationSelector
                  label="Pickup Location"
                  placeholder="Vadapalani, Chennai"
                  name="from"
                  autoTrigger={true}
                  value={searchParams.from}
                  coordinates={searchParams.passengerLat ? [searchParams.passengerLng, searchParams.passengerLat] : []}
                  onChange={(v) => setSearchParams(p => ({ ...p, from: v }))}
                  onCoordinatesChange={(c) => setSearchParams(p => ({ ...p, passengerLat: c[1], passengerLng: c[0] }))}
                />
              </div>
              <div className="md:col-span-1">
                <LocationSelector
                  label="Destination"
                  placeholder="Gachibowli, Hyderabad"
                  name="to"
                  icon={NavIcon}
                  value={searchParams.to}
                  coordinates={searchParams.destinationLat ? [searchParams.destinationLng, searchParams.destinationLat] : []}
                  onChange={(v) => setSearchParams(p => ({ ...p, to: v }))}
                  onCoordinatesChange={(c) => setSearchParams(p => ({ ...p, destinationLat: c[1], destinationLng: c[0] }))}
                />
              </div>
              <div className="md:col-span-1 space-y-3">
                 <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1 block">Travel Date</label>
                 <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5 pointer-events-none" />
                    <input 
                      type="date" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl py-4 pl-14 pr-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-slate-700 font-bold"
                      value={searchParams.date}
                      onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                    />
                 </div>
              </div>
               <button type="submit" disabled={isSearching} className="bg-indigo-600 text-white rounded-[1.5rem] md:rounded-[2rem] py-4 px-6 md:px-8 font-black text-sm md:text-base hover:bg-slate-900 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200 active:scale-95 h-14 md:h-16 group">
                  {isSearching ? <Loader2 className="animate-spin" /> : (
                    <>
                      <span className="whitespace-nowrap">Search Rides</span>
                      <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform shrink-0" />
                    </>
                  )}
               </button>
            </motion.form>
            
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={browseAll}
              className="mt-8 mx-auto flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-colors group"
            >
              <TrendingUp size={16} className="group-hover:scale-110 transition-transform" /> Browse All Verified Rides
            </motion.button>
          </div>
          
          <div className="mt-20 flex items-center justify-center gap-10 md:gap-20 grayscale opacity-60 transition-opacity hover:opacity-100">
             <div className="flex items-center gap-2 text-slate-700"><ShieldCheck size={20} /><span className="text-[10px] font-black uppercase tracking-[0.3em]">ID Verified</span></div>
             <div className="flex items-center gap-2 text-slate-700"><Briefcase size={20} /><span className="text-[10px] font-black uppercase tracking-[0.3em]">Insured Trips</span></div>
             <div className="flex items-center gap-2 text-slate-700"><Star size={20} /><span className="text-[10px] font-black uppercase tracking-[0.3em]">Top Rated Drivers</span></div>
          </div>
        </div>
      </section>

      {/* Trust Footer */}
      <footer className="py-24 px-6 border-t border-slate-200/60 bg-white relative z-10 text-center">
         <div className="max-w-4xl mx-auto mb-16">
            <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-4 tracking-tight italic">Revolutionizing the way you <span className="text-indigo-600">Commute.</span></h3>
            <p className="text-slate-500 font-medium text-lg">Join 10,000+ verified professionals from top companies who trust RaidDosthi for their daily journeys.</p>
         </div>
         <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-12 font-black text-slate-800 md:scale-110 text-3xl tracking-[0.4em] italic uppercase opacity-60 hover:opacity-100 transition-all duration-700">
            <span className="hover:text-indigo-600 hover:scale-125 transition-all cursor-default">Microsoft</span>
            <span className="hover:text-indigo-600 hover:scale-125 transition-all cursor-default">Google</span>
            <span className="hover:text-indigo-600 hover:scale-125 transition-all cursor-default">TCS</span>
            <span className="hover:text-indigo-600 hover:scale-125 transition-all cursor-default">Infosys</span>
            <span className="hover:text-indigo-600 hover:scale-125 transition-all cursor-default">Amazon</span>
         </div>
         <div className="mt-20 pt-10 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6 px-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2026 RaidDosthi Transit Systems. All Rights Reserved.</p>
            <div className="flex gap-8">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600">Privacy Protocol</span>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600">Terms of Service</span>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default FindRides;
