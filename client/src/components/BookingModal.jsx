import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Banknote, CreditCard, Wallet, Plus,
  MapPin, Clock, ShieldCheck, Sparkles, Loader2,
  CheckCircle2, AlertTriangle, ChevronRight, ChevronLeft
} from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import AddMoneyModal from './AddMoneyModal';
import StripePaymentForm from './StripePaymentForm';
import { useNavigate } from 'react-router-dom';

const BookingModal = ({ isOpen, onClose, ride, fare, isBooking, onConfirm, dropoffCoordinates }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1); // 1: Select, 2: Online Payment
  const [clientSecret, setClientSecret] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchWalletBalance();
      setPaymentStep(1); // Reset step
      setClientSecret(null);
    }
  }, [isOpen]);

  const fetchWalletBalance = async () => {
    try {
      setLoadingBalance(true);
      const res = await api.get('/payments/wallet');
      if (res.data.success) {
        setWalletBalance(res.data.balance);
      }
    } catch (err) {
      console.error('Failed to fetch wallet balance');
    } finally {
      setLoadingBalance(false);
    }
  };

  const isWalletInsufficient = walletBalance < fare;

  const handleCheckout = async () => {
    if (paymentMethod === 'cash') {
       onConfirm('cash');
       return;
    }

    if (paymentMethod === 'wallet') {
       if (isWalletInsufficient) {
          setShowAddMoney(true);
          return;
       }
       onConfirm('wallet');
       return;
    }

    if (paymentMethod === 'online') {
       try {
          setCheckoutLoading(true);
          const res = await api.post('/bookings/checkout', { 
             rideId: ride._id,
             dropoffCoordinates // Use the prop
          });

          if (res.data.success) {
             setClientSecret(res.data.clientSecret);
             setPaymentStep(2);
          }
       } catch (err) {
          toast.error(err.response?.data?.message || 'Checkout failed');
       } finally {
          setCheckoutLoading(false);
       }
    }
  };

  const handlePaymentSuccess = (piId) => {
     onConfirm('online', piId);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white overflow-hidden relative"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              {paymentStep === 2 && (
                <button
                  onClick={() => setPaymentStep(1)}
                  className="h-10 w-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
                  {paymentStep === 1 ? 'Confirm Booking' : 'Secure Payment'}
                </h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {paymentStep === 1 ? 'Select your preferred payment method' : 'Complete checkout via Stripe'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-12 w-12 rounded-2xl bg-white hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all flex items-center justify-center shadow-sm"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] scroller-hidden">

            {paymentStep === 1 ? (
              <>
                {/* Ride Summary Snippet */}
                <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100 flex items-center justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <div>
                    <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mb-1">Your Trip Fare</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black italic">₹{fare}</span>
                      <span className="text-indigo-200 text-xs font-bold line-through opacity-50">₹{ride?.price}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border border-white/20">
                      Protected Seat
                    </div>
                  </div>
                </div>

                {/* Payment Selector */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 block italic opacity-60 font-outfit">Choose Method</label>
                  <div className="grid grid-cols-1 gap-3">

                    {/* CASH CARD */}
                    <div
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex items-center gap-4 p-5 rounded-3xl border-2 cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-indigo-600 bg-indigo-50/50 shadow-md translate-x-1' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                    >
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'cash' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Banknote size={24} />
                      </div>
                      <div className="flex-1">
                         <p className={`text-[11px] font-black uppercase tracking-widest ${paymentMethod === 'cash' ? 'text-indigo-600' : 'text-slate-900'}`}>💵 Cash to Driver</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Pay directly when you board</p>
                      </div>
                      {paymentMethod === 'cash' && <CheckCircle2 size={18} className="text-indigo-600" />}
                    </div>

                    {/* ONLINE CARD */}
                    <div
                      onClick={() => setPaymentMethod('online')}
                      className={`flex items-center gap-4 p-5 rounded-3xl border-2 cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-indigo-600 bg-indigo-50/50 shadow-md translate-x-1' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                    >
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'online' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <CreditCard size={24} />
                      </div>
                      <div className="flex-1">
                         <p className={`text-[11px] font-black uppercase tracking-widest ${paymentMethod === 'online' ? 'text-indigo-600' : 'text-slate-900'}`}>💳 Online (Gateways)</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight italic">Pay now via UPI or Card</p>
                      </div>
                      {paymentMethod === 'online' && <CheckCircle2 size={18} className="text-indigo-600" />}
                    </div>

                    {/* WALLET CARD */}
                    <div
                      onClick={() => setPaymentMethod('wallet')}
                      className={`flex flex-col rounded-3xl border-2 transition-all relative overflow-hidden ${paymentMethod === 'wallet' ? 'border-indigo-600 bg-indigo-50/50 shadow-md translate-x-1' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                    >
                       <div className="flex items-center gap-4 p-5">
                          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'wallet' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <Wallet size={24} />
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center justify-between mb-0.5">
                                <p className={`text-[11px] font-black uppercase tracking-widest ${paymentMethod === 'wallet' ? 'text-indigo-600' : 'text-slate-900'}`}>👛 App Wallet</p>
                                <div className="flex items-center gap-1">
                                   <p className={`text-[10px] font-black italic ${isWalletInsufficient ? 'text-rose-500' : 'text-emerald-500'}`}>₹{loadingBalance ? '...' : walletBalance}</p>
                                   {isWalletInsufficient ? (
                                     <span className="bg-rose-100 text-rose-600 text-[7px] font-black px-1 py-0.5 rounded-sm uppercase tracking-tighter">
                                       Low
                                     </span>
                                   ) : (
                                     <span className="bg-emerald-100 text-emerald-600 text-[7px] font-black px-1 py-0.5 rounded-sm uppercase tracking-tighter">
                                       OK
                                     </span>
                                   ) }
                                </div>
                             </div>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Funds held in platform escrow</p>
                          </div>
                          {paymentMethod === 'wallet' && !isWalletInsufficient && <CheckCircle2 size={18} className="text-indigo-600" />}
                       </div>

                       {/* Insufficient Balance Actions */}
                       {paymentMethod === 'wallet' && isWalletInsufficient && (
                         <div className="px-5 pb-5 pt-0">
                            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex flex-col gap-3">
                               <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest text-center italic">
                                 Missing ₹{fare - walletBalance} for wallet payment
                               </p>
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   setShowAddMoney(true);
                                 }}
                                 className="w-full bg-white border border-rose-200 text-rose-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors shadow-sm"
                               >
                                 <Plus size={14} /> Add Money to Wallet
                               </button>
                            </div>
                         </div>
                       )}
                    </div>

                  </div>
                </div>

                {/* Safety Shield */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                  <p className="text-[10px] font-black text-emerald-700 leading-relaxed uppercase tracking-tight italic opacity-80">
                    Your trip is protected by RaidDosthi Safety Protocol. Verified identities and live tracking included.
                  </p>
                </div>

                {/* Confirm Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isBooking || checkoutLoading || (paymentMethod === 'wallet' && isWalletInsufficient)}
                  className="w-full bg-slate-900 hover:bg-indigo-600 text-white h-[72px] rounded-[1.8rem] font-black text-sm uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50 group font-outfit"
                >
                  {isBooking || checkoutLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                      {paymentMethod === 'online' ? 'INITIATE PAYMENT' : 'CONFIRM BOOKING'}
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border-2 border-indigo-100/30 flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Due for Journey</p>
                      <p className="text-5xl font-black text-indigo-700 tracking-tighter italic flex items-start leading-none">
                         <span className="text-xl opacity-30 mr-1 mt-1 font-bold">₹</span>
                         {fare}
                      </p>
                   </div>
                   <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-indigo-100 flex items-center gap-2">
                      <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">GATEWAY ACTIVE</span>
                   </div>
                 </div>

                 <StripePaymentForm
                    clientSecret={clientSecret}
                    onCancel={() => setPaymentStep(1)}
                    onSuccess={handlePaymentSuccess}
                 />

                 <div className="flex items-center justify-center gap-6 opacity-30 pt-4 grayscale pointer-events-none">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
                 </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top-up flow integration */}
        <AddMoneyModal
          show={showAddMoney}
          onClose={() => setShowAddMoney(false)}
          onSuccess={() => {
            setShowAddMoney(false);
            fetchWalletBalance();
          }}
        />
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;
