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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'MONEY_ADDED': 
      case 'TOPUP':
      case 'Money Added': return { icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'System Top-up' };
      case 'RIDE_PAYMENT':
      case 'Ride Payment': return { icon: ShoppingBag, color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Ride Payment' };
      case 'COMMISSION':
      case 'Commission': return { icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50', label: 'System Fee' };
      case 'REFUND':
      case 'Refund': return { icon: RefreshCw, color: 'text-purple-500', bg: 'bg-purple-50', label: 'Ride Refund' };
      case 'RIDE_EARNING': return { icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Ride Earning' };
      default: return { icon: IndianRupee, color: 'text-slate-500', bg: 'bg-slate-50', label: (type || 'SYNC').replace('_', ' ') };
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'All') return true;
    if (filter === 'PAYMENTS') {
       return t.type === 'MONEY_ADDED' || t.type === 'TOPUP' || t.type === 'Money Added' || t.description?.toLowerCase().includes('online') || t.metadata?.paymentIntentId;
    }
    const typeLabel = (t.type || '').toUpperCase();
    if (filter === 'FEES') return typeLabel === 'COMMISSION' || t.label === 'System Fee';
    if (filter === 'BOOKINGS') return typeLabel === 'RIDE_PAYMENT' || typeLabel === 'RIDE PAYMENT';
    if (filter === 'EARNINGS') return typeLabel === 'RIDE_EARNING' || typeLabel === 'RIDE EARNING';
    if (filter === 'REFUNDS') return typeLabel === 'REFUND';
    return typeLabel === filter;
  });

  // Pagination Math
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filterBtns = [
    { id: 'All', label: 'Everything' },
    { id: 'PAYMENTS', label: 'Online Payments' },
    { id: 'FEES', label: 'Fees' },
    { id: 'BOOKINGS', label: 'Bookings' },
    { id: 'EARNINGS', label: 'Earnings' },
    { id: 'REFUNDS', label: 'Refunds' }
  ];

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
              <p className="text-slate-500 font-medium italic underline underline-offset-4 decoration-indigo-200 decoration-2 italic transition-all">Audit trail of your verified digital activities.</p>
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

        {/* Filter Controls (SIMPLIFIED) */}
        <div className="flex flex-wrap items-center gap-4 mb-10 pb-4 border-b border-slate-100 scroller-hidden">
           {filterBtns.map(btn => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] transition-all
                  ${filter === btn.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105' : 'bg-white text-slate-400 border border-slate-100 hover:border-indigo-200 hover:text-indigo-600'}`}
              >
                 {btn.label}
              </button>
           ))}
        </div>

        {/* Transaction Roster */}
        <div className="space-y-4 mb-16">
           {paginatedTransactions.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {paginatedTransactions.map((t, idx) => {
                  const info = getTransactionIcon(t.type);
                  return (
                    <motion.div
                      key={t._id || idx}
                      initial={{ opacity: 0, scale: 0.98, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="group bg-white rounded-[2rem] p-6 border border-slate-100 flex items-center gap-6 hover:shadow-2xl hover:shadow-slate-100 hover:border-indigo-100 transition-all cursor-default relative overflow-hidden"
                    >
                       <div className={`${info.bg} ${info.color} h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                          <info.icon size={24} />
                       </div>

                       <div className="flex-1 min-w-0">
                           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                             <div className="flex items-center gap-2">
                                <h4 className="text-base font-black text-slate-800 tracking-tight italic truncate">"{t.description}"</h4>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${info.color} ${info.bg} border-current opacity-70`}>{info.label}</span>
                             </div>
                             <span className={`text-lg font-black italic whitespace-nowrap sm:text-right ${t.amount >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {t.amount >=0 ? '+' : '-'}₹{Math.abs(t.amount)}
                             </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                             <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(t.createdAt).toLocaleDateString()}</span>
                             <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                       </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
           ) : (
              <div className="bg-slate-50 rounded-[3rem] p-24 flex flex-col items-center justify-center text-center opacity-50 border-2 border-dashed border-slate-200">
                 <RefreshCw className="text-slate-300 mb-6 animate-spin-slow" size={60} />
                 <h3 className="text-2xl font-black text-slate-800 tracking-tight italic mb-2">Registry Silent</h3>
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">No activity detected within this sector.</p>
              </div>
           )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
           <div className="flex items-center justify-center gap-6 py-6 border-t border-slate-50">
             <button 
               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
               disabled={currentPage === 1}
               className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-20 transition-all shadow-xl active:scale-90"
             >
                <ChevronRight size={24} className="rotate-180" />
             </button>
             
             <div className="text-center min-w-[120px]">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Ledger Page</p>
                <p className="text-xl font-black text-slate-800 tracking-tighter italic leading-none">{currentPage} <span className="text-slate-300 mx-1">/</span> {totalPages}</p>
             </div>

             <button 
               onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
               disabled={currentPage === totalPages}
               className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-20 transition-all shadow-xl active:scale-90"
             >
                <ChevronRight size={24} />
             </button>
           </div>
        )}
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
