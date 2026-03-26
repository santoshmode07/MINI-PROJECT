import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements
} from '@stripe/react-stripe-js';
import stripePromise from '../config/stripe';
import { toast } from 'react-toastify';
import { Loader2, ShieldCheck, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentForm = ({ clientSecret, onCancel, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [stripeReady, setStripeReady] = useState(false);
  const [stripeError, setStripeError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + (onSuccess ? '/dashboard' : '/profile'),
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess && onSuccess(paymentIntent.id);
      }
    } catch (err) {
      toast.error('Secure connection interrupted.');
    } finally {
      setLoading(false);
    }
  };

   if (stripeError) {
      return (
        <div className="p-12 text-center bg-rose-50 rounded-[2.5rem] border border-rose-100">
           <AlertTriangle size={32} className="text-rose-500 mx-auto mb-4" />
           <p className="text-sm font-black text-rose-600 uppercase tracking-widest leading-none mb-2">Gate Load Failure</p>
           <p className="text-[10px] font-bold text-slate-500 italic uppercase mb-6 leading-tight">
              Secure payment library failed to initialize.<br/>Your network may have dropped.
           </p>
           <button 
             onClick={() => window.location.reload()}
             className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800"
           >
             Hard Recharge Gateway
           </button>
        </div>
      );
   }

   return (
     <motion.form 
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       onSubmit={handleSubmit} 
       className="space-y-8"
     >
       <div className={`relative transition-all duration-500 ${!stripeReady ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100'}`}>
         {!stripeReady && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
               <Loader2 className="animate-spin text-indigo-600" size={32} />
               <p className="sr-only">Initialing encryption...</p>
            </div>
         )}
         <div className="bg-slate-50/50 p-6 rounded-[2.5rem] border-2 border-slate-100/80 shadow-inner">
            <PaymentElement 
              onReady={() => setStripeReady(true)}
              options={{ layout: 'accordion' }} 
              onLoadError={() => setStripeError(true)}
            />
         </div>
       </div>

       <div className="flex flex-col gap-4">
         <button
           disabled={!stripe || loading || !stripeReady}
           className="group relative w-full h-[72px] bg-slate-900 overflow-hidden rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] text-white shadow-2xl transition-all hover:shadow-indigo-200/50 active:scale-95 disabled:opacity-50"
         >
           <div className="relative z-10 flex items-center justify-center gap-3">
              {loading ? (
                 <>
                   <Loader2 className="animate-spin" size={20} />
                   Encrypting...
                 </>
              ) : (
                 <>
                   <ShieldCheck size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                   {stripeReady ? 'Confirm Secure Payment' : 'Loading Encyption...'}
                 </>
              )}
           </div>
           <motion.div 
             className="absolute inset-0 bg-indigo-600 origin-left"
             initial={{ scaleX: 0 }}
             whileHover={{ scaleX: 1 }}
             transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
           />
         </button>

         <button
           type="button"
           onClick={onCancel}
           disabled={loading}
           className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-all text-center py-2"
         >
           Back to Amount Selection
         </button>
       </div>

       <div className="pt-4 border-t border-slate-100 flex items-center justify-between opacity-40">
         <div className="flex items-center gap-2">
            <CreditCard size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">PCI DSS COMPLIANT</span>
         </div>
         <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest">SECURE BY STRIPE</span>
         </div>
       </div>
     </motion.form>
   );
};

const StripePaymentForm = ({ clientSecret, onCancel, onSuccess }) => {
  const options = {
    clientSecret,
    appearance: {
      theme: 'none',
      rules: {
         '.Input': {
           padding: '16px',
           borderRadius: '16px',
           border: '2px solid transparent',
           backgroundColor: '#ffffff',
           fontFamily: 'Outfit, sans-serif',
           fontSize: '15px',
           fontWeight: '600',
           transition: 'all 0.3s ease',
         },
         '.Input:focus': {
           border: '2px solid #4f46e5',
           boxShadow: '0 0 0 4px rgba(79, 70, 229, 0.1)',
         },
         '.Label': {
           fontSize: '11px',
           fontWeight: '800',
           textTransform: 'uppercase',
           letterSpacing: '0.1em',
           marginBottom: '8px',
           color: '#64748b',
         }
      },
      variables: {
        colorPrimary: '#4f46e5',
        colorText: '#1e293b',
        fontFamily: 'Outfit, sans-serif',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm onCancel={onCancel} onSuccess={onSuccess} clientSecret={clientSecret} />
    </Elements>
  );
};

export default StripePaymentForm;
