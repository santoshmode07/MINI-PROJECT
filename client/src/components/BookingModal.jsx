import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Banknote, ShieldCheck, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

const BookingModal = ({ isOpen, onClose, ride, fare, onConfirm, isBooking }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');

  if (!ride) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white overflow-hidden relative"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Confirm Booking</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Final Step to Secure Your Seat</p>
              </div>
              <button 
                onClick={onClose}
                className="h-12 w-12 rounded-2xl bg-white hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all flex items-center justify-center shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Fare Card */}
              <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 flex items-center justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
                <div>
                  <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mb-1">Your Calculated Fare</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black italic">₹{fare}</span>
                    <span className="text-indigo-200 text-xs font-bold line-through opacity-50">₹{ride.price}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border border-white/20">
                    Smart Partial Price
                  </div>
                </div>
              </div>

              {/* Payment Selector */}
              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 block">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-3 ${paymentMethod === 'cash' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <Banknote className={paymentMethod === 'cash' ? 'text-indigo-600' : 'text-slate-400'} size={32} />
                    <span className={`text-[11px] font-black uppercase tracking-widest ${paymentMethod === 'cash' ? 'text-indigo-600' : 'text-slate-500'}`}>Cash to Driver</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('online')}
                    className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-3 ${paymentMethod === 'online' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <CreditCard className={paymentMethod === 'online' ? 'text-indigo-600' : 'text-slate-400'} size={32} />
                    <span className={`text-[11px] font-black uppercase tracking-widest ${paymentMethod === 'online' ? 'text-indigo-600' : 'text-slate-500'}`}>Online Payment</span>
                  </button>
                </div>
              </div>

              {/* Safety Shield */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <p className="text-[10px] font-bold text-emerald-700 leading-relaxed uppercase tracking-tight">
                  Your trip is protected by RaidDosthi Safety Protocol. Verified identities and live tracking included.
                </p>
              </div>

              {/* Confirm Button */}
              <button
                onClick={() => onConfirm(paymentMethod)}
                disabled={isBooking}
                className="w-full bg-slate-900 hover:bg-indigo-600 text-white h-16 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50 disabled:pointer-events-none group"
              >
                {isBooking ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                    CONFIRM BOOKING
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
