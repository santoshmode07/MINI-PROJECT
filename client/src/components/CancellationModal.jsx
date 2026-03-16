import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Info, Loader2 } from 'lucide-react';

const CancellationModal = ({ isOpen, onClose, onConfirm, passengerCount, rideDate, rideTime }) => {
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Reason Selector, 2: Penalty Warning

  const reasons = [
    'Vehicle breakdown',
    'Personal emergency',
    'Medical emergency',
    'Weather conditions',
    'Changed plans',
    'Other'
  ];

  const handleNext = () => {
    if (!reason) return;
    if (reason === 'Other' && !otherReason.trim()) return;
    setStep(2);
  };

  const handleFinalConfirm = async () => {
    setLoading(true);
    await onConfirm(reason, otherReason);
    setLoading(false);
    onClose();
  };

  const getPenaltyWarning = () => {
     const now = new Date();
     const departureTime = new Date(`${new Date(rideDate).toISOString().split('T')[0]}T${rideTime}`);
     const diffMinutes = (departureTime - now) / (1000 * 60);

     if (passengerCount === 0) return "No penalty will be applied as there are no confirmed bookings.";
     
     if (diffMinutes > 120) {
        return "SCENARIO 1: No warning or strike applied (Cancelled > 2 hours before). A small trust score impact will occur.";
     } else if (diffMinutes >= 30) {
        return "❗ SCENARIO 2: One WARNING will be added to your profile (Cancelled 30m-2h before). After 3 warnings, your account will be suspended for 24 hours.";
     } else {
        return "🚨 SCENARIO 3: One STRIKE will be added to your profile (Cancelled < 30m before). You will be restricted from creating new rides for 24 hours.";
     }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        ></motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
           <div className="p-8 md:p-10">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="bg-rose-50 p-2 rounded-xl">
                       <AlertTriangle className="text-rose-600" size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Cancellation <span className="text-rose-600">Justice</span></h3>
                 </div>
                 <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={20} className="text-slate-400" />
                 </button>
              </div>

              {step === 1 ? (
                <div className="space-y-6">
                   <p className="text-slate-500 font-medium leading-relaxed italic uppercase text-xs tracking-widest">
                      Please select a reason for cancelling this ride. This will be shared with your passengers.
                   </p>
                   
                   <div className="grid grid-cols-1 gap-3">
                      {reasons.map((r) => (
                        <button
                          key={r}
                          onClick={() => setReason(r)}
                          className={`w-full text-left p-4 rounded-2xl border-2 transition-all font-black text-sm italic ${
                            reason === r 
                            ? 'border-rose-600 bg-rose-50 text-rose-600' 
                            : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-slate-50/50'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                   </div>

                   {reason === 'Other' && (
                     <textarea
                       className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-rose-600 focus:outline-none font-medium text-sm"
                       placeholder="Please explain the situation..."
                       value={otherReason}
                       onChange={(e) => setOtherReason(e.target.value)}
                       rows={3}
                     />
                   )}

                   <button
                     disabled={!reason || (reason === 'Other' && !otherReason)}
                     onClick={handleNext}
                     className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-200"
                   >
                     Continue to Penalty Check
                   </button>
                </div>
              ) : (
                <div className="space-y-8">
                   <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem]">
                      <div className="flex items-center gap-2 mb-4">
                         <Info size={18} className="text-amber-600" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Identity & Trust Impact</span>
                      </div>
                      <p className="text-amber-900 font-bold text-sm leading-relaxed">
                         {getPenaltyWarning()}
                      </p>
                   </div>

                   <p className="text-slate-500 text-xs font-medium leading-relaxed uppercase tracking-wide">
                      By confirming, you understand that your Trust Score will decrease and passengers will be notified of your cancellation reason.
                   </p>

                   <div className="flex gap-4">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 py-5 rounded-2xl bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all font-outfit"
                      >
                        Back
                      </button>
                      <button
                        disabled={loading}
                        onClick={handleFinalConfirm}
                        className="flex-[2] py-5 rounded-2xl bg-rose-600 text-white font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl shadow-rose-200 flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : "I Understand, Confirm"}
                      </button>
                   </div>
                </div>
              )}
           </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CancellationModal;
