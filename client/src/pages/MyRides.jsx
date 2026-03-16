import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, Calendar, Clock, MapPin, Users, ChevronRight, 
  AlertCircle, CheckCircle2, XCircle, ArrowRight,
  Plus, Loader2, Trash2, ShieldCheck, Timer,
  Shield, Mail, Ban
} from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import CancellationModal from '../components/CancellationModal';

const MyRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRideForCancel, setSelectedRideForCancel] = useState(null);
  const [appealInfo, setAppealInfo] = useState(null);
  const navigate = useNavigate();

  const fetchRides = async () => {
    try {
      const { data } = await api.get('/rides/my-offers');
      setRides(data.data);
      // Update last view time
      await api.patch('/notifications/last-rides-view');
    } catch (error) {
      toast.error('Failed to fetch your rides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const handleCancelIntent = (ride) => {
    setSelectedRideForCancel(ride);
  };

  const processCancellation = async (reason, otherReason) => {
    try {
      const { data } = await api.patch(`/rides/${selectedRideForCancel._id}/cancel`, {
        reason,
        otherReason
      });
      
      if (data.penalty === 'strike') {
        setAppealInfo({
          ...data.appeal,
          rideId: selectedRideForCancel._id
        });
      } else {
        toast.success(data.message);
      }
      
      fetchRides();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to cancel ride');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      available: "bg-emerald-50 text-emerald-600 border-emerald-100",
      full: "bg-amber-50 text-amber-600 border-amber-100",
      expired: "bg-slate-50 text-slate-500 border-slate-100",
      cancelled: "bg-rose-50 text-rose-600 border-rose-100",
      completed: "bg-indigo-50 text-indigo-600 border-indigo-100"
    };
    
    const labels = {
      available: "🟢 ACTIVE",
      full: "🟡 FULL",
      expired: "🔴 EXPIRED",
      cancelled: "⚫ CANCELLED",
      completed: "✅ COMPLETED"
    };

    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${styles[status] || styles.expired}`}>
        {labels[status] || status.toUpperCase()}
      </span>
    );
  };

  const activeRides = rides.filter(r => ['available', 'full'].includes(r.computedStatus));
  const pastRides = rides.filter(r => !['available', 'full'].includes(r.computedStatus));

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">My Offered <span className="text-indigo-600">Rides</span></h1>
            <p className="text-slate-500 font-medium tracking-tight">Manage your rides and stay connected with your passengers.</p>
          </div>
          <Link 
            to="/offer-ride" 
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-sm hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100/50 active:scale-95 self-start"
          >
            <Plus size={18} /> Offer New Ride
          </Link>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Ride Data...</p>
          </div>
        ) : rides.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100 shadow-sm"
          >
            <div className="bg-indigo-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
               <Car size={32} className="text-indigo-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">You haven't created any rides yet</h2>
            <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">Start sharing your journey and help the community travel safer and cheaper.</p>
            <Link to="/offer-ride" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all">
              Create My First Ride
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-16">
            {/* Active Rides */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-emerald-100 p-2 rounded-lg"><Timer size={18} className="text-emerald-600" /></div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Active Journeys <span className="text-slate-400 ml-1">({activeRides.length})</span></h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {activeRides.map(ride => (
                  <RideCard key={ride._id} ride={ride} onCancel={() => handleCancelIntent(ride)} isPast={false} />
                ))}
              </div>
            </section>

            {/* Past Rides */}
            {pastRides.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                   <div className="bg-slate-100 p-2 rounded-lg"><CheckCircle2 size={18} className="text-slate-500" /></div>
                   <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Journey Archive <span className="text-slate-400 ml-1">({pastRides.length})</span></h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 grayscale">
                   {pastRides.map(ride => (
                     <RideCard key={ride._id} ride={ride} isPast={true} />
                   ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <CancellationModal
        isOpen={!!selectedRideForCancel}
        onClose={() => setSelectedRideForCancel(null)}
        onConfirm={processCancellation}
        passengerCount={selectedRideForCancel?.totalBooked || 0}
        rideDate={selectedRideForCancel?.date}
        rideTime={selectedRideForCancel?.time}
      />

      {/* Strike Appeal Modal */}
      <AnimatePresence>
        {appealInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6"
          >
             <motion.div
               initial={{ scale: 0.95, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               className="bg-white rounded-[3.5rem] w-full max-w-xl overflow-hidden shadow-2xl relative"
             >
                <div className="bg-rose-600 p-8 text-white flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <AlertTriangle className="animate-bounce" size={32} />
                      <h2 className="text-3xl font-black tracking-tighter italic">STRIKE ADDED</h2>
                   </div>
                   <button onClick={() => setAppealInfo(null)} className="h-10 w-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-colors">
                      <XCircle size={20} />
                   </button>
                </div>

                <div className="p-10 space-y-8">
                   <div className="space-y-4">
                      <p className="text-xl font-black text-slate-900">{appealInfo.message}</p>
                      <p className="text-slate-500 font-medium italic">Believe this is unfair? Every strike is manually reviewable within 48 hours for system fairness.</p>
                   </div>

                   {appealInfo.appealLimitReached ? (
                      <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 flex items-center gap-4">
                         <Ban className="text-rose-500" size={24} />
                         <div>
                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none mb-1">Status</p>
                            <p className="text-sm font-black text-rose-600 italic">APPEAL LIMIT REACHED FOR THIS YEAR</p>
                         </div>
                      </div>
                   ) : (
                      <div className="bg-indigo-50 p-8 rounded-[3rem] border border-indigo-100 flex flex-col gap-6">
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                               <Mail size={20} />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Email Appeal Portal</p>
                               <p className="font-black text-slate-800 italic uppercase">support.raiddhosthi@gmail.com</p>
                            </div>
                         </div>
                         
                         <div className="space-y-3 bg-white/60 p-6 rounded-2xl text-[11px] font-black text-slate-500 uppercase tracking-widest border border-white">
                            <p className="flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span> Include Ride ID: {appealInfo.rideId}</p>
                            <p className="flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span> Mention Your Registered Email</p>
                            <p className="flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span> Clear explanation of reason</p>
                         </div>
                         
                         <div className="flex items-center justify-between pt-2 border-t border-indigo-100/50">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Deadline: 48 Hours</span>
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Team Response: 24h</span>
                         </div>
                      </div>
                   )}

                   <button 
                     onClick={() => setAppealInfo(null)}
                     className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                   >
                     Understood
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RideCard = ({ ride, onCancel, isPast }) => {
  const navigate = useNavigate();
  const date = new Date(ride.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (isPast) return;
    const interval = setInterval(() => {
      const now = new Date();
      const expiry = new Date(ride.expiresAt);
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('EXPIRED');
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}m ${secs}s left`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [ride.expiresAt, isPast]);

  const getStatusBadge = (status) => {
    const styles = {
      available: "bg-emerald-50 text-emerald-600 border-emerald-100",
      full: "bg-amber-50 text-amber-600 border-amber-100",
      expired: "bg-slate-50 text-slate-500 border-slate-100",
      cancelled: "bg-rose-50 text-rose-600 border-rose-100",
      completed: "bg-indigo-50 text-indigo-600 border-indigo-100"
    };
    
    const labels = {
      available: "🟢 ACTIVE",
      full: "🟡 FULL",
      expired: "🔴 EXPIRED",
      cancelled: "⚫ CANCELLED",
      completed: "✅ COMPLETED"
    };

    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${styles[status] || styles.expired}`}>
        {labels[status] || status.toUpperCase()}
      </span>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden relative"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4">
           <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
             <Car className="text-indigo-600" size={24} />
           </div>
           <div>
              <p className="text-slate-800 font-black text-lg leading-tight mb-1">{ride.carModel}</p>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase tracking-widest">{ride.carNumber}</span>
                 {getStatusBadge(ride.computedStatus)}
                 {!isPast && timeLeft !== 'EXPIRED' && (
                    <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 animate-pulse">
                       {timeLeft}
                    </span>
                 )}
              </div>
           </div>
        </div>
        <div className="text-right">
           <p className="text-2xl font-black text-indigo-600 leading-none mb-1">₹{ride.price}</p>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PER SEAT</p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
         <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1 mt-1">
               <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-50"></div>
               <div className="w-0.5 h-10 bg-slate-100"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
            </div>
            <div className="flex-1 space-y-4">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">PICKUP</p>
                  <p className="text-slate-700 font-bold text-sm truncate">{ride.from}</p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">DESTINATION</p>
                  <p className="text-slate-700 font-bold text-sm truncate">{ride.to}</p>
               </div>
            </div>
         </div>
      </div>

      <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl mb-8">
         <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-600">{date}</span>
         </div>
         <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
            <Clock size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-600">{ride.time}</span>
         </div>
         <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
            <Users size={16} className="text-slate-400" />
            <div className="flex gap-1">
              {Array.from({ length: ride.totalBooked + ride.seatsRemaining }).map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < ride.totalBooked ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
              ))}
            </div>
            <span className="text-xs font-bold text-slate-600 ml-1">{ride.totalBooked} Team</span>
         </div>
      </div>

      <div className="flex gap-3 mt-auto relative z-10">
         <button 
           onClick={() => navigate(`/my-rides/${ride._id}/passengers`)}
           className="flex-1 bg-white border-2 border-slate-900 text-slate-900 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2"
         >
           <Users size={16} /> View Passengers
         </button>
         {!isPast && (
           <button 
             onClick={onCancel}
             className="bg-rose-50 text-rose-600 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all border border-rose-100 flex items-center gap-2"
           >
             <Trash2 size={16} /> Cancel
           </button>
         )}
      </div>

      {/* Expiry countdown indicator */}
      {!isPast && ride.computedStatus !== 'full' && (
        <div className="absolute top-0 right-0 p-4">
           {/* Custom progress or indicator can go here */}
        </div>
      )}
    </motion.div>
  );
};

export default MyRides;
