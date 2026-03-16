import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Phone, MapPin, Users, Calendar, Clock, 
  Trash2, ShieldCheck, Mail, Map, Share2, Info,
  ExternalLink, User, MessageCircle, Star, IdCard, ArrowRight, CheckCircle2
} from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

const RidePassengers = () => {
  const { rideId } = useParams();
  const [ride, setRide] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const date = new Date(ride.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const confirmedCount = passengers.length;
  const totalEarnings = passengers.reduce((sum, b) => sum + (b.totalDriverEarnings || b.fareCharged), 0);

  const handleCompleteRide = async () => {
    if (!window.confirm("Are you sure you have arrived and completed the journey? This will notify passengers and update your Trust Score.")) return;
    try {
      const { data } = await api.patch(`/rides/${rideId}/complete`);
      toast.success(data.message);
      const rideRes = await api.get(`/rides/${rideId}`);
      setRide(rideRes.data.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to complete ride");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <Link to="/my-rides" className="inline-flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-colors mb-10 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to My Rides
        </Link>

        {/* Ride Header Summary */}
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white mb-12 relative overflow-hidden shadow-2xl shadow-indigo-200">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
              <div className="space-y-6 flex-1">
                 <div className="flex items-center gap-3">
                    <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Driver Dashboard</span>
                    {ride.status === 'completed' && <span className="bg-emerald-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Completed</span>}
                    <span className="bg-slate-800 text-slate-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-700">{ride.carModel} • {ride.carNumber}</span>
                 </div>
                 
                 <div className="space-y-2">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight flex flex-wrap items-center gap-x-4">
                       {ride.from.split(',')[0]} <ArrowRight className="text-indigo-400" size={32} /> {ride.to.split(',')[0]}
                    </h1>
                    <p className="text-slate-400 font-medium text-lg max-w-2xl">{ride.from}</p>
                 </div>

                 <div className="flex flex-wrap gap-8 pt-4">
                    <div className="flex items-center gap-3">
                       <div className="bg-slate-800 p-2.5 rounded-xl"><Calendar size={20} className="text-indigo-400" /></div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Date</p>
                          <p className="font-bold text-sm tracking-tight">{date}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 border-l border-slate-800 pl-8">
                       <div className="bg-slate-800 p-2.5 rounded-xl"><Clock size={20} className="text-indigo-400" /></div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Departure</p>
                          <p className="font-bold text-sm tracking-tight">{ride.time}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 border-l border-slate-800 pl-8">
                       <div className="bg-slate-800 p-2.5 rounded-xl"><Users size={20} className="text-indigo-400" /></div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Confirmed</p>
                          <p className="font-bold text-sm tracking-tight">{confirmedCount} of {ride.seatsAvailable + confirmedCount} Seats</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col gap-4 min-w-[200px]">
                 <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-700 text-center">
                     <p className="text-4xl font-black text-white mb-1">₹{totalEarnings}</p>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Final Earnings</p>
                 </div>
                 
                 {ride.status !== 'completed' && ride.status !== 'cancelled' && (
                    <button 
                      onClick={handleCompleteRide}
                      className="w-full bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={16} /> Mark as Arrived
                    </button>
                 )}
              </div>
           </div>
        </div>

        {/* Passenger List */}
        <section>
           <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Confirmed <span className="text-indigo-600">Passengers</span></h2>
              <div className="flex items-center gap-4 text-xs font-black text-slate-500 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                 <div className="flex gap-1">
                    {Array.from({ length: ride.seatsAvailable + confirmedCount }).map((_, i) => (
                       <div key={i} className={`w-3 h-3 rounded-full ${i < confirmedCount ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
                    ))}
                 </div>
                 <span>{ride.seatsAvailable} Seats Left</span>
              </div>
           </div>

           {passengers.length === 0 ? (
              <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-100">
                 <Users size={60} className="text-slate-100 mx-auto mb-6" />
                 <h3 className="text-xl font-bold text-slate-700 mb-2">No passengers have booked yet</h3>
                 <p className="text-slate-400 font-medium max-w-sm mx-auto mb-8">Once travelers join your ride, their coordinates and contact info will appear here.</p>
                 <button className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                    <Share2 size={16} /> Share This Ride
                 </button>
              </div>
           ) : (
              <div className="grid grid-cols-1 gap-6">
                 {passengers.map((booking) => (
                    <PassengerCard key={booking._id} booking={booking} />
                 ))}
              </div>
           )}
        </section>
      </main>
    </div>
  );
};

const PassengerCard = ({ booking }) => {
  const p = booking.passenger;
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all group relative overflow-hidden"
    >
       <div className="flex flex-col lg:flex-row gap-10">
          {/* Section 1: User Profile */}
          <div className="flex gap-6 lg:w-1/3">
             <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-slate-100 overflow-hidden ring-4 ring-slate-50">
                   {p.profilePhoto ? (
                      <img src={p.profilePhoto} alt={p.name} className="w-full h-full object-cover" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                         <User size={32} />
                      </div>
                   )}
                </div>
                {p.isVerified && (
                   <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-1.5 rounded-xl border-4 border-white shadow-lg">
                      <ShieldCheck size={14} />
                   </div>
                )}
             </div>
             <div className="space-y-2">
                <h4 className="text-xl font-black text-slate-900 tracking-tight">{p.name}</h4>
                <div className="flex items-center gap-2">
                   <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{p.gender}</span>
                   <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-lg">
                      <Star size={12} fill="currentColor" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{p.averageRating || 'New'}</span>
                   </div>
                </div>
                <div className="pt-2">
                   <a 
                     href={`tel:${p.phone}`} 
                     className="inline-flex items-center gap-2 text-indigo-600 font-black text-[11px] uppercase tracking-[0.15em] hover:text-slate-900 transition-colors"
                   >
                     <Phone size={14} /> {p.phone}
                   </a>
                </div>
             </div>
          </div>

          {/* Section 2: Trip Coords */}
          <div className="flex-1 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Boarding Point</span>
                   </div>
                   <p className="text-slate-700 font-bold text-sm tracking-tight leading-relaxed pl-3.5 border-l-2 border-indigo-50">{booking.boardingPoint.address}</p>
                </div>
                <div>
                   <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Drop-off Point</span>
                   </div>
                   <p className="text-slate-700 font-bold text-sm tracking-tight leading-relaxed pl-3.5 border-l-2 border-rose-50">{booking.dropoffPoint.address}</p>
                </div>
             </div>
             
             <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3">
                   <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600"><Star size={16} /></div>
                   <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Individual Earning</p>
                       <div className="flex flex-col">
                          <p className="font-black text-slate-900 text-sm leading-tight">₹{booking.totalDriverEarnings || booking.fareCharged}</p>
                          {booking.systemSubsidy > 0 && (
                            <p className="text-[8px] font-bold text-emerald-600 italic">Incl. ₹{booking.systemSubsidy} Justice Subsidy</p>
                          )}
                       </div>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="bg-blue-50 p-2 rounded-xl text-blue-600"><IdCard size={16} /></div>
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Payment Method</p>
                      <p className="font-black text-slate-900 text-sm">{booking.paymentMethod.toUpperCase()}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="bg-slate-50 p-2 rounded-xl text-slate-500"><Clock size={16} /></div>
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Booked On</p>
                      <p className="font-black text-slate-900 text-sm">{new Date(booking.bookedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* Decorative gradient corner */}
       <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-50 rounded-tl-[100px] -mr-16 -mb-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </motion.div>
  );
};

export default RidePassengers;
