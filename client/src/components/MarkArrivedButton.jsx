import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Clock, Loader2, Sparkles, AlertTriangle, 
  ChevronRight, Lock, Wallet, Target, CreditCard, Banknote
} from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const MarkArrivedButton = ({ rideId, departureTime, rideDate, waitingTime, verifiedCount, totalCount, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      // Use rideDate and departureTime to get the exact start time
      const dateStr = new Date(rideDate).toISOString().split('T')[0];
      const startAt = new Date(`${dateStr}T${departureTime}`);
      
      // availableTime is departureTime + waitingTime
      const availableTime = new Date(startAt.getTime() + (waitingTime || 10) * 60 * 1000);
      
      const diff = Math.max(0, Math.floor((availableTime - now) / 1000));
      setTimeLeft(diff);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [departureTime, rideDate, waitingTime]);

  const handleMarkArrived = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/otp/mark-arrived/${rideId}`);
      if (data.success) {
        setSummary(data.data);
        toast.success(data.message);
        // Wait 3 seconds to show summary then navigate
        setTimeout(() => {
          onComplete && onComplete();
        }, 5000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete ride');
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (summary) return (
     <motion.div 
       initial={{ opacity: 0, scale: 0.9 }}
       animate={{ opacity: 1, scale: 1 }}
       className="bg-white border-4 border-emerald-500 rounded-[3rem] p-10 shadow-2xl text-center space-y-8 overflow-hidden relative"
     >
        <div className="absolute top-0 right-0 p-8 opacity-5"><Sparkles size={120} className="text-emerald-500 animate-pulse" /></div>
        <div className="flex flex-col items-center gap-4 relative z-10">
           <div className="h-20 w-20 bg-emerald-100 rounded-[2rem] flex items-center justify-center text-emerald-600 animate-bounce">
              <CheckCircle2 size={42} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Syndicate Journey Started! 🚀</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Registry locked. Safe travels, Raider.</p>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
           <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">On Board</p>
              <p className="text-xl font-black text-slate-800 italic uppercase">{summary.verifiedCount} Pk</p>
           </div>
           
           <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100 flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                 <Wallet size={12} className="text-emerald-500" />
                 <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">Wallet</p>
              </div>
              <p className="text-xl font-black text-emerald-600 italic">₹{summary.walletCredit}</p>
           </div>

           <div className="bg-amber-50 p-4 rounded-3xl border border-amber-100 flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                 <Banknote size={12} className="text-amber-500" />
                 <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest leading-none">In-Hand</p>
              </div>
              <p className="text-xl font-black text-amber-600 italic">₹{summary.cashCollection}</p>
           </div>
           
           <div className="bg-rose-50 p-4 rounded-3xl border border-rose-100 flex flex-col items-center">
              <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1 leading-none">Refunded</p>
              <p className="text-xl font-black text-rose-500 italic uppercase">{summary.refundCount} Pk</p>
           </div>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-center gap-3">
           <Clock size={16} className="text-emerald-500 animate-spin" />
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Returning to Fleet in 5s...</p>
        </div>
     </motion.div>
  );

  return (
    <>
      <div className="w-full">
        <button 
          onClick={() => setShowConfirm(true)}
          disabled={timeLeft > 0 || loading}
          className={`w-full group py-4 px-8 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-between overflow-hidden relative group/btn ${timeLeft > 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-slate-900 text-white'}`}
        >
          {timeLeft > 0 && (
            <div className="absolute inset-0 bg-slate-200/40 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm animate-pulse">
                   <Lock size={12} className="text-slate-400" />
                   <span className="text-slate-800 text-[9px] tabular-nums tracking-widest font-black">START AT {formatTime(timeLeft)}</span>
                </div>
            </div>
          )}
          
          <div className="flex items-center gap-4 relative z-10">
             <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center text-white shrink-0 group-hover/btn:rotate-12 transition-transform">
                {timeLeft > 0 ? <Clock size={18} /> : <CheckCircle2 size={20} className="animate-pulse" />}
             </div>
             <div className="text-left leading-none">
                <p className="text-[8px] font-black opacity-60 uppercase mb-0.5 tracking-widest">Boarding Phase</p>
                <p className="text-sm md:text-base font-black italic tracking-tight uppercase">Finalize & Start Journey</p>
             </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4 relative z-10 pr-2 italic">
             <div className="text-right leading-none">
                <p className="text-[8px] font-black opacity-60 uppercase mb-0.5 tracking-widest">Onboarded</p>
                <p className="text-base font-black">{verifiedCount} / {totalCount}</p>
             </div>
             <ChevronRight size={18} className="opacity-40 group-hover/btn:translate-x-1 transition-transform" />
          </div>
          
          {/* Animated Glow when active */}
          {!timeLeft && (
            <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white rounded-[3rem] p-8 md:p-12 w-full max-w-xl shadow-[0_32px_120px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative"
             >
                <div className="flex flex-col items-center text-center space-y-8 relative z-10">
                   <div className="h-16 w-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center rotate-3 border-4 border-white shadow-xl">
                      <CheckCircle2 size={28} />
                   </div>
                   
                   <div>
                      <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none mb-2 underline decoration-emerald-500 decoration-4 underline-offset-8">Start Trip Now?</h3>
                      <p className="text-slate-500 font-bold italic text-sm mt-4">You are about to start the travel phase with:</p>
                   </div>

                   <div className="w-full grid grid-cols-2 gap-4">
                      <div className="p-6 rounded-3xl bg-emerald-600 shadow-xl shadow-emerald-200 text-white flex flex-col items-center">
                         <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                            <CheckCircle2 size={24} />
                         </div>
                         <p className="text-2xl font-black">{verifiedCount}</p>
                         <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Boarded</p>
                      </div>
                      
                      <div className="p-6 rounded-3xl bg-rose-600 shadow-xl shadow-rose-200 text-white flex flex-col items-center">
                         <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                            <AlertTriangle size={24} />
                         </div>
                         <p className="text-2xl font-black">{totalCount - verifiedCount}</p>
                         <p className="text-[10px] font-black uppercase tracking-widest text-rose-100">Missing</p>
                      </div>
                   </div>

                   <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex items-start gap-4">
                      <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
                         <AlertTriangle size={20} className="text-white" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-700 leading-relaxed text-left uppercase tracking-tight">
                         Final confirmation required: This will release funds for verified passengers and trigger refunds for missing ones. This action is not reversible.
                      </p>
                   </div>

                   <div className="grid grid-cols-2 gap-4 w-full pt-4">
                      <button 
                        onClick={() => setShowConfirm(false)}
                        className="py-5 px-8 rounded-2xl bg-white border-2 border-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                      >
                         Cancel Gate
                      </button>
                      <button 
                        onClick={handleMarkArrived}
                        disabled={loading}
                        className="py-5 px-8 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                      >
                         {loading ? <Loader2 className="animate-spin" size={16} /> : <><CheckCircle2 size={16} /> Confirm Entry</>}
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MarkArrivedButton;
