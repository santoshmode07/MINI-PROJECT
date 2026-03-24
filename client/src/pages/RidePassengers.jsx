import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Phone, MapPin, Users, Calendar, Clock, 
  Trash2, ShieldCheck, Mail, Map, Share2, Info,
  ExternalLink, User, MessageCircle, Star, IdCard, ArrowRight, CheckCircle2,
  AlertTriangle, Ban, Layout, Banknote, CreditCard
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

  useEffect(() => {
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
    fetchData();
  }, [rideId, navigate]);

  if (loading) return (
     <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Verifying Roster...</p>
     </div>
  );

  if (!ride) return null;

  const date = new Date(ride.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const confirmedCount = passengers.length;
  
  // Logical Earnings Pivot
  const totalExpectedNet = passengers.reduce((sum, b) => sum + (b.totalDriverEarnings || (b.fareCharged * 0.8)), 0);
  const currentVerifiedNet = passengers
    .filter(p => p.boardingStatus === 'arrived')
    .reduce((acc, p) => acc + (p.totalDriverEarnings || (p.fareCharged * 0.8)), 0);

  // Requirement: Use Boarded customers total after "Marked as Arrived"
  const displayProfit = ride.status === 'completed' ? currentVerifiedNet : totalExpectedNet;
  const profitLabel = ride.status === 'completed' ? 'Final Total Earnings' : 'Net Expected Profit';

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
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Live • 128 bit Encrypted</p>
           </div>
        </div>

        {/* 🏆 ULTRA-COMPACT DRIVER DASHBOARD */}
        <section className="mb-10">
           <div className="bg-slate-950 rounded-[3rem] p-8 md:p-12 text-white relative shadow-[0_32px_80px_-20px_rgba(15,23,42,0.6)] border border-slate-800 overflow-hidden">
             {/* Deep glow effect */}
             <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
             
             <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                
                {/* Left: Route Information */}
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-6">
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        ride.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                      }`}>
                         {ride.status === 'completed' ? '✓ Ledger Closed' : 'In Transit'}
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
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={10} className="text-indigo-400" /> DEPARTURE
                         </p>
                         <p className="text-base font-black italic">{ride.time}</p>
                      </div>
                      <div className="space-y-2">
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Users size={10} className="text-emerald-400" /> MANIFEST
                         </p>
                         <p className="text-base font-black italic">{confirmedCount} Pk</p>
                      </div>
                      <div className="space-y-2">
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Banknote size={10} className="text-amber-400" /> FARE INDEX
                         </p>
                         <p className="text-base font-black italic">₹{ride.price}</p>
                      </div>
                      <div className="space-y-2">
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={10} className="text-indigo-400" /> DATE
                         </p>
                         <p className="text-base font-black italic">{date}</p>
                      </div>
                   </div>
                </div>

                {/* Right: Premium Earnings Card */}
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
                         {ride.status !== 'completed' && (
                            <div className="mt-6 pt-4 border-t border-indigo-400/30">
                               <div className="flex items-center justify-between text-indigo-100/70">
                                  <p className="text-[9px] font-black uppercase tracking-widest">VERIFIED SHARE</p>
                                  <p className="text-sm font-black italic">₹{Math.round(currentVerifiedNet)}</p>
                               </div>
                            </div>
                         )}
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

        {/* 👥 PASSENGER ROSTER GRID */}
        <section className="space-y-12">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
              <div className="space-y-2">
                 <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-indigo-500 rounded-full"></div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">Manifest</h2>
                 </div>
                 <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] ml-4">Verified digital identities on board</p>
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
              <div className="bg-white rounded-[4rem] p-24 text-center border border-slate-100 shadow-sm relative overflow-hidden group">
                 <div className="absolute inset-0 bg-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <div className="relative z-10">
                    <Users size={80} className="text-slate-200 mx-auto mb-8 animate-bounce" />
                    <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tighter uppercase italic">The Roster is Empty</h3>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto mb-10 italic">Your route is live! Passengers will appear here as soon as they confirm their boarding.</p>
                    <button className="bg-slate-900 text-white px-10 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95 flex items-center gap-3 mx-auto">
                       <Share2 size={16} /> Signal Route to Community
                    </button>
                 </div>
              </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 px-2 pb-12">
                {passengers.map((booking) => (
                   <PassengerCard 
                     key={booking._id} 
                     booking={booking} 
                     isRideCompleted={ride.status === 'completed'}
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

const PassengerCard = ({ booking, isRideCompleted, onRate }) => {
  const p = booking.passenger;
  const isVerified = booking.boardingStatus === 'arrived';
  const isRefunded = booking.boardingStatus === 'not_arrived';
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(203,213,225,0.4)] hover:shadow-[0_25px_80px_-15px_rgba(79,70,229,0.15)] transition-all group relative overflow-hidden"
    >
       {/* Status Micro-Badge */}
       <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest z-10 border ${
         isVerified 
           ? 'bg-emerald-500 text-white border-emerald-400' 
           : isRefunded 
             ? 'bg-rose-100 text-rose-600 border-rose-200'
             : 'bg-amber-100 text-amber-700 border-amber-200'
       }`}>
          {isVerified ? '✓ Verified' : isRefunded ? '✕ Missed' : '○ Pending'}
       </div>

       <div className="flex flex-col space-y-6 relative z-10">
          {/* Profile Header - Compact */}
          <div className="flex items-center gap-5">
             <div className="relative">
                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 overflow-hidden ring-4 ring-slate-50 group-hover:rotate-3 transition-transform duration-300">
                   {p.profilePhoto ? (
                      <img src={p.profilePhoto} alt={p.name} className="w-full h-full object-cover" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                         <User size={24} />
                      </div>
                   )}
                </div>
                {p.isVerified && (
                   <div className="absolute -bottom-1 -right-1 bg-white text-indigo-600 p-1.5 rounded-lg shadow-lg border border-slate-100">
                      <ShieldCheck size={14} />
                   </div>
                )}
             </div>
             
             <div className="space-y-0.5">
                <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">{p.name}</h4>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1.5 text-amber-600">
                      <Star size={10} fill="currentColor" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{p.averageRating || 'New'}</span>
                   </div>
                   <span className="h-1 w-1 rounded-full bg-slate-200"></span>
                   <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{p.gender}</span>
                </div>
             </div>
          </div>

          {/* Mini-Route Display */}
          <div className="space-y-3 bg-slate-50/50 p-5 rounded-[2rem] border border-slate-100">
             <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                   <div className="w-2.5 h-2.5 rounded-full border-2 border-indigo-500"></div>
                   <div className="w-0.5 h-3 bg-slate-200"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                </div>
                <div className="flex-1 space-y-2 overflow-hidden">
                   <p className="text-[11px] font-bold text-slate-600 leading-tight truncate">{booking.boardingPoint.address}</p>
                   <p className="text-[11px] font-bold text-slate-600 leading-tight truncate">{booking.dropoffPoint.address}</p>
                </div>
             </div>
          </div>

          {/* Financials & Actions Row */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-50">
             <div className="flex items-center gap-5">
                <div className="space-y-0.5">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Driver Share</p>
                   <div className="flex items-baseline gap-1">
                      <span className="text-[10px] font-black text-slate-400">₹</span>
                      <p className="text-lg font-black text-slate-900 italic leading-none">
                         {Math.round(booking.totalDriverEarnings || booking.fareCharged)} 
                      </p>
                   </div>
                </div>
                <div className="h-6 w-px bg-slate-100"></div>
                <div className="space-y-0.5">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Method</p>
                   <div className="flex items-center gap-1.5 text-slate-600 font-black text-[10px] uppercase italic">
                      {booking.paymentMethod === 'online' ? <CreditCard size={10} className="text-indigo-500" /> : <Banknote size={10} className="text-amber-500" />}
                      {booking.paymentMethod}
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-2">
                <a 
                  href={`tel:${p.phone}`} 
                  className="h-11 w-11 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  <Phone size={16} />
                </a>
                
                {isRideCompleted && !isRefunded && (
                   <button 
                     onClick={onRate}
                     className="bg-slate-900 text-white h-11 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                   >
                     <Star size={12} fill="currentColor" /> Rate
                   </button>
                )}
             </div>
          </div>
       </div>

       {/* Subtle Background Art */}
       <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-50/30 rounded-full group-hover:scale-110 transition-transform duration-500 pointer-events-none"></div>
    </motion.div>
  );
};

export default RidePassengers;
