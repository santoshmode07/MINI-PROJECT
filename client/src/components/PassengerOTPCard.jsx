import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, AlertCircle, Loader2, ShieldCheck, Lock, Wallet,
  Banknote, CreditCard, ChevronRight, User, AlertTriangle
} from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const PassengerOTPCard = ({ passenger, rideId, onVerified, windowClosed }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(null);

  const handleVerify = async (manualOtp) => {
    const otpToVerify = typeof manualOtp === 'string' ? manualOtp : otp;
    if (otpToVerify.length !== 6) return;
    if (windowClosed) {
      toast.error("Boarding window closed");
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/otp/verify', { 
        rideId, 
        bookingId: passenger.bookingId, 
        otp: otpToVerify 
      });
      if (data.success) {
        toast.success(`Verified: ${data.data.name}`);
        onVerified && onVerified();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed';
      setError(msg);
      toast.error(msg);
      if (msg.includes('attempts remaining')) {
         const match = msg.match(/(\d+) attempts remaining/);
         if (match) setRemainingAttempts(match[1]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(val);
    if (val.length === 6) {
        handleVerify(val);
    }
  };

  const statusStyles = {
    arrived: "bg-emerald-50 border-emerald-100 ring-2 ring-emerald-500/20",
    pending: "bg-white border-slate-100 hover:shadow-xl hover:shadow-indigo-100/50 hover:scale-[1.01]",
    locked: "bg-rose-50 border-rose-100 grayscale-[0.5]"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 md:p-8 rounded-[3rem] border-2 transition-all group overflow-hidden relative ${statusStyles[passenger.boardingStatus] || statusStyles.pending}`}
    >
      <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
        {/* Passenger Info */}
        <div className="flex items-center gap-5 w-full md:w-auto">
          {passenger.profilePhoto ? (
            <div className="h-20 w-20 rounded-[2rem] bg-white border-4 border-white shadow-2xl rotate-3 group-hover:rotate-0 transition-all duration-500 overflow-hidden ring-8 ring-slate-50/50">
               <img 
                 src={passenger.profilePhoto} 
                 className="h-full w-full object-cover hd-profile" 
                 loading="eager"
                 decoding="async"
               />
            </div>
          ) : (
            <div className="h-20 w-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white text-3xl font-black italic border-4 border-white shadow-2xl rotate-3 group-hover:rotate-0 transition-all duration-500 uppercase ring-8 ring-slate-50/50">
               {passenger.name[0]}
            </div>
          )}
          <div>
            <h4 className="text-xl font-black text-slate-800 tracking-tighter italic uppercase">{passenger.name}</h4>
            <div className="flex items-center gap-3 mt-1">
               <span className="text-[10px] font-black text-slate-400 border border-slate-200 px-2 py-0.5 rounded-md uppercase tracking-widest">{passenger.gender}</span>
               <div className="flex items-center gap-1.5 text-indigo-500 font-black italic text-[10px] uppercase">
                  {passenger.paymentMethod === 'online' ? <CreditCard size={12} /> : 
                   passenger.paymentMethod === 'wallet' ? <Wallet size={12} className="text-purple-600" /> : 
                   <Banknote size={12} />}
                  {passenger.paymentMethod}
                  <span className="text-slate-300 mx-1">|</span>
                  <span className="text-slate-700 italic font-black">₹{passenger.fare || 0}</span>
               </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1"><ChevronRight size={10} /> {passenger.boardingPoint}</p>
          </div>
        </div>

        {/* Verification Logic */}
        <div className="flex-1 w-full relative">
           {passenger.boardingStatus === 'arrived' ? (
              <div className="flex items-center justify-center gap-3 py-6 bg-white/40 rounded-[2.5rem]">
                 <CheckCircle2 size={32} className="text-emerald-500 animate-bounce" />
                 <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Boarding Confirmed</p>
                    <p className="text-lg font-black text-slate-800 italic uppercase">Arrived & Verified</p>
                 </div>
              </div>
           ) : passenger.otpLocked ? (
              <div className="flex items-center justify-center gap-4 py-6 bg-white/40 rounded-[2.5rem]">
                 <Lock size={32} className="text-rose-500" />
                 <div>
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-none mb-1">Verification Blocked</p>
                    <p className="text-lg font-black text-slate-800 italic uppercase">OTP Locked (Security)</p>
                 </div>
              </div>
           ) : windowClosed ? (
              <div className="flex items-center justify-center gap-4 py-6 bg-white/40 rounded-[2.5rem]">
                 <AlertCircle size={32} className="text-rose-400" />
                 <div>
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none mb-1">Time Elapsed</p>
                    <p className="text-lg font-black text-slate-800 italic uppercase">Missing At Pickup</p>
                 </div>
              </div>
           ) : (
             <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="relative">
                <div className={`flex items-center bg-slate-50 border-2 rounded-[2rem] overflow-hidden transition-all shadow-sm ${error ? 'border-rose-500 bg-rose-50/10' : 'border-slate-200 focus-within:border-indigo-600 focus-within:bg-white'}`}>
                   <div className={`pl-6 ${error ? 'text-rose-400' : 'text-slate-300'}`}><ShieldCheck size={24} /></div>
                   <input 
                     type="text" 
                     placeholder="ENTER 6-DIGIT PASSENGER OTP"
                     value={otp}
                     onChange={handleInputChange}
                     disabled={loading}
                     className="flex-1 bg-transparent py-6 px-4 font-black text-xl italic tracking-[0.5em] placeholder:tracking-normal placeholder:italic placeholder:font-bold placeholder:text-slate-300 text-slate-800 outline-none uppercase"
                   />
                   <button 
                     type="submit"
                     disabled={loading || otp.length !== 6}
                     className={`px-8 py-6 font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn ${error ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-slate-900'} text-white`}
                   >
                     {loading ? <Loader2 className="animate-spin" size={16} /> : <span className="group-hover/btn:translate-x-1 inline-block transition-transform whitespace-nowrap">Verify Now</span>}
                   </button>
                </div>
                {error && (
                   <div className="mt-2 flex items-center justify-center gap-2 text-rose-500 font-black italic text-[11px] uppercase tracking-widest text-center">
                      <AlertTriangle size={14} className="animate-pulse" /> {error}
                   </div>
                )}
             </form>
           )}
        </div>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-50/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
    </motion.div>
  );
};

export default PassengerOTPCard;
