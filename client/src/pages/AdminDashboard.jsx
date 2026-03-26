import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Users, DollarSign, Wallet, 
  ArrowUpRight, ArrowDownLeft, Search, 
  Download, Filter, ShieldCheck, Activity,
  Zap, Gift, TrendingUp, LayoutDashboard, AlertTriangle, Loader2,
  Phone, Mail, ArrowRight, CreditCard, Banknote
} from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { useSocket } from '../context/SocketContext';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'revenue', 'escrow', 'expenses'
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('overview');
    const [isSettling, setIsSettling] = useState(false);
    const { socket, isConnected } = useSocket();
    const itemsPerPage = 10;

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

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleDispute = (data) => {
            console.log('[Socket] Dispute raised:', data);
            toast.error(`NEW DISPUTE RAISED: Ride ${data.rideId.toString().slice(-6)}`, {
                autoClose: 10000,
                position: "top-right"
            });
            fetchStats(); // Update activeIncidents count and list
        };

        const handleNewBooking = (data) => {
            console.log('[Socket] New booking in system:', data);
            // Optional: toast or just refresh stats for revenue/escrow update
            fetchStats();
        };

        socket.on('dispute_raised', handleDispute);
        socket.on('new_booking_received', handleNewBooking);

        return () => {
            socket.off('dispute_raised', handleDispute);
            socket.off('new_booking_received', handleNewBooking);
        };
    }, [socket, isConnected]);

    const handleFinalizeSettlement = async (rideId, passengerId) => {
        if (!window.confirm('RELEASE FUNDS: Are you sure you want to release 80% fare to the Raider/Driver?')) return;
        setIsSettling(true);
        try {
            await api.post(`/admin/settle-dispute/${rideId}/${passengerId}`);
            toast.success('Funds Released to Raider Successfully');
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action Failed');
        } finally {
            setIsSettling(false);
        }
    };

    const handleRefundDispute = async (rideId, passengerId) => {
        if (!window.confirm('REFUND CUSTOMER: Are you sure you want to refund the full fare to the Passenger?')) return;
        setIsSettling(true);
        try {
            await api.post(`/admin/refund-dispute/${rideId}/${passengerId}`);
            toast.success('Passenger Refunded and Incident Resolved');
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action Failed');
        } finally {
            setIsSettling(false);
        }
    };

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 gap-6">
            <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mb-4" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Deciphering Treasury Flow...</p>
        </div>
    );

    if (!stats) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <AlertTriangle className="h-16 w-16 text-rose-500 mb-6" />
            <h2 className="text-2xl font-black text-slate-900 mb-2 underline decoration-rose-500 decoration-4 italic uppercase">Connection Severed</h2>
            <p className="text-slate-500 font-bold max-w-sm">Unable to sync with the Syndicate Vault. Check your clearance level.</p>
        </div>
    );

    const filteredTransactions = stats?.transactions?.filter(t => {
        if (filter === 'all') return true;
        if (filter === 'revenue') return t.type === 'COMMISSION';
        if (filter === 'escrow') return t.type.includes('ESCROW');
        if (filter === 'expenses') return t.type === 'SUBSIDY';
        return true;
    }) || [];

    // Pagination Logic
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const cards = [
        { label: 'Syndicate Revenue', value: stats.totalRevenue, sub: 'Gross Commission', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Justice Subsidies', value: stats.totalSubsidies, sub: 'Benefit Distribution', icon: Gift, color: 'text-rose-600', bg: 'bg-rose-50' },
        { label: 'Escrow Liquidity', value: stats.escrowBalance, sub: 'Held for Settlements', icon: LayoutDashboard, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Net Profit', value: stats.totalRevenue - stats.totalSubsidies, sub: 'Realized Gains', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Navbar />
            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2 px-1">
                           <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-lg shadow-indigo-100 italic">
                              <ShieldCheck size={10} className="text-emerald-400" /> Platform Clearance: High
                           </span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">HQ <span className="text-indigo-600">Terminal</span></h1>
                    </div>
                    
                    {/* Tab Selection */}
                    <div className="flex items-center p-1.5 bg-slate-200/50 backdrop-blur-md rounded-3xl border border-slate-200">
                      {[
                        { id: 'overview', label: 'Monitor', icon: BarChart3 },
                        { id: 'disputes', label: 'Incidents', icon: AlertTriangle, count: stats?.activeDisputes?.length },
                        { id: 'ledger', label: 'Ledger', icon: LayoutDashboard }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative
                            ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-xl scale-[1.05]' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          <tab.icon size={14} className={activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'} />
                          {tab.label}
                          {tab.count > 0 && (
                             <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-lg shadow-rose-200 animate-pulse">
                               {tab.count}
                             </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-4">
                       <div className="h-10 w-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                          <Wallet size={18} />
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Corporate Assets</p>
                          <p className="text-xl font-black text-slate-900 tracking-tighter italic">₹{stats.platformBalance.toLocaleString()}</p>
                       </div>
                    </div>
                </header>

                <div className="h-px bg-slate-200 w-full mb-12 opacity-50"></div>

                {/* DYNAMIC CONTENT TERMINAL */}
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                       {cards.map((card, i) => (
                          <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-100/40 transition-all duration-500">
                             <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-slate-900 scale-150 rotate-12 transition-all group-hover:scale-[1.8]">
                                <card.icon size={100} />
                             </div>
                             <div className={`${card.bg} ${card.color} h-12 w-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-black/5`}>
                                <card.icon size={22} />
                             </div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                             <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-1 italic">₹{card.value.toLocaleString()}</h3>
                             <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{card.sub}</p>
                          </div>
                       ))}
                    </div>
                  )}

                  {activeTab === 'disputes' && (
                    <div className="max-w-4xl mx-auto py-4">
                       <div className="flex items-center gap-3 mb-10 px-4">
                          <div className="h-10 w-1.5 bg-rose-500 rounded-full"></div>
                          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Active <span className="text-rose-600 italic underline decoration-rose-100 decoration-8 underline-offset-4">Incidents</span></h2>
                       </div>
                       
                       {stats.activeDisputes && stats.activeDisputes.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
                             {stats.activeDisputes.map((dispute, idx) => (
                                <div key={idx} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-rose-900/5 relative group overflow-hidden">
                                   <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-rose-900">
                                      <Zap size={80} />
                                   </div>
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                                       <div className="flex items-center gap-2">
                                          <span className="bg-rose-50 text-rose-600 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border border-rose-100 shadow-inner">
                                             <AlertTriangle size={12} strokeWidth={3} /> Dispute: ₹{dispute.fare}
                                          </span>
                                          <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-inner ${
                                             dispute.paymentMethod === 'cash' 
                                             ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                             : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                          }`}>
                                             {dispute.paymentMethod === 'cash' ? <Banknote size={12} /> : <CreditCard size={12} />}
                                             {dispute.paymentMethod?.toUpperCase() || 'UNKNOWN'}
                                          </span>
                                       </div>
                                       <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">{new Date(dispute.raisedAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex flex-col gap-6 mb-8 bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100">
                                       {/* Raider Section */}
                                       <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                                          <div className="h-14 w-14 rounded-2xl border-2 border-white shadow-xl overflow-hidden shrink-0 bg-indigo-50 flex items-center justify-center">
                                             {dispute.driver?.profilePhoto ? (
                                                <img src={dispute.driver.profilePhoto} alt="" className="h-full w-full object-cover" />
                                             ) : (
                                                <span className="text-indigo-600 font-black text-xl italic">{dispute.driver?.name?.[0]}</span>
                                             )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                             <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5 opacity-60">
                                                <ShieldCheck size={10} /> RAIDER
                                             </p>
                                             <p className="text-xl font-black text-slate-900 tracking-tighter italic leading-none truncate mb-3">{dispute.driver?.name}</p>
                                             <div className="flex flex-wrap gap-x-6 gap-y-2">
                                                <a href={`tel:${dispute.driver?.phone}`} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-indigo-600 truncate transition-colors">
                                                   <Phone size={10} className="text-slate-300" /> {dispute.driver?.phone || 'No Phone'}
                                                </a>
                                                <a href={`mailto:${dispute.driver?.email}`} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-indigo-600 truncate transition-colors">
                                                   <Mail size={10} className="text-slate-300" /> {dispute.driver?.email || 'No Email'}
                                                </a>
                                             </div>
                                          </div>
                                       </div>

                                       <div className="h-px bg-slate-200/50 w-full"></div>

                                       {/* Customer Section */}
                                       <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                                          <div className="h-14 w-14 rounded-2xl border-2 border-white shadow-xl overflow-hidden shrink-0 bg-rose-50 flex items-center justify-center">
                                             {dispute.passenger?.profilePhoto ? (
                                                <img src={dispute.passenger.profilePhoto} alt="" className="h-full w-full object-cover" />
                                             ) : (
                                                <span className="text-rose-600 font-black text-xl italic">{dispute.passenger?.name?.[0]}</span>
                                             )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                             <p className="text-[8px] font-black text-rose-400 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5 opacity-60">
                                                <Users size={10} /> CUSTOMER
                                             </p>
                                             <p className="text-xl font-black text-slate-900 tracking-tighter italic leading-none truncate mb-3">{dispute.passenger?.name}</p>
                                             <div className="flex flex-wrap gap-x-6 gap-y-2">
                                                <a href={`tel:${dispute.passenger?.phone}`} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-indigo-600 truncate transition-colors">
                                                   <Phone size={10} className="text-slate-300" /> {dispute.passenger?.phone || 'No Phone'}
                                                </a>
                                                <a href={`mailto:${dispute.passenger?.email}`} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-indigo-600 truncate transition-colors">
                                                   <Mail size={10} className="text-slate-300" /> {dispute.passenger?.email || 'No Email'}
                                                </a>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="space-y-1 mb-8 bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed border-slate-200">
                                       <p className="text-sm font-black text-slate-700 italic flex items-center gap-2">
                                          {dispute.from.split(',')[0]} <ArrowUpRight size={14} className="text-indigo-400" /> {dispute.to.split(',')[0]}
                                       </p>
                                       <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] font-mono">HASH: ...{(dispute.rideId || '').toString().slice(-8).toUpperCase()}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                       <button 
                                          onClick={() => handleRefundDispute(dispute.rideId, dispute.passenger?._id)}
                                          disabled={isSettling}
                                          className="bg-indigo-600 text-white py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                       >
                                          {isSettling ? <Loader2 size={12} className="animate-spin" /> : <Activity size={12} />} Refund Customer
                                       </button>
                                       <button 
                                          onClick={() => handleFinalizeSettlement(dispute.rideId, dispute.passenger?._id)}
                                          disabled={isSettling}
                                          className="bg-slate-900 text-white py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                       >
                                          {isSettling ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />} Release to Raider
                                       </button>
                                    </div>
                                </div>
                             ))}
                          </div>
                       ) : (
                          <div className="bg-white border-2 border-slate-50 rounded-[4rem] p-24 text-center shadow-inner">
                             <div className="h-24 w-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
                                <ShieldCheck size={48} />
                             </div>
                             <h3 className="text-2xl font-black text-slate-900 mb-2 italic uppercase">Protocol Healthy</h3>
                             <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] italic">No active violations detected in current cycle</p>
                          </div>
                       )}
                    </div>
                  )}

                  {activeTab === 'ledger' && (
                    <div className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-300/20 mb-20 animate-in fade-in slide-in-from-bottom-5 duration-500">
                       <div className="p-10 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-slate-50/20">
                          <div className="flex items-center gap-5">
                             <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-xl border border-slate-50">
                                <LayoutDashboard size={20} />
                             </div>
                             <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Treasury <span className="text-indigo-600 italic">Ledger</span></h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mt-1">Verified Audit Trail</p>
                             </div>
                          </div>

                          <div className="flex items-center p-1.5 bg-slate-100 rounded-[1.5rem] border border-slate-200/50">
                             {[
                                { id: 'revenue', label: 'Revenue' },
                                { id: 'expenses', label: 'Expenses' },
                                { id: 'escrow', label: 'Escrow' },
                                { id: 'all', label: 'Complete Ledger' }
                             ].map(btn => (
                                <button
                                   key={btn.id}
                                   onClick={() => setFilter(btn.id)}
                                   className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                                      ${filter === btn.id ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                   {btn.label}
                                </button>
                             ))}
                          </div>
                       </div>

                       <div className="overflow-x-auto">
                          <table className="w-full text-left">
                             <thead>
                                <tr className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-50">
                                   <th className="px-12 py-8">Timeline</th>
                                   <th className="px-12 py-8">Entity Cluster</th>
                                   <th className="px-12 py-8">Transaction DNA</th>
                                   <th className="px-12 py-8">Asset Delta</th>
                                   <th className="px-12 py-8">Context Audit</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-50">
                                {paginatedTransactions.length > 0 ? paginatedTransactions.map((t, idx) => (
                                   <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                                      <td className="px-12 py-8">
                                         <p className="text-xs font-black text-slate-800 tracking-tighter italic">{new Date(t.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                         <p className="text-[9px] font-black text-slate-300 uppercase mt-1 italic leading-none">{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                      </td>
                                      <td className="px-12 py-8">
                                         <div className="flex items-center gap-4">
                                             <div className="h-10 w-10 bg-slate-900 text-white rounded-[1rem] flex items-center justify-center font-black text-xs uppercase shadow-xl ring-4 ring-slate-100">
                                                {t.userId?.name ? t.userId.name[0] : 'S'}
                                             </div>
                                            <div>
                                               <p className="text-sm font-black text-slate-900 tracking-tight italic uppercase leading-none mb-1">{t.userId?.name || 'System CORE'}</p>
                                               <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest leading-none flex items-center gap-1.5">
                                                  <Activity size={8} /> {t.userId?.role || 'PROTOCOL'}
                                               </p>
                                            </div>
                                         </div>
                                      </td>
                                      <td className="px-12 py-8">
                                          <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border whitespace-nowrap
                                             ${t.type === 'COMMISSION' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                               t.type === 'SUBSIDY' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                               t.type === 'ESCROW_HOLD' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                               t.type === 'ESCROW_RELEASE' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                               'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                             {t.type.replace('_', ' ')}
                                          </span>
                                      </td>
                                      <td className="px-12 py-8">
                                         <p className={`text-lg font-black italic tracking-tighter leading-none ${t.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {t.amount >= 0 ? '+' : ''}₹{t.amount.toLocaleString()}
                                         </p>
                                      </td>
                                      <td className="px-12 py-8 text-slate-400">
                                         <div className="max-w-xs group-hover:text-slate-600 transition-colors">
                                            <p className="text-xs font-medium tracking-tight leading-relaxed italic line-clamp-1 group-hover:line-clamp-none duration-500">
                                               {t.description}
                                            </p>
                                             {t.rideId && (
                                                <div className="flex items-center gap-2 mt-2">
                                                   <p className="text-[9px] font-black text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-lg uppercase tracking-widest border border-indigo-100/50">
                                                      ID: ...{(t.rideId?._id || t.rideId || '').toString().slice(-6).toUpperCase()}
                                                   </p>
                                                </div>
                                             )}
                                         </div>
                                      </td>
                                    </tr>
                                )) : (
                                   <tr>
                                      <td colSpan="5" className="px-12 py-32 text-center">
                                         <div className="flex flex-col items-center gap-4">
                                            <div className="h-20 w-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-100 shadow-inner">
                                               <Search size={36} />
                                            </div>
                                            <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] italic">No logs detected in this sector</p>
                                         </div>
                                      </td>
                                   </tr>
                                )}
                             </tbody>
                          </table>
                       </div>
                       
                       {/* Pagination Footer */}
                       <div className="p-10 border-t border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-10">
                          <div className="flex items-center gap-2.5">
                             <ShieldCheck size={16} className="text-emerald-500" />
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">Registry Integrity Verified</span>
                          </div>

                          <div className="flex items-center gap-8 self-center md:self-auto">
                            <button 
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="h-14 w-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-20 transition-all shadow-xl hover:shadow-indigo-900/10 active:scale-90"
                            >
                               <ArrowDownLeft size={20} />
                            </button>
                            
                            <div className="flex flex-col items-center min-w-[100px]">
                               <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] leading-none mb-2 text-center italic">Sector</p>
                               <p className="text-xl font-black text-slate-800 tracking-tighter italic leading-none">{currentPage} <span className="text-slate-300 hover:text-indigo-200 transition-colors mx-1">/</span> {totalPages || 1}</p>
                            </div>

                            <button 
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              className="h-14 w-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-20 transition-all shadow-xl hover:shadow-indigo-900/10 active:scale-90"
                            >
                               <ArrowUpRight size={20} />
                            </button>
                          </div>
                       </div>
                    </div>
                  )}
                </motion.div>
            </main>
        </div>
    );
};

export default AdminDashboard;
