import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Banknote, X, ChevronRight, Fingerprint, ShieldCheck } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const WithdrawMoneyModal = ({ show, onClose, onSuccess, balance }) => {
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Details, 2: Confirming

  const handleSubmitRequest = async () => {
    const numAmt = Number(amount);
    
    if (!numAmt || numAmt < 100) {
      return toast.error('Minimum withdrawal amount is ₹100');
    }
    if (numAmt > balance) {
      return toast.error('Insufficient wallet balance');
    }
    if (!upiId || !upiId.includes('@')) {
      return toast.error('Please enter a valid UPI ID (e.g. name@okaxis)');
    }

    try {
      setLoading(true);
      const { data } = await api.post('/payments/withdraw', { amount: numAmt, upiId });
      
      if (data.success) {
        toast.success(data.message);
        onSuccess();
        onClose();
        // Reset state
        setAmount('');
        setUpiId('');
        setStep(1);
      }
    } catch (err) {
      console.error('Withdrawal Request Error:', err);
      toast.error(err.response?.data?.message || 'Withdrawal service temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-rose-600 p-8 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="flex items-center gap-4 relative z-10">
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <div className="px-2 py-0.5 bg-white/20 rounded text-[9px] font-black uppercase tracking-widest">SECURE SETTLEMENT</div>
                   </div>
                   <h2 className="text-2xl font-black tracking-tighter italic uppercase leading-none">
                      UPI Withdrawal
                   </h2>
                </div>
             </div>
             <button 
               onClick={onClose}
               className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"
             >
                <X size={24} />
             </button>
          </div>

          <div className="p-10 overflow-y-auto custom-scrollbar">
              <div className="space-y-8">
                  {/* Balance Snapshot */}
                  <div className="bg-slate-50 p-6 rounded-[2.5rem] border-2 border-slate-100 flex items-center justify-between">
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Withdrawable Balance</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter italic">₹{balance?.toLocaleString()}</p>
                     </div>
                     <div className="h-12 w-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-rose-500">
                        <Banknote size={24} />
                     </div>
                  </div>

                  <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Withdrawal Amount (₹)</label>
                         <div className="relative group">
                            <input 
                              type="number" 
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="Min. 100"
                              className="w-full bg-slate-50/50 py-5 px-8 rounded-2xl border-2 border-slate-100 focus:border-rose-500 focus:bg-white outline-none transition-all font-black text-slate-900"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-rose-50 rounded-lg">
                               <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Amount</span>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Your UPI ID</label>
                         <div className="relative group">
                            <input 
                              type="text" 
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="e.g. santosh@okaxis"
                              className="w-full bg-slate-50/50 py-5 px-8 rounded-2xl border-2 border-slate-100 focus:border-rose-500 focus:bg-white outline-none transition-all font-black text-slate-900"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-50 rounded-lg">
                               <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">BHIM UPI</span>
                            </div>
                         </div>
                      </div>
                  </div>

                  {/* Safety Notice */}
                  <div className="bg-indigo-50/30 p-5 rounded-2xl border border-indigo-100/50 flex gap-4">
                      <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50 shrink-0">
                         <ShieldCheck size={20} />
                      </div>
                      <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                        Funds will be deducted from your wallet immediately and settled to your UPI account within <span className="text-indigo-600 italic">24 working hours</span>.
                      </p>
                  </div>

                  <div className="flex flex-col gap-4">
                     <button 
                       onClick={handleSubmitRequest}
                       disabled={loading || !amount || !upiId}
                       className="w-full bg-slate-900 text-white h-[72px] rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 group"
                     >
                       {loading ? 'PROCESSING...' : (
                         <>
                            INITIATE SETTLEMENT <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                         </>
                       )}
                     </button>
                     <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest flex items-center justify-center gap-2">
                        <Fingerprint size={12} className="text-rose-400" /> Secure Terminal Protocol Active
                     </p>
                  </div>
              </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WithdrawMoneyModal;
