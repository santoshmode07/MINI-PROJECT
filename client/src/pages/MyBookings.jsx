import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, Navigation, User, ShieldCheck, 
  Search, LogOut, LayoutDashboard, ChevronRight, ArrowRight,
  TrendingUp, Star, Loader2, X, AlertCircle, Sparkles, Map,
  Phone, CreditCard, CheckCircle, Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MyBookings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rides/my-bookings');
      setBookings(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (rideId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    setCancellingId(rideId);
    try {
      const res = await api.put(`/rides/cancel/${rideId}`);
      if (res.data.success) {
        toast.success('Booking cancelled successfully');
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-outfit">
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
            <Link to="/offer-ride" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Offer Ride</Link>
            <Link to="/bookings" className="text-sm font-bold text-indigo-600 relative after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600">My Bookings</Link>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-3 bg-white py-1.5 md:py-2 px-3 md:px-4 rounded-2xl shadow-sm border border-slate-100 shrink-0">
               <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg md:rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold ring-2 ring-indigo-50 shrink-0">
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

      <main className="flex-1 pt-32 md:pt-40 pb-24 px-6 relative overflow-hidden">
        {/* Background Decorative Patterns */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-50/50 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
             <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-indigo-100">
               <ShieldCheck size={14} /> ACTIVE TRANSIT PROTOCOLS
             </span>
             <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
               Your Upcoming <span className="text-indigo-600 italic">Journeys.</span>
             </h1>
             <p className="text-slate-600 text-lg font-medium max-w-xl">Manage your verified bookings, track your drivers, and travel with peace of mind.</p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[1, 2].map(i => (
                <div key={i} className="h-96 bg-white rounded-[3.5rem] p-10 shadow-2xl shadow-indigo-100/30 animate-pulse border border-slate-100">
                   <div className="flex gap-4 mb-8">
                     <div className="h-20 w-20 bg-slate-50 rounded-3xl" />
                     <div className="flex-1 space-y-4">
                        <div className="h-4 w-1/3 bg-slate-50 rounded-lg" />
                        <div className="h-4 w-1/2 bg-slate-50 rounded-lg" />
                     </div>
                   </div>
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="text-center py-40 flex flex-col items-center bg-white rounded-[4.5rem] border border-slate-100 shadow-2xl shadow-indigo-50/50"
            >
               <div className="h-32 w-32 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-12 shadow-inner">
                  <Map className="text-slate-200" size={64} />
               </div>
               <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-4">No active bookings found.</h3>
               <p className="text-slate-600 max-w-md font-medium text-lg leading-relaxed px-6">
                  You haven't reserved any seats yet. Join our global transit community today and save on travel costs.
               </p>
               <Link to="/find-rides" className="mt-10 px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl shadow-indigo-200 flex items-center gap-3 active:scale-95">
                  Explore Verified Rides <ArrowRight size={20} />
               </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               {bookings.map((ride) => (
                 <motion.div
                    key={ride._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[4rem] p-8 md:p-12 shadow-2xl shadow-slate-200/60 border border-slate-100 relative group overflow-hidden flex flex-col h-full"
                 >
                   {/* Background Glow */}
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 -z-0"></div>
                   
                   <div className="relative z-10 flex flex-col md:flex-row gap-8 mb-12">
                      <div className="h-24 w-24 rounded-[2.5rem] bg-slate-50 border-2 border-white shadow-xl flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-110 transition-transform ring-4 ring-indigo-50/50">
                         {ride.driver?.profilePhoto ? <img src={ride.driver.profilePhoto} className="w-full h-full object-cover" /> : <User size={48} className="text-slate-200" />}
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{ride.driver?.name}</h3>
                            {ride.driver?.isVerified && (
                              <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl flex items-center gap-1.5 border border-emerald-100">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Global Verified</span>
                              </div>
                            )}
                         </div>
                         <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100/50">
                               <Star size={16} className="text-amber-500 fill-amber-500" />
                               <span className="font-black text-amber-700 text-sm italic">{ride.driver?.averageRating || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100/50 text-indigo-600">
                               <Phone size={14} />
                               <span className="font-black text-xs italic tracking-tight">{ride.driver?.phone || '+91 0000 0000'}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                         <div className="bg-[#F8FAFC] p-4 rounded-3xl border border-slate-100 text-center shadow-sm w-full md:w-32">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Pass ID</p>
                             <p className="text-lg font-black text-slate-800 italic leading-none font-outfit">₹{ride.userBooking?.fareCharged}</p>
                         </div>
                         <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest italic w-full md:w-auto shadow-sm">
                            <CheckCircle size={14} /> Confirmed
                         </div>
                      </div>
                   </div>

                   <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                      <div className="space-y-8">
                         <div className="flex gap-4">
                            <div className="mt-1 h-5 w-5 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
                               <MapPin size={12} />
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Authorized Pickup</p>
                               <p className="text-sm font-black text-slate-800 leading-tight italic line-clamp-2">{ride.userBooking?.boardingPoint?.address}</p>
                            </div>
                         </div>
                         <div className="flex gap-4">
                            <div className="mt-1 h-5 w-5 bg-purple-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-100">
                               <Navigation size={12} />
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Dropoff Point</p>
                               <p className="text-sm font-black text-slate-800 leading-tight italic line-clamp-2">{ride.userBooking?.dropoffPoint?.address}</p>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-8 pl-0 md:pl-8 border-l-0 md:border-l border-slate-100">
                         <div className="flex gap-4">
                            <div className="mt-1 h-5 w-5 bg-slate-800 rounded-lg flex items-center justify-center text-white shrink-0">
                               <Calendar size={12} />
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Trip Schedule</p>
                               <p className="text-sm font-black text-slate-800 leading-tight italic">{formatDate(ride.date)}</p>
                            </div>
                         </div>
                         <div className="flex gap-4">
                            <div className="mt-1 h-5 w-5 bg-slate-800 rounded-lg flex items-center justify-center text-white shrink-0">
                               <Clock size={12} />
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Departure Time</p>
                               <p className="text-sm font-black text-slate-800 leading-tight italic">{ride.time}</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="relative z-10 mt-auto pt-8 border-t border-slate-50 flex flex-col md:flex-row items-center gap-6 justify-between">
                      <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 w-full md:w-auto">
                         <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-50">
                            <Car size={18} />
                         </div>
                         <div className="flex flex-col">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Assigned Vehicle</p>
                            <p className="text-xs font-black text-slate-700 italic">{ride.carModel} • <span className="text-indigo-600">{ride.carNumber}</span></p>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full md:w-auto">
                         <button
                            onClick={() => handleCancelBooking(ride._id)}
                            disabled={cancellingId === ride._id}
                            className="flex-1 md:flex-none h-14 px-8 rounded-2xl border-2 border-slate-100 text-slate-400 font-extrabold text-xs uppercase tracking-widest hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-all flex items-center justify-center gap-2 group/cancel"
                         >
                            {cancellingId === ride._id ? <Loader2 className="animate-spin h-4 w-4" /> : (
                               <>
                                 <AlertCircle size={14} className="group-hover/cancel:animate-bounce" />
                                 Cancel Trip
                               </>
                            )}
                         </button>
                         <button className="flex-1 md:flex-none h-14 px-8 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 group/nav active:scale-95">
                            Boarding Pass <ArrowRight size={16} className="group-hover/nav:translate-x-1 transition-transform" />
                         </button>
                      </div>
                   </div>
                 </motion.div>
               ))}
            </div>
          )}
        </div>
      </main>

      {/* Security Footer */}
      <footer className="py-12 border-t border-slate-200/60 bg-white">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                   <ShieldCheck size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none mb-1">Transit Shield Logged</p>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[.2em]">Every trip is monitored for ID verification safety.</p>
                </div>
             </div>
             <div className="flex gap-10">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 cursor-pointer transition-colors">Emergency Protocol</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 cursor-pointer transition-colors">Ride Cancellation Policy</span>
             </div>
          </div>
      </footer>
    </div>
  );
};

export default MyBookings;
