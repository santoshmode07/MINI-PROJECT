import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Users, DollarSign, Wallet, 
  ArrowUpRight, ArrowDownLeft, Search, 
  Download, Filter, ShieldCheck, Activity,
  Zap, Gift, TrendingUp, LayoutDashboard
} from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('revenue'); // 'all', 'revenue', 'escrow', 'expenses'

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/dashboard');
                setStats(data.data);
            } catch (error) {
                toast.error('Failed to load admin metrics');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Syndicate Ledger...</p>
        </div>
    );

    const filteredTransactions = stats.transactions.filter(t => {
        if (filter === 'all') return true;
        if (filter === 'revenue') return t.type === 'COMMISSION';
        if (filter === 'escrow') return t.type.includes('ESCROW');
        if (filter === 'expenses') return t.type === 'SUBSIDY';
        return true;
    });

    const cards = [
        { label: 'Platform Revenue', value: stats.totalRevenue, sub: 'Gross Commission', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Justice Subsidies', value: stats.totalSubsidies, sub: 'Benefit Distribution', icon: Gift, color: 'text-rose-600', bg: 'bg-rose-50' },
        { label: 'Net Profit', value: stats.totalRevenue - stats.totalSubsidies, sub: 'Realized Gains', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Transaction Count', value: stats.transactionCount, sub: 'Global Log Count', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Navbar />
            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                           <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                              <ShieldCheck size={10} /> Authorized Command Center
                           </span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Syndicate <span className="text-indigo-600 italic">Treasury</span></h1>
                        <p className="text-slate-500 font-medium tracking-tight">Real-time surveillance of flow, commissions, and platform liquidity.</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-4 group hover:scale-105 transition-transform duration-500">
                       <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
                          <Wallet size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Treasury Balance</p>
                          <p className="text-2xl font-black text-slate-900 tracking-tighter italic">₹{stats.platformBalance.toLocaleString()}</p>
                       </div>
                    </div>
                </header>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                   {cards.map((card, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-indigo-100/30 transition-all group relative overflow-hidden"
                      >
                         <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-slate-900 scale-150 group-hover:scale-[1.7] group-hover:rotate-12 transition-all duration-700">
                            <card.icon size={120} />
                         </div>
                         <div className={`${card.bg} ${card.color} h-12 w-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all`}>
                            <card.icon size={22} />
                         </div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                         <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-1 italic">₹{card.value.toLocaleString()}</h3>
                         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{card.sub}</p>
                      </motion.div>
                   ))}
                </div>

                {/* Ledger View */}
                <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/40">
                   <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                            <BarChart3 size={18} />
                         </div>
                         <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Treasury <span className="text-indigo-600">Ledger</span></h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Transaction History</p>
                         </div>
                      </div>

                      {/* Filter System */}
                      <div className="flex items-center p-1 bg-slate-100 rounded-2xl">
                         {[
                            { id: 'revenue', label: 'Revenue' },
                            { id: 'expenses', label: 'Expenses' },
                            { id: 'escrow', label: 'Escrow' },
                            { id: 'all', label: 'All Logs' }
                         ].map(btn => (
                            <button
                               key={btn.id}
                               onClick={() => setFilter(btn.id)}
                               className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                  ${filter === btn.id ? 'bg-white text-indigo-600 shadow-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                               {btn.label}
                            </button>
                         ))}
                      </div>
                   </div>

                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                         <thead>
                            <tr className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                               <th className="px-10 py-6">Timeline</th>
                               <th className="px-10 py-6">Entity</th>
                               <th className="px-10 py-6">Category</th>
                               <th className="px-10 py-6">Delta</th>
                               <th className="px-10 py-6">Allocation Details</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {filteredTransactions.length > 0 ? filteredTransactions.map((t, idx) => (
                               <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                                  <td className="px-10 py-6">
                                     <p className="text-[11px] font-black text-slate-700 tracking-tight">{new Date(t.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</p>
                                     <p className="text-[10px] font-bold text-slate-300 uppercase leading-none">{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                  </td>
                                  <td className="px-10 py-6">
                                     <div className="flex items-center gap-3">
                                         <div className="h-9 w-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-[10px] uppercase shadow-md group-hover:scale-110 transition-transform">
                                            {t.userId?.name ? t.userId.name[0] : 'S'}
                                         </div>
                                        <div>
                                           <p className="text-sm font-black text-slate-800 tracking-tight">{t.userId?.name || 'System'}</p>
                                           <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter italic">{t.userId?.role || 'CORE'}</p>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-10 py-6">
                                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm
                                         ${t.type === 'COMMISSION' ? 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20' : 
                                           t.type === 'SUBSIDY' ? 'bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20' : 
                                           t.type === 'ESCROW_HOLD' ? 'bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20' :
                                           t.type === 'ESCROW_RELEASE' ? 'bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20' :
                                           'bg-slate-500/10 text-slate-600 ring-1 ring-slate-500/20'}`}>
                                         {t.type.replace('_', ' ')}
                                      </span>
                                  </td>
                                  <td className="px-10 py-6">
                                     <p className={`text-sm font-black italic tracking-tight ${t.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {t.amount >= 0 ? '+' : ''}₹{Math.abs(t.amount).toLocaleString()}
                                     </p>
                                  </td>
                                  <td className="px-10 py-6">
                                     <div className="max-w-xs">
                                        <p className="text-xs font-bold text-slate-500 tracking-tight leading-relaxed line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
                                           {t.description}
                                        </p>
                                         {t.rideId && (
                                            <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest mt-1">
                                               RIDE ID: ...{(t.rideId._id || t.rideId).slice(-6)}
                                            </p>
                                         )}
                                     </div>
                                  </td>
                                </tr>
                            )) : (
                               <tr>
                                  <td colSpan="5" className="px-10 py-20 text-center">
                                     <div className="flex flex-col items-center gap-3">
                                        <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
                                           <Search size={32} />
                                        </div>
                                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">No logs found in this sector</p>
                                     </div>
                                  </td>
                               </tr>
                            )}
                         </tbody>
                      </table>
                   </div>
                   
                   <div className="p-8 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         Showing {filteredTransactions.length} of {stats.transactions.length} total entries
                      </p>
                      <div className="flex items-center gap-1.5">
                         <ShieldCheck size={14} className="text-emerald-500" />
                         <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Syndicate Verified Ledger</span>
                      </div>
                   </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
