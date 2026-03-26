import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Calendar, Clock, ArrowUpRight, ArrowDownLeft, 
  Search, Filter, IndianRupee, Wallet, ChevronRight, 
  Download, Activity, CreditCard, ShoppingBag, Gift, RefreshCw, AlertCircle
} from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import AddMoneyModal from '../components/AddMoneyModal';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const TransactionHistory = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showTopUp, setShowTopUp] = useState(false);

  const fetchStatement = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/payments/wallet/statement');
      if (data.success) {
        setBalance(data.balance);
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error('Failed to fetch statement:', err);
      toast.error('Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatement();
  }, []);

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'Money Added': return { icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50' };
      case 'Ride Payment': return { icon: ShoppingBag, color: 'text-indigo-500', bg: 'bg-indigo-50' };
      case 'Commission': return { icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50' };
      case 'Refund': return { icon: RefreshCw, color: 'text-purple-500', bg: 'bg-purple-50' };
      default: return { icon: IndianRupee, color: 'text-slate-500', bg: 'bg-slate-50' };
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'All') return true;
    return t.type === filter;
  });

  const filterBtns = ['All', 'Money Added', 'Ride Payment', 'Commission', 'Refund'];

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
       <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Ledger Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex flex-col font-outfit">
      <Navbar />

      <main className="max-w-5xl mx-auto w-full px-6 pt-32 pb-24">
        {/* Header and Balance */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16">
           <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                    <History size={24} />
                 </div>
                 <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Transaction <span className="text-indigo-600">Ledger</span></h1>
              </div>
              <p className="text-slate-500 font-medium italic underline underline-offset-4 decoration-indigo-100 italic transition-all decoration-2">Complete audit trail of your digital wallet activities.</p>
           </div>

           <motion.div 
             whileHover={{ scale: 1.02 }}
             className={`bg-white rounded-[3rem] p-8 min-w-[300px] border-4 transition-all shadow-2xl ${balance < 0 ? 'border-rose-400 shadow-rose-100' : 'border-emerald-400 shadow-emerald-100'}`}
           >
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${balance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>Current Balance</p>
                    <h2 className={`text-4xl font-black italic tracking-tighter flex items-start ${balance < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                       <span className={`text-xl font-bold mt-1 mr-1 not-italic ${balance < 0 ? 'text-rose-400' : 'text-emerald-300'}`}>₹</span>
                       {balance}
                    </h2>
                 </div>
                 <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${balance < 0 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    {balance < 0 ? <AlertCircle size={24} /> : <Wallet size={24} />}
                 </div>
              </div>
              <button 
                onClick={() => setShowTopUp(true)}
                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg
                  ${balance < 0 ? 'bg-rose-600 text-white shadow-rose-100 hover:bg-rose-700' : 'bg-slate-900 text-white shadow-slate-200 hover:bg-indigo-600'}`}
              >
                 <IndianRupee size={16} /> {balance < 0 ? 'Top Up to Clear Balance' : 'Add Funds Now'}
              </button>
           </motion.div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-10 pb-4 border-b border-slate-100 overflow-x-auto scroller-hidden">
           {filterBtns.map(btn => (
              <button
                key={btn}
                onClick={() => setFilter(btn)}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all
                  ${filter === btn ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 border border-slate-100 hover:border-indigo-200 hover:text-indigo-600'}`}
              >
                 {btn}
              </button>
           ))}
        </div>

        {/* Transaction Roster */}
        <div className="space-y-4">
           {filteredTransactions.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {filteredTransactions.map((t, idx) => {
                  const info = getTransactionIcon(t.type);
                  return (
                    <motion.div
                      key={t.paymentIntentId || idx}
                      initial={{ opacity: 0, scale: 0.98, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group bg-white rounded-[2rem] p-6 border border-slate-100 flex items-center gap-6 hover:shadow-2xl hover:shadow-slate-100 hover:border-indigo-100 transition-all cursor-default relative overflow-hidden"
                    >
                       <div className={`${info.bg} ${info.color} h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                          <info.icon size={24} />
                       </div>

                       <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                             <h4 className="text-base font-black text-slate-800 tracking-tight italic truncate">"{t.description}"</h4>
                             <span className={`text-sm font-black italic whitespace-nowrap sm:text-right ${t.amount >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {t.amount >= 0 ? '+' : ''}₹{Math.abs(t.amount)}
                             </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                             <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(t.createdAt).toLocaleDateString()}</span>
                             <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                             {t.paymentIntentId && <span className="hidden md:flex items-center gap-1.5 text-[9px] opacity-40 italic">#ID:{t.paymentIntentId.slice(-8)}</span>}
                          </div>
                       </div>

                       <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 opacity-0 group-hover:opacity-10 group-hover:translate-x-6 transition-all">
                          <info.icon size={80} />
                       </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
           ) : (
              <div className="bg-slate-50 rounded-[3rem] p-24 flex flex-col items-center justify-center text-center opacity-50 border-2 border-dashed border-slate-200">
                 <RefreshCw className="text-slate-300 mb-6 animate-spin-slow" size={60} />
                 <h3 className="text-2xl font-black text-slate-800 tracking-tight italic mb-2">No Transactions Yet</h3>
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">Time to add some digital fuel to your account!</p>
              </div>
           )}
        </div>
      </main>

      <AddMoneyModal 
        show={showTopUp} 
        onClose={() => setShowTopUp(false)} 
        onSuccess={() => {
           setShowTopUp(false);
           fetchStatement(); // Reload history
        }}
      />
    </div>
  );
};

export default TransactionHistory;
