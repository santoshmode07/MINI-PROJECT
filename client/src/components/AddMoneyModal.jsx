import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import StripePaymentForm from './StripePaymentForm';

const AddMoneyModal = ({ show, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentStep, setPaymentStep] = useState(1); // 1: Amount select, 2: Payment info

  const handleAmountSelect = (val) => {
    setAmount(val);
  };

  const getPaymentIntent = async () => {
    const numAmt = Number(amount);
    if (!numAmt || numAmt < 100) {
      return toast.error('Minimum top up amount is ₹100');
    }

    try {
      setLoading(true);
      const { data } = await api.post('/payments/topup/intent', { amount: numAmt });
      
      if (data.success) {
        setClientSecret(data.clientSecret);
        setPaymentStep(2); // Go to step 2: Payment Info
      }
    } catch (err) {
      console.error('Payment Intent Error:', err);
      toast.error(err.response?.data?.message || 'Payment service temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      setLoading(true);
      await api.post('/payments/topup/confirm', { paymentIntentId });
      toast.success('Funds added successfully!');
      onSuccess && onSuccess();
    } catch (err) {
      console.error('Confirmation Error:', err);
      // Even if our manual check fails, the webhook might still work, so we proceed to refresh
      onSuccess && onSuccess();
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
          className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-slate-900 p-8 text-white flex items-center justify-between shrink-0">
             <div className="flex items-center gap-4">
                {paymentStep === 2 && (
                  <button 
                    onClick={() => setPaymentStep(1)} 
                    className="h-10 w-10 bg-white/10 rounded-xl hover:bg-white/20 flex items-center justify-center transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <div className="px-2 py-0.5 bg-indigo-500 rounded text-[9px] font-black uppercase tracking-widest">STEP {paymentStep} OF 2</div>
                   </div>
                   <h2 className="text-2xl font-black tracking-tighter italic uppercase leading-none">
                      {paymentStep === 1 ? 'Wallet Recharge' : 'Secure Checkout'}
                   </h2>
                </div>
             </div>
             <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <CreditCard size={24} />
             </div>
          </div>

          <div className="p-10 overflow-y-auto custom-scrollbar">
            {paymentStep === 1 ? (
              <div className="space-y-8">
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Amount to Add (INR)</p>
                    <div className="relative group">
                       <input 
                         type="number" 
                         value={amount}
                         onChange={(e) => setAmount(e.target.value)}
                         placeholder="0.00"
                         className="w-full text-center text-6xl font-black tracking-tighter text-slate-900 bg-slate-50/50 py-12 rounded-[2.5rem] border-2 border-slate-100 focus:border-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-200"
                       />
                       <span className="absolute left-10 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[100, 500, 1000, 2000].map(amt => (
                       <button 
                         key={amt}
                         onClick={() => handleAmountSelect(amt.toString())}
                         className={`py-4 rounded-2xl font-black text-xs transition-all border-2
                           ${amount === amt.toString() ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100 scale-[1.05]' : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200 hover:text-indigo-600'}`}
                       >
                          ₹{amt}
                       </button>
                    ))}
                 </div>

                 <div className="flex flex-col gap-4">
                    <button 
                      onClick={getPaymentIntent}
                      disabled={loading || !amount || amount < 100}
                      className="w-full bg-slate-900 text-white h-[72px] rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 group"
                    >
                      {loading ? 'INITIATING GATEWAY...' : (
                        <>
                           PROCEED TO PAYMENT <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                    <button 
                      onClick={onClose}
                      className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all text-center"
                    >
                      Maybe Later
                    </button>
                 </div>

                 <div className="flex items-center justify-center gap-6 opacity-30 pt-4 grayscale">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
                   <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
                   <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
                 </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-indigo-50/50 p-6 rounded-[2.5rem] border-2 border-indigo-100/30 flex items-center justify-between mb-2">
                   <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Billable</p>
                      <p className="text-4xl font-black text-indigo-700 tracking-tighter italic flex items-start">
                         <span className="text-xl opacity-30 mr-1 mt-1 font-bold">₹</span>
                         {amount}<span className="text-sm opacity-30 ml-1">.00</span>
                      </p>
                   </div>
                   <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-indigo-100 flex items-center gap-2">
                      <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">SECURE LINK READY</span>
                   </div>
                </div>

                <StripePaymentForm 
                  clientSecret={clientSecret} 
                  onCancel={() => setPaymentStep(1)} 
                  onSuccess={handlePaymentSuccess}
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddMoneyModal;
