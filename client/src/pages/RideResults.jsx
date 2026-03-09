import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Calendar, Clock, Users, ArrowRight, ShieldCheck, 
  Star, Info, X, Navigation, Filter, User, IdCard, FileText, 
  ChevronRight, Car, Loader2, LayoutDashboard, LogOut, TrendingUp,
  Map, Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const RideResults = () => {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState(null);
  const [bookingRide, setBookingRide] = useState(false);

  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');
  const pLat = searchParams.get('passengerLat');
  const pLng = searchParams.get('passengerLng');
  const dLat = searchParams.get('destinationLat');
  const dLng = searchParams.get('destinationLng');

  useEffect(() => {
    const fetchRides = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          from: from || '',
          to: to || '',
          date: date || '',
          passengerLat: pLat || '',
          passengerLng: pLng || '',
          destinationLat: dLat || '',
          destinationLng: dLng || ''
        }).toString();
        
        const res = await api.get(`/rides?${query}`);
        setRides(res.data.data);
      } catch (err) {
        toast.error('Failed to fetch rides');
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, [from, to, date, pLat, pLng, dLat, dLng]);

  const handleBook = async (rideId) => {
    setBookingRide(true);
    try {
      const res = await api.post(`/rides/book/${rideId}`);
      if (res.data.success) {
        toast.success('Ride booked successfully!');
        setSelectedRide(null);
        // Refresh list
        const query = new URLSearchParams({
          from: from || '',
          to: to || '',
          date: date || '',
          passengerLat: pLat || '',
          passengerLng: pLng || '',
          destinationLat: dLat || '',
          destinationLng: dLng || ''
        }).toString();
        const refreshed = await api.get(`/rides?${query}`);
        setRides(refreshed.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingRide(false);
    }
  };

  const openRideDetails = async (id) => {
    try {
      const query = new URLSearchParams({
        passengerLat: pLat || '',
        passengerLng: pLng || '',
        destinationLat: dLat || '',
        destinationLng: dLng || ''
      }).toString();
      const res = await api.get(`/rides/${id}?${query}`);
      setSelectedRide(res.data.data);
    } catch (err) {
      toast.error('Could not load ride details');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-outfit">
      {/* Search Result Mini-Navbar */}
      <nav className="sticky top-0 left-0 right-0 z-[100] bg-white border-b border-slate-200/60 shadow-sm px-6 md:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <LayoutDashboard className="text-white h-5 w-5" />
            </div>
            <span className="font-bold text-2xl tracking-tighter text-slate-800">Raid<span className="text-indigo-600">Dosthi</span></span>
          </Link>

          <div className="hidden lg:flex items-center gap-6 bg-slate-50 px-6 py-2.5 rounded-2xl border border-slate-100 italic">
             <div className="flex items-center gap-2">
                <MapPin size={16} className="text-indigo-600" />
                <span className="text-sm font-black text-slate-700">{from}</span>
             </div>
             <ChevronRight size={14} className="text-slate-300" />
             <div className="flex items-center gap-2">
                <Navigation size={16} className="text-purple-600" />
                <span className="text-sm font-black text-slate-700">{to}</span>
             </div>
             <div className="w-[1px] h-4 bg-slate-200 ml-2"></div>
             <div className="flex items-center gap-2">
                <Calendar size={16} className="text-indigo-600" />
                <span className="text-sm font-black text-slate-700">{date}</span>
             </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/find-rides" className="bg-slate-100 hover:bg-slate-200 p-2.5 rounded-xl text-slate-500 transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2">
               <Search size={16} /> New Search
            </Link>
            <button onClick={logout} className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all active:scale-95">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-20">
         <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Verified Trip <span className="text-indigo-600 italic">Connections.</span></h2>
               <p className="text-slate-600 font-bold uppercase text-[10px] tracking-[0.3em]">Showing {rides.length} available rides for your route</p>
            </div>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 h-fit">
               <button className="h-10 px-6 rounded-xl bg-white text-indigo-600 font-black text-xs shadow-sm uppercase tracking-widest flex items-center gap-2">
                  <Filter size={14} /> Filter 
               </button>
               <button className="h-10 px-6 rounded-xl text-slate-500 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-all">
                  <TrendingUp size={14} /> Low Price
               </button>
            </div>
         </div>

         {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {[1,2,3].map(i => (
               <div key={i} className="h-80 bg-slate-50 border border-slate-100 rounded-[3rem] animate-pulse relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-bl-[100px] blur-3xl"></div>
               </div>
             ))}
           </div>
         ) : rides.length === 0 ? (
           <div className="text-center py-40 flex flex-col items-center bg-white rounded-[4.5rem] border border-slate-100 shadow-2xl shadow-indigo-50">
              <div className="h-32 w-32 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-12 shadow-inner">
                 <Map className="text-slate-200" size={64} />
              </div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-4">No rides found on this date.</h3>
              <p className="text-slate-600 max-w-md font-medium text-lg leading-relaxed">
                 Try searching for a different date or nearby cities. Our network is constantly growing!
              </p>
              <Link to="/find-rides" className="mt-10 px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-indigo-100">
                 Modify Search Parameters
              </Link>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {rides.map((ride) => (
                 <motion.div
                   key={ride._id}
                   whileHover={{ y: -8 }}
                   onClick={() => openRideDetails(ride._id)}
                   className="bg-white p-8 rounded-[3.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 cursor-pointer group relative overflow-hidden transition-all hover:ring-2 hover:ring-indigo-100/50"
                 >
                   {/* Safety Badge */}
                   {ride.genderPreference !== 'any' && (
                     <div className={`absolute top-0 right-0 ${ride.genderPreference === 'female-only' ? 'bg-pink-50 text-pink-600 border-pink-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'} px-6 py-2.5 rounded-bl-[2rem] text-[9px] font-black tracking-[0.2em] flex items-center gap-2 border-l border-b uppercase z-10`}>
                       <ShieldCheck size={12} /> {ride.genderPreference.replace('-only', '')} ONLY
                     </div>
                   )}

                   <div className="flex items-center gap-5 mb-8">
                      <div className="h-16 w-16 rounded-[1.8rem] bg-[#F8FAFC] shadow-inner flex items-center justify-center text-slate-200 font-bold overflow-hidden border border-slate-100 shrink-0">
                         {ride.driver?.avatar ? <img src={ride.driver.avatar} className="object-cover w-full h-full" /> : <User size={32} />}
                      </div>
                      <div className="flex-1">
                         <h3 className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">{ride.driver?.name}</h3>
                         <div className="flex items-center gap-2 mt-1">
                            <div className="flex bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100">
                               <Star size={12} className="text-amber-500 fill-amber-500 mt-[1px] mr-1.5" />
                               <span className="text-[10px] font-black text-amber-700 italic tracking-tighter">{ride.driver?.averageRating || 'NEW'}</span>
                            </div>
                             <span className="text-[9px] font-black text-slate-500 uppercase underline decoration-slate-300 tracking-[0.1em]">{ride.driver?.totalRatings || 0} REVIEWS</span>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6 mb-10">
                      <div className="flex gap-4 items-start relative pl-6">
                         <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-gradient-to-b from-indigo-100 to-indigo-50"></div>
                         <div className="absolute left-[-4px] top-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-4 ring-indigo-50"></div>
                         <div className="absolute left-[-4px] bottom-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-4 ring-indigo-50"></div>
                         
                         <div className="flex-1 space-y-6">
                            <div>
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Origin</p>
                               <p className="font-black text-slate-800 text-sm leading-tight italic">{ride.from}</p>
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Destiny</p>
                               <p className="font-black text-slate-800 text-sm leading-tight italic">{ride.to}</p>
                            </div>
                         </div>
                      </div>
                   </div>

                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                       <div className="flex flex-col gap-1">
                          <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-2">
                            <MapPin size={10} className="text-indigo-400" />
                            <p className="text-[10px] font-black text-slate-500 italic tracking-tight">{ride.bookingDetails?.distanceToRider || 'Location N/A'}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-1 px-1">
                            <p className="text-[10px] font-black text-slate-400 italic">{ride.seatsAvailable} seats left</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 px-6 py-3 rounded-2xl shadow-xl shadow-indigo-100 group-hover:scale-110 transition-transform">
                             <p className="text-[10px] text-white/70 font-black uppercase tracking-widest mb-0.5">Your Fare</p>
                             <p className="text-2xl font-black text-white leading-none tracking-tighter italic">₹{ride.bookingDetails?.fareForPassenger || ride.price}</p>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              ))}
           </div>
         )}
      </main>

      {/* Ride Details Modal (Reused and Updated) */}
      <AnimatePresence>
        {selectedRide && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedRide(null)}
               className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
             />
             <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 40 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 40 }}
               className="bg-white w-full max-w-5xl rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden relative z-10 flex flex-col md:flex-row h-[90vh]"
             >
                {/* Details Side (Left) */}
                <div className="flex-1 p-10 md:p-16 overflow-y-auto overflow-x-hidden no-scrollbar">
                   <div className="flex items-center justify-between mb-12">
                      <div className="flex items-center gap-6">
                         <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 border border-slate-100 overflow-hidden shadow-inner ring-4 ring-slate-50">
                            {selectedRide.driver?.avatar ? <img src={selectedRide.driver.avatar} className="object-cover w-full h-full" /> : <User size={48} />}
                         </div>
                         <div>
                            <div className="flex items-center gap-3">
                               <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{selectedRide.driver?.name}</h2>
                               {selectedRide.driver?.isVerified && (
                                 <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl flex items-center gap-1.5 border border-emerald-100">
                                   <ShieldCheck className="h-4 w-4" />
                                   <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                                 </div>
                               )}
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                               <div className="flex items-center gap-1.5">
                                 <Star size={18} className="text-amber-500 fill-amber-500" />
                                 <span className="font-extrabold text-slate-600 text-lg">{selectedRide.driver?.averageRating || '0.0'}</span>
                               </div>
                               <div className="h-1 w-1 rounded-full bg-slate-500"></div>
                               <span className="text-sm font-bold text-slate-600 uppercase tracking-[.15em]">{selectedRide.driver?.totalRatings} reviews</span>
                               <div className="h-1 w-1 rounded-full bg-slate-500"></div>
                               <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100/50">
                                 <Calendar size={14} className="text-indigo-600" />
                                 <span className="text-xs font-black text-indigo-700 uppercase tracking-tight italic">
                                   {new Date(selectedRide.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                 </span>
                               </div>
                            </div>
                         </div>
                      </div>
                      <button onClick={() => setSelectedRide(null)} className="h-12 w-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-500 hover:text-red-500 transition-all hover:rotate-90">
                        <X size={24} />
                      </button>
                   </div>

                   {selectedRide.safetyMessage && (
                     <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2.5rem] text-white flex items-center gap-8 mb-12 shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-12 -translate-y-12 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                        <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                           <ShieldCheck size={36} />
                        </div>
                        <div className="relative z-10">
                           <p className="text-xl font-black italic mb-1 uppercase tracking-tight">{selectedRide.safetyMessage}</p>
                           <p className="text-indigo-100 text-sm font-bold opacity-80 italic tracking-tight font-medium">This verified vehicle is a monitored safe zone within our community protocols.</p>
                        </div>
                     </div>
                   )}

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-12">
                         <div>
                             <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[.3em] mb-8 flex items-center gap-3">
                               <div className="h-1.5 w-1.5 rounded-full bg-indigo-600"></div> JOURNEY TIMELINE
                            </h4>
                            <div className="space-y-10 relative pl-8 border-l-2 border-slate-50 ml-2">
                               <div className="relative">
                                  <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white border-4 border-indigo-600 z-10 shadow-sm"></div>
                                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[.2em] mb-1 italic">Pickup Location</p>
                                  <p className="text-xl font-extrabold text-slate-800 tracking-tight italic underline decoration-indigo-200 underline-offset-4">{selectedRide.from}</p>
                               </div>
                               <div className="relative">
                                  <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white border-4 border-purple-600 z-10 shadow-sm"></div>
                                  <p className="text-[10px] font-black text-purple-500 uppercase tracking-[.2em] mb-1 italic">Destination</p>
                                  <p className="text-xl font-extrabold text-slate-800 tracking-tight italic underline decoration-purple-200 underline-offset-4">{selectedRide.to}</p>
                               </div>
                            </div>
                         </div>
                         
                         <div>
                            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[.3em] mb-6 flex items-center gap-3">
                               <div className="h-1.5 w-1.5 rounded-full bg-indigo-600"></div> VEHICLE SPECS
                            </h4>
                            <div className="bg-[#F8FAFC] p-8 rounded-[3rem] border border-slate-100 flex items-center gap-6 shadow-inner">
                               <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-50">
                                  <Car size={32} />
                               </div>
                               <div>
                                  <p className="font-black text-slate-800 text-lg uppercase tracking-tight leading-none mb-2 italic">{selectedRide.carModel}</p>
                                  <div className="inline-flex bg-slate-200/50 px-3 py-1 rounded-lg border border-slate-300/30">
                                     <span className="text-xs font-black text-slate-500 tracking-[.2em]">{selectedRide.carNumber}</span>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-12">
                         <div>
                             <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[.3em] mb-6 flex items-center justify-between">
                               <span className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-indigo-600"></div> CO-TRAVELERS</span>
                               <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full font-black text-[10px] tracking-tight italic">{selectedRide.seatsAvailable} Free Space</span>
                            </h4>
                            <div className="bg-[#F8FAFC] p-8 rounded-[3rem] border border-slate-100 space-y-8 shadow-inner">
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-white p-5 rounded-3xl border border-slate-200/50 text-center shadow-sm">
                                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 font-outfit">Males</p>
                                     <p className="text-2xl font-black text-slate-700 italic">{selectedRide.passengerBreakdown?.male}</p>
                                  </div>
                                  <div className="bg-white p-5 rounded-3xl border border-slate-200/50 text-center shadow-sm">
                                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 font-outfit">Females</p>
                                     <p className="text-2xl font-black text-pink-500 italic">{selectedRide.passengerBreakdown?.female}</p>
                                  </div>
                               </div>
                               
                               <div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-slate-200/40">
                                  {selectedRide.riders?.map((r, i) => (
                                    <div key={i} className="group relative">
                                       <div className="w-12 h-12 rounded-2xl border-4 border-white overflow-hidden bg-slate-200 shadow-xl group-hover:scale-110 transition-transform cursor-pointer ring-1 ring-slate-100">
                                          {r.avatar ? <img src={r.avatar} className="w-full h-full object-cover" /> : <User size={24} className="m-auto mt-2.5 text-slate-500" />}
                                       </div>
                                       <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none font-bold">
                                          {r.name}
                                       </div>
                                    </div>
                                  ))}
                                  {selectedRide.riders?.length === 0 && (
                                     <div className="text-center py-4 text-slate-500 font-bold italic text-sm tracking-tight opacity-90">Be the first co-rider to join...</div>
                                  )}
                               </div>
                            </div>
                         </div>

                         <div>
                            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[.3em] mb-6 flex items-center gap-3">
                               <div className="h-1.5 w-1.5 rounded-full bg-indigo-600"></div> IDENTITY PROOF
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm group hover:border-indigo-100 transition-colors">
                                  <IdCard className="text-indigo-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
                                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Pass ID Verified</p>
                                   <p className="text-xs font-black text-slate-700 tracking-[.1em] italic break-all">{selectedRide.driver?.aadhaarNumber}</p>
                                </div>
                                <div className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm group hover:border-indigo-100 transition-colors">
                                  <FileText className="text-indigo-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
                                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">License Plate</p>
                                   <p className="text-xs font-black text-slate-700 tracking-[.1em] italic break-all">{selectedRide.driver?.licenseNumber}</p>
                                </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Reviews Section */}
                   <div className="mt-20">
                      <div className="flex items-center justify-between mb-10">
                          <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[.3em] flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600"></div> RECENT FEEDBACK
                         </h4>
                         <span className="text-xs font-bold text-indigo-600 cursor-pointer hover:underline uppercase tracking-[.2em]">Full Driver Log</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {selectedRide.driverReviews?.length > 0 ? selectedRide.driverReviews.map((rev, i) => (
                           <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -translate-y-8 translate-x-8 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-500 opacity-60"></div>
                             <div className="flex items-center gap-4 mb-5 relative z-10">
                                <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-inner">
                                   {rev.reviewer?.avatar && <img src={rev.reviewer.avatar} className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1">
                                   <p className="text-sm font-black text-slate-800 leading-none mb-1 uppercase tracking-tight italic">{rev.reviewer?.name}</p>
                                   <div className="flex gap-0.5">
                                      {[...Array(5)].map((_, star) => (
                                        <Star key={star} size={10} className={star < rev.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'} />
                                      ))}
                                   </div>
                                </div>
                                <span className="text-[9px] font-extrabold text-slate-300 uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</span>
                             </div>
                             <p className="text-sm text-slate-500 italic leading-relaxed font-medium relative z-10 px-2 border-l-2 border-indigo-50">"{rev.comment}"</p>
                           </div>
                         )) : (
                            <div className="col-span-2 text-center py-24 bg-slate-50/50 rounded-[3.5rem] border border-dashed border-slate-200">
                               <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                                  <Sparkles className="text-slate-200" size={24} />
                               </div>
                               <p className="text-slate-400 font-extrabold text-[10px] tracking-[.3em] uppercase">No verified co-rider logs yet</p>
                            </div>
                         )}
                      </div>
                   </div>
                </div>

                {/* Sticky Right Side */}
                <div className="w-full md:w-[380px] bg-slate-900 p-8 md:p-10 text-white flex flex-col justify-between relative overflow-y-auto overflow-x-hidden no-scrollbar">
                   <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 to-slate-900 -z-0"></div>
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                   
                   <div className="relative z-10">
                      <div className="mb-8">
                         <p className="text-indigo-300/60 font-black text-[10px] uppercase tracking-[0.4em] mb-4 font-outfit">Smart Calculated Fare</p>
                         <h3 className="text-5xl md:text-6xl font-black tracking-tighter leading-none flex items-start italic">
                            <span className="text-2xl mt-2 mr-1 not-italic">₹</span>
                            {selectedRide.dynamicFare || selectedRide.price}
                         </h3>
                         <div className="flex items-center gap-3 mt-4 ml-1">
                            <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Distance to Pickup:</p>
                             <p className="text-indigo-400 font-black text-xs italic">{selectedRide.bookingDetails?.distanceToRider || 'Detecting...'}</p>
                         </div>
                         <div className="flex items-center gap-3 mt-2 ml-1">
                            <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Driver Security:</p>
                            <p className="text-emerald-400 font-black text-xs italic uppercase tracking-tighter">{selectedRide.driverGender} DRIVER</p>
                         </div>
                      </div>

                      <div className="space-y-4 bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md">
                         <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-black uppercase tracking-widest text-[8px]">Platform Tax</span>
                            <span className="font-black text-indigo-400 italic">OFF</span>
                         </div>
                         <div className="h-[1px] bg-white/5"></div>
                         <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-black uppercase tracking-widest text-[8px]">Road Insurance</span>
                            <span className="text-emerald-400 font-black italic">VERIFIED</span>
                         </div>
                         <div className="h-[1px] bg-white/5"></div>
                         <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-black uppercase tracking-widest text-[8px]">Support Log</span>
                            <span className="text-indigo-400 font-black italic">ACTIVE 24/7</span>
                         </div>
                      </div>
                   </div>

                   <div className="relative z-10 space-y-6 pt-8">
                      <div className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                         <div className="h-10 w-10 bg-indigo-600/20 rounded-xl flex items-center justify-center shrink-0 border border-indigo-500/20">
                            <Info size={18} className="text-indigo-300" />
                         </div>
                         <p className="text-[11px] text-slate-500 leading-relaxed font-bold tracking-tight">
                            Identity verification required at pickup. <span className="text-indigo-300 underline decoration-indigo-400/30">Read Cancellation Terms.</span>
                         </p>
                      </div>

                      <button
                        onClick={() => handleBook(selectedRide._id)}
                        disabled={bookingRide || selectedRide.seatsAvailable === 0}
                        className="w-full bg-indigo-600 hover:bg-white hover:text-indigo-900 disabled:bg-slate-800 disabled:text-slate-600 text-white py-5 rounded-3xl font-black text-lg shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)] transition-all flex items-center justify-center gap-4 active:scale-95 group uppercase tracking-tight italic"
                      >
                        {bookingRide ? <Loader2 className="animate-spin" /> : (
                          <>
                            Join Journey 
                            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                          </>
                        )}
                      </button>
                      <div className="flex items-center justify-center gap-2 opacity-20">
                         <ShieldCheck size={14} />
                         <span className="text-[9px] font-black uppercase tracking-[.5em]">Global Transit Protocol V1.0</span>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RideResults;
