import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Calendar, Clock, MapPin, Navigation, 
  Trash2, AlertTriangle, Loader2, Search, Car,
  Sparkles, ShieldCheck, Star, Phone, CreditCard, Banknote
} from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import ReviewModal from '../components/ReviewModal';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (rideId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Recovery of seat is not guaranteed.')) return;
    
    setCancellingId(rideId);
    try {
      await api.delete(`/bookings/${rideId}`);
      toast.success('Booking cancelled successfully');
      setBookings(prev => prev.filter(b => b.ride._id !== rideId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancellingId(null);
    }
  };

  const getRideStatus = (rideDate, rideTime) => {
    const departure = new Date(`${new Date(rideDate).toISOString().split('T')[0]}T${rideTime}`);
    const now = new Date();
    
    if (now < departure) return 'UPCOMING';
    // If it's within 6 hours of departure, consider it active
    const sixHoursLater = new Date(departure.getTime() + 6 * 60 * 60 * 1000);
    if (now < sixHoursLater) return 'ACTIVE';
    
    return 'COMPLETED';
  };

  const handleOpenReview = (driver) => {
    setSelectedDriver(driver);
    setShowReviewModal(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-outfit selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-50/50 rounded-full blur-[100px] translate-y-1/2 translate-x-1/2"></div>

        <div className="max-w-4xl mx-auto w-full relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
             <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-4 border border-indigo-100">
               <History size={14} /> My Journey Ledger
             </span>
             <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic">
               Current <span className="text-indigo-600 underline decoration-4 underline-offset-8">Bookings.</span>
             </h1>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-24 bg-white rounded-[3.5rem] shadow-2xl shadow-indigo-100/50 border border-white mt-12">
               <Loader2 className="h-16 w-16 animate-spin text-indigo-500 mb-6" />
               <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Scanning Ledger...</p>
            </div>
          ) : bookings.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-12 md:p-24 rounded-[3.5rem] shadow-2xl shadow-indigo-100/50 border border-white text-center flex flex-col items-center"
            >
               <div className="h-32 w-32 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-slate-100 shadow-sm">
                  <Navigation size={56} className="text-slate-300 rotate-45" />
               </div>
               <h3 className="text-2xl font-black text-slate-800 tracking-tighter leading-tight mb-4">No Active Bookings found.</h3>
               <p className="text-slate-500 font-medium max-w-sm mb-10 leading-relaxed uppercase tracking-tight text-xs">Your upcoming travel list is empty. Start a search to find your next adventure buddy.</p>
               <Link to="/find-ride" className="bg-indigo-600 hover:bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 active:scale-95 group">
                  EXPLORE RIDES <Sparkles className="inline ml-2 group-hover:rotate-12 transition-transform" />
               </Link>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {bookings.map((b, i) => (
                  <motion.div
                    key={b.ride._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-8 md:p-10 rounded-[3.5rem] shadow-2xl shadow-indigo-100/30 border border-white group relative overflow-hidden hover:scale-[1.01] transition-all"
                  >
                    {/* Status Badge */}
                    <div className="absolute top-8 right-8 flex items-center gap-3">
                       {getRideStatus(b.ride.date, b.ride.time) === 'COMPLETED' ? (
                          <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm bg-slate-100 text-slate-500 border border-slate-200">
                            ✨ JOURNEY ARCHIVED
                          </span>
                       ) : getRideStatus(b.ride.date, b.ride.time) === 'ACTIVE' ? (
                          <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm bg-emerald-50 text-emerald-600 border border-emerald-100">
                            ✅ ACTIVE JOURNEY
                          </span>
                       ) : (
                          <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm bg-indigo-50 text-indigo-600 border border-indigo-100">
                            🕒 UPCOMING TRIP
                          </span>
                       )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                      {/* Left Side: Ride Core Info */}
                      <div className="space-y-8">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Navigation size={12} className="text-indigo-600 rotate-45" /> Journey Path
                          </p>
                          <div className="space-y-2">
                             <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter italic group-hover:text-indigo-600 transition-colors">
                                {b.ride.from} <span className="text-indigo-400">→</span> {b.ride.to}
                             </h4>
                             <div className="flex items-center gap-6 mt-4">
                               <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                                  <Calendar size={14} className="text-indigo-500" />
                                  <span className="text-[11px] font-black tracking-tight text-slate-700">{new Date(b.ride.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                               </div>
                               <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                                  <Clock size={14} className="text-indigo-500" />
                                  <span className="text-[11px] font-black tracking-tight text-slate-700">{b.ride.time}</span>
                               </div>
                             </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Boarding & Drop-off Points</p>
                          <div className="space-y-6 relative ml-3">
                             <div className="absolute left-[-13px] top-1.5 bottom-1.5 w-0.5 bg-dashed border-l-2 border-slate-100"></div>
                             
                             <div className="flex items-start gap-3 relative">
                                <div className="h-2 w-2 rounded-full bg-indigo-600 mt-1.5 relative z-10 shadow-[0_0_0_4px_rgba(79,70,229,0.1)]"></div>
                                <div>
                                   <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Pickup Address</p>
                                   <p className="text-xs font-bold text-slate-700 line-clamp-1">{b.booking.boardingPoint.address}</p>
                                </div>
                             </div>

                             <div className="flex items-start gap-3 relative">
                                <div className="h-2 w-2 rounded-full bg-rose-500 mt-1.5 relative z-10 shadow-[0_0_0_4px_rgba(244,63,94,0.1)]"></div>
                                <div>
                                   <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Your Drop-off</p>
                                   <p className="text-xs font-bold text-slate-700 line-clamp-1">{b.booking.dropoffPoint.address}</p>
                                </div>
                             </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Driver & Fare Info */}
                      <div className="space-y-8 md:pl-8 md:border-l border-slate-50">
                         {/* Driver Snapshot */}
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Verification Shield — Driver</p>
                            <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-100 group/driver hover:bg-white hover:shadow-xl transition-all">
                                {b.ride.driver.profilePhoto ? (
                                  <img src={b.ride.driver.profilePhoto} className="h-16 w-16 rounded-2xl object-cover border-2 border-white shadow-lg" />
                                ) : (
                                  <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black italic border-2 border-white shadow-lg uppercase">{b.ride.driver.name[0]}</div>
                                )}
                                <div>
                                   <h5 className="text-sm font-black text-slate-800 tracking-tight italic group-hover/driver:text-indigo-600 transition-colors uppercase">{b.ride.driver.name}</h5>
                                   <div className="flex items-center gap-3 mt-1">
                                      <div className="flex items-center gap-1 text-amber-500">
                                         <Star size={10} fill="currentColor" />
                                         <span className="text-[10px] font-black">{b.ride.driver.averageRating || 5.0}</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-slate-400">
                                         <ShieldCheck size={10} className="text-emerald-500" />
                                         <span className="text-[9px] font-bold uppercase tracking-widest">Verified</span>
                                      </div>
                                   </div>
                                   <div className="mt-2 text-indigo-500 flex items-center gap-1.5">
                                      <Phone size={10} />
                                      <span className="text-[10px] font-black">+91 {b.ride.driver.phone}</span>
                                   </div>
                                </div>
                            </div>
                         </div>

                         {/* Fare & Vehicle */}
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                               <div className="absolute top-0 right-0 h-12 w-12 bg-white/10 rounded-full blur-xl"></div>
                               <p className="text-[9px] font-black text-indigo-100 uppercase tracking-widest">FARE PAID</p>
                               <p className="text-2xl font-black italic">₹{b.booking.fareCharged}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">PAYMENT</p>
                               <div className="flex items-center gap-1.5 mt-1 font-black italic text-xs uppercase italic">
                                  {b.booking.paymentMethod === 'online' ? <CreditCard size={14} className="text-emerald-400" /> : <Banknote size={14} className="text-amber-400" />}
                                  {b.booking.paymentMethod}
                               </div>
                            </div>
                         </div>

                         <div className="pt-4">
                            {getRideStatus(b.ride.date, b.ride.time) === 'COMPLETED' ? (
                               <button 
                                 onClick={() => handleOpenReview(b.ride.driver)}
                                 className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95"
                               >
                                 <Star size={16} fill="currentColor" /> SHARE YOUR FEEDBACK
                               </button>
                             ) : getRideStatus(b.ride.date, b.ride.time) === 'ACTIVE' ? (
                               <div className="w-full h-14 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 cursor-not-allowed">
                                  <AlertTriangle size={16} /> Ride Started — Protection Active
                               </div>
                             ) : (
                               <button 
                                 onClick={() => handleCancelBooking(b.ride._id)}
                                 disabled={cancellingId === b.ride._id}
                                 className="w-full h-14 bg-white border border-rose-100 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 hover:bg-rose-500 hover:text-white"
                               >
                                 {cancellingId === b.ride._id ? <Loader2 className="animate-spin" size={16} /> : <><Trash2 size={16} /> Cancel Trip</>}
                               </button>
                             )}
                         </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <ReviewModal 
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        driver={selectedDriver}
      />
    </div>
  );
};

export default MyBookings;
