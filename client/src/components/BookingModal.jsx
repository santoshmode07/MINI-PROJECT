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
                {/* 🌌 UNIFIED JOURNEY SUMMARY */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-all duration-700"></div>
                  
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/80 italic">Trip Registry</span>
                       <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-emerald-400">
                          <ShieldCheck size={10} /> Secure Protocol
                       </div>
                    </div>
                    
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-none">₹{fare}</h3>
                        <p className="text-slate-400 text-[9px] font-black uppercase mt-1 tracking-widest">{ride?.from?.split(',')[0]} to {ride?.to?.split(',')[0]}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Identity Verified</p>
                         <div className="flex -space-x-2 justify-end">
                            <div className="h-6 w-6 rounded-full border-2 border-slate-900 bg-indigo-600 flex items-center justify-center text-[8px] font-black">R</div>
                            <div className="h-6 w-6 rounded-full border-2 border-slate-900 bg-emerald-600 flex items-center justify-center text-[8px] font-black leading-none">
                               <CheckCircle2 size={10} />
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 💳 DYNAMIC PAYMENT GRID */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic opacity-80">Select Settlement</h4>
                    <span className="h-px flex-1 bg-slate-100 mx-4 opacity-50"></span>
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest italic">Fast & Secure</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* 💰 CASH OPTION */}
                    <div
                      onClick={() => setPaymentMethod('cash')}
                      className={`group relative p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer overflow-hidden active:scale-95 ${paymentMethod === 'cash' ? 'border-indigo-600 bg-indigo-50/20 shadow-xl' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                    >
                      <div className="flex items-start justify-between relative z-10">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${paymentMethod === 'cash' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
                          <Banknote size={24} />
                        </div>
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'cash' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200'}`}>
                           {paymentMethod === 'cash' && <CheckCircle2 size={12} />}
                        </div>
                      </div>
                      <div className="mt-4 relative z-10">
                        <p className={`text-xs font-black uppercase tracking-widest ${paymentMethod === 'cash' ? 'text-indigo-600' : 'text-slate-900'}`}>Manual Cash</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight italic mt-1 leading-tight">Settle directly upon arrival</p>
                      </div>
                      <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-150 transition-transform duration-700 pointer-events-none">
                         <Banknote size={80} />
                      </div>
                    </div>

                    {/* ⚡ ONLINE OPTION */}
                    <div
                      onClick={() => setPaymentMethod('online')}
                      className={`group relative p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer overflow-hidden active:scale-95 ${paymentMethod === 'online' ? 'border-indigo-600 bg-indigo-50/20 shadow-xl' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                    >
                      <div className="flex items-start justify-between relative z-10">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${paymentMethod === 'online' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
                          <CreditCard size={24} />
                        </div>
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'online' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200'}`}>
                           {paymentMethod === 'online' && <CheckCircle2 size={12} />}
                        </div>
                      </div>
                      <div className="mt-4 relative z-10">
                        <div className="flex items-center gap-2">
                           <p className={`text-xs font-black uppercase tracking-widest ${paymentMethod === 'online' ? 'text-indigo-600' : 'text-slate-900'}`}>Secure Cloud</p>
                           <span className="bg-blue-100 text-blue-600 text-[6px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest leading-none">Hot</span>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight italic mt-1 leading-tight">Pay instantly via UPI or Card</p>
                      </div>
                      <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-150 transition-transform duration-700 pointer-events-none">
                         <CreditCard size={80} />
                      </div>
                    </div>

                    {/* 👛 WALLET OPTION - Full Width */}
                    <div
                      onClick={() => setPaymentMethod('wallet')}
                      className={`md:col-span-2 group relative p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer overflow-hidden active:scale-95 ${paymentMethod === 'wallet' ? 'border-indigo-600 bg-indigo-50/20 shadow-xl' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                    >
                       <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-5">
                             <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${paymentMethod === 'wallet' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
                               <Wallet size={24} />
                             </div>
                             <div>
                                <div className="flex items-center gap-3">
                                   <p className={`text-xs font-black uppercase tracking-widest ${paymentMethod === 'wallet' ? 'text-indigo-600' : 'text-slate-900'}`}>Raider Wallet</p>
                                   <p className={`text-[10px] font-black italic px-2 py-0.5 rounded-full ${isWalletInsufficient ? 'bg-rose-100 text-rose-500' : 'bg-emerald-100 text-emerald-500'}`}>
                                      ₹{loadingBalance ? '...' : walletBalance}
                                   </p>
                                </div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight italic mt-0.5 leading-tight">100% Escrow Protection Protocol Applied</p>
                             </div>
                          </div>
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'wallet' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200'}`}>
                             {paymentMethod === 'wallet' && !isWalletInsufficient && <CheckCircle2 size={12} />}
                          </div>
                       </div>

                       {paymentMethod === 'wallet' && isWalletInsufficient && (
                         <div className="mt-4 animate-in slide-in-from-top-2 duration-300 relative z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowAddMoney(true);
                              }}
                              className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl"
                            >
                              <Plus size={14} strokeWidth={3} /> Recharge Registry Balance
                            </button>
                         </div>
                       )}
                       <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-150 transition-transform duration-700 pointer-events-none">
                         <Wallet size={80} />
                       </div>
                    </div>
                  </div>
                </div>

                {/* 🛡️ SECURITY BANNER */}
                <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 opacity-60">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.1em] italic leading-tight">
                    Funds for Online/Wallet are held by platform and only released after your OTP verification. SafeTransit™ Protocol Active.
                  </p>
                </div>

                {/* 🚀 BREATHING ACTION BUTTON */}
                <button
                  onClick={handleCheckout}
                  disabled={isBooking || checkoutLoading || (paymentMethod === 'wallet' && isWalletInsufficient)}
                  className="w-full relative h-20 rounded-[1.8rem] bg-slate-950 text-white overflow-hidden transition-all active:scale-95 disabled:opacity-30 group/btn shadow-[0_20px_40px_-10px_rgba(15,23,42,0.4)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 bg-[length:200%_100%] animate-shimmer opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    {isBooking || checkoutLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <Sparkles size={16} className="text-indigo-400" />
                          <span className="text-xs font-black uppercase tracking-[0.3em]">{paymentMethod === 'online' ? 'Enter Terminal' : 'Proceed to Registry'}</span>
                          <ChevronRight size={16} className="opacity-40 group-hover/btn:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-[7px] font-black opacity-30 mt-1 uppercase tracking-[0.5em] group-hover:opacity-60 transition-opacity">Authenticated Checkout</p>
                      </>
                    )}
                  </div>
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
