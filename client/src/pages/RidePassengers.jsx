import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Phone, MapPin, Users, Calendar, Clock, 
  ShieldCheck, Star, CheckCircle2, Share2,
  AlertTriangle, Layout, Banknote, CreditCard, Wallet, ArrowRight, User
} from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import ReviewModal from '../components/ReviewModal';

const RidePassengers = () => {
  const { rideId } = useParams();
  const [ride, setRide] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const rideRes = await api.get(`/rides/${rideId}`);
      setRide(rideRes.data.data);
      
      const passRes = await api.get(`/bookings/ride/${rideId}`);
      setPassengers(passRes.data.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch passenger details');
      if (error?.response?.status === 403) navigate('/my-rides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [rideId, navigate]);

  const handleDropoff = async (passengerId) => {
    try {
      await api.post(`/dropoff/driver/${rideId}/${passengerId}`);
      toast.success('Passenger marked as dropped off');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark dropoff');
    }
  };

  if (loading) return (
     <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Verifying Roster...</p>
     </div>
  );

  if (!ride) return null;

  const date = new Date(ride.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const confirmedCount = passengers.length;
  
  const totalExpectedNet = passengers.reduce((sum, b) => sum + (b.totalDriverEarnings || (b.fareCharged * 0.8)), 0);
  const currentVerifiedNet = passengers
    .filter(p => p.boardingStatus === 'arrived')
    .reduce((acc, p) => acc + (p.totalDriverEarnings || (p.fareCharged * 0.8)), 0);

  const displayProfit = (ride.status === 'ongoing' || ride.status === 'completed') ? currentVerifiedNet : totalExpectedNet;
  const profitLabel = ride.status === 'completed' 
    ? 'Final Total Earnings' 
    : ride.status === 'ongoing' 
      ? 'Verified Profit' 
      : 'Net Expected Profit';

  const handleOpenReview = (passenger) => {
    setSelectedPassenger(passenger);
    setShowReviewModal(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-24">
        <div className="flex items-center justify-between mb-8">
           <Link to="/my-rides" className="inline-flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-all">
             <ArrowLeft size={14} /> Back to Fleet
           </Link>
           <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Live • Encrypted</p>
           </div>
        </div>

        {/* 🏆 DRIVER DASHBOARD */}
        <section className="mb-10">
           <div className="bg-slate-950 rounded-[3rem] p-8 md:p-12 text-white relative shadow-[0_32px_80px_-20px_rgba(15,23,42,0.6)] border border-slate-800 overflow-hidden">
             <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
             <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-6">
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        ride.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : ride.status === 'ongoing'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                         {ride.status === 'completed' ? '✓ Ledger Closed' : ride.status === 'ongoing' ? '🚢 In Transit' : '⏱️ Boarding Phase'}
                      </div>
                      <div className="bg-slate-800/50 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-700">
                         {ride.carModel} • {ride.carNumber}
                      </div>
                   </div>

                   <div className="flex items-center gap-8 mb-10">
                      <div className="space-y-1">
                         <h1 className="text-3xl md:text-5xl font-black tracking-tighter italic uppercase leading-none">{ride.from.split(',')[0]}</h1>
                         <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest truncate max-w-[200px]">{ride.from.split(',').slice(1).join(',')}</p>
                      </div>
                      <div className="h-0.5 w-12 bg-slate-800 relative">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2">
                             <ArrowRight size={14} className="text-slate-500" />
                         </div>
                      </div>
                      <div className="space-y-1">
                         <h1 className="text-3xl md:text-5xl font-black tracking-tighter italic uppercase text-indigo-400 leading-none">{ride.to.split(',')[0]}</h1>
                         <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest truncate max-w-[200px]">{ride.to.split(',').slice(1).join(',')}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
                      <div className="space-y-2">
                         <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={10} className="text-indigo-400" /> DEPARTURE
                         </div>
                         <p className="text-base font-black italic">{ride.time}</p>
                      </div>
                      <div className="space-y-2">
                         <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Users size={10} className="text-emerald-400" /> MANIFEST
                         </div>
                         <p className="text-base font-black italic">{confirmedCount} Pk</p>
                      </div>
                      <div className="space-y-2">
                         <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Banknote size={10} className="text-amber-400" /> FARE INDEX
                         </div>
                         <p className="text-base font-black italic">₹{ride.price}</p>
                      </div>
                      <div className="space-y-2">
                         <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={10} className="text-indigo-400" /> DATE
                         </div>
                         <p className="text-base font-black italic">{date}</p>
                      </div>
                   </div>
                </div>

                <div className="lg:w-72 flex flex-col gap-4">
                   <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-7 rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] border border-indigo-400/30 relative group overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="relative z-10">
                         <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em]">{profitLabel}</p>
                            <Banknote size={16} className="text-indigo-200" />
                         </div>
                         <div className="flex items-baseline gap-2">
                            <span className="text-sm font-black text-indigo-200">₹</span>
                            <h2 className="text-5xl font-black tracking-tighter italic">{Math.round(displayProfit)}</h2>
                         </div>
                      </div>
                   </div>

                   {ride.status === 'completed' ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 py-4 px-6 rounded-2xl flex items-center justify-center gap-3">
                         <CheckCircle2 size={16} className="text-emerald-500" />
                         <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">LEDGER FINALIZED</span>
                      </div>
                   ) : (
                      <Link 
                         to={`/my-rides/${rideId}/boarding`}
                         className="bg-white text-slate-950 hover:bg-slate-50 py-4 px-6 rounded-3xl text-[10px] font-black uppercase tracking-widest text-center transition-all shadow-xl flex items-center justify-center gap-3 group active:scale-[0.98]"
                      >
                         <Layout size={16} className="group-hover:rotate-12 transition-transform" /> 
                         Boarding Terminal
                      </Link>
                   )}
                </div>
             </div>
           </div>
        </section>

        {/* 👥 PASSENGER ROSTER */}
        <section className="space-y-12">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
              <div className="space-y-2">
                 <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-indigo-500 rounded-full"></div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">Manifest</h2>
                 </div>
                 <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] ml-4">Verified identities on board</p>
              </div>
              <div className="flex items-center bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                 <div className="px-8 py-3 text-center border-r border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">OCCUPIED</p>
                    <p className="text-2xl font-black text-slate-900 italic leading-none">{confirmedCount}</p>
                 </div>
                 <div className="px-8 py-3 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AVAILABLE</p>
                    <p className="text-2xl font-black text-indigo-600 italic leading-none">{ride.seatsAvailable}</p>
                 </div>
              </div>
           </div>

           {passengers.length === 0 ? (
              <div className="bg-white rounded-[4rem] p-24 text-center border border-slate-100 shadow-sm">
                 <Users size={80} className="text-slate-200 mx-auto mb-8" />
                 <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tighter uppercase italic">Empty Manifest</h3>
                 <p className="text-slate-400 font-medium italic">Your route is live! Passengers will appear here after they confirm or book their journey.</p>
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2 pb-12">
                 {passengers.map((booking) => (
                    <PassengerCard 
                      key={booking._id} 
                      booking={booking} 
                      rideStatus={ride.status}
                      onDropoff={() => handleDropoff(booking.passenger._id)}
                      onRate={() => handleOpenReview(booking.passenger)}
                    />
                 ))}
              </div>
           )}
        </section>
      </main>

      <ReviewModal 
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        rideId={rideId}
        subject={selectedPassenger}
      />
    </div>
  );
};

const PassengerCard = ({ booking, rideStatus, onDropoff, onRate }) => {
  const p = booking.passenger;
  const isVerified = booking.boardingStatus === 'arrived';
  const isRefunded = booking.boardingStatus === 'not_arrived';
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(203,213,225,0.4)] transition-all group relative overflow-hidden flex flex-col gap-6"
    >
       <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest z-10 border ${
         isVerified ? 'bg-emerald-500 text-white border-emerald-400' : 
         isRefunded ? 'bg-rose-100 text-rose-600 border-rose-200' : 
         'bg-amber-100 text-amber-700 border-amber-200'
       }`}>
          {isVerified ? '✓ Verified' : isRefunded ? '✕ Missed' : '○ Pending'}
       </div>

       {/* Profile */}
       <div className="flex items-center gap-5">
          <div className="relative">
             <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 overflow-hidden ring-4 ring-slate-50 shadow-xl border-2 border-white">
                {p.profilePhoto ? (
                   <img src={p.profilePhoto} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-200"><Users size={32} /></div>
                )}
             </div>
             {p.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-white text-indigo-600 h-8 w-8 rounded-xl shadow-lg border-2 border-white flex items-center justify-center">
                   <ShieldCheck size={16} fill="currentColor" className="text-white fill-indigo-600" />
                </div>
             )}
          </div>
          <div className="space-y-1">
             <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">{p.name}</h4>
             <div className="flex items-center gap-2">
                <Star size={10} fill="#f59e0b" className="text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">{p.averageRating || 'New'}</span>
             </div>
          </div>
       </div>

       {/* Route */}
       <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 space-y-2">
          <div className="text-[10px] font-bold text-slate-600 truncate flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div> {booking.boardingPoint.address}
          </div>
          <div className="text-[10px] font-bold text-slate-600 truncate flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></div> {booking.dropoffPoint.address}
          </div>
       </div>

       {/* 📊 Pillars */}
       <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-4 rounded-2xl border border-slate-100/50">
          <div className="text-center space-y-1">
             <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Collect</p>
             <p className={`text-sm font-black italic ${booking.paymentMethod === 'cash' ? 'text-rose-600' : 'text-slate-900'}`}>₹{Math.round(booking.fareCharged)}</p>
          </div>
          <div className="text-center space-y-1 border-x border-slate-200/50">
             <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Profit</p>
             <p className="text-sm font-black text-emerald-600 italic">₹{Math.round(booking.totalDriverEarnings)}</p>
          </div>
          <div className="text-center space-y-1">
             <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Method</p>
             <div className={`flex items-center justify-center gap-1 text-[9px] font-black uppercase italic ${booking.paymentMethod === 'cash' ? 'text-amber-600' : 'text-indigo-600'}`}>
                {booking.paymentMethod === 'online' ? <CreditCard size={10} /> : booking.paymentMethod === 'wallet' ? <Wallet size={10} /> : <Banknote size={10} />}
                {booking.paymentMethod}
             </div>
          </div>
       </div>

       {/* Actions Bar */}
       <div className="flex items-center justify-between gap-3">
          <a href={`tel:${p.phone}`} className="h-12 w-12 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
             <Phone size={18} />
          </a>
          <div className="flex-1 flex items-center justify-end gap-2">
             {isVerified && booking.dropoffStatus === 'pending' && (rideStatus === 'ongoing' || rideStatus === 'completed') && (
               <button onClick={onDropoff} className="flex-1 bg-emerald-600 text-white h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-lg active:scale-95">
                  <MapPin size={14} /> Mark Drop
               </button>
             )}
             {booking.dropoffStatus === 'dropped' && (
               <div className="flex-1 bg-amber-50 text-amber-600 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-amber-100 italic">
                  <Clock size={14} className="animate-spin" /> Pending
               </div>
             )}
             {(booking.dropoffStatus === 'confirmed' || booking.dropoffStatus === 'auto_released') && (
               <div className="flex-1 bg-emerald-50 text-emerald-600 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-emerald-100 italic">
                  <CheckCircle2 size={14} /> Walleted
               </div>
             )}
             {(rideStatus === 'completed' || booking.dropoffStatus === 'confirmed' || booking.dropoffStatus === 'auto_released') && !isRefunded && (
                <button onClick={onRate} className="bg-slate-900 text-white h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg">
                   <Star size={14} /> Rate
                </button>
             )}
          </div>
       </div>

       <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-50/10 rounded-full group-hover:scale-110 transition-transform duration-500 pointer-events-none"></div>
    </motion.div>
  );
};

export default RidePassengers;
