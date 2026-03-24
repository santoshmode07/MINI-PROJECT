import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { 
  LogOut, LayoutDashboard, User, ShieldCheck, 
  MapPin, IdCard, Mail, Phone, Fingerprint,
  Award, Star, Shield, Settings, ChevronRight,
  AlertTriangle, History, Zap, Ban, Wallet, CreditCard, ArrowUpRight,
  DollarSign, IndianRupee, Eye, EyeOff, RefreshCw, AlertCircle
} from 'lucide-react';

import Navbar from '../components/Navbar';
import AddMoneyModal from '../components/AddMoneyModal';
import WithdrawMoneyModal from '../components/WithdrawMoneyModal';

const Profile = () => {
  const { user, refreshUser } = useAuth(); // assume refreshed user data needs to be pulled
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(user?.walletBalance || 0);

  const fetchWalletData = async () => {
     try {
        const { data } = await api.get('/payments/wallet/statement');
        if (data.success) {
           setTransactions(data.transactions);
           setBalance(data.balance);
        }
     } catch (error) {
        console.error('Failed to fetch wallet status');
     }
  };

  useEffect(() => {
     fetchWalletData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchWalletData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const getTrustScoreInfo = (score) => {
    if (score >= 90) return { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', label: 'Highly Reliable' };
    if (score >= 70) return { color: 'text-amber-600 bg-amber-50 border-amber-100', label: 'Generally Reliable' };
    if (score >= 50) return { color: 'text-orange-600 bg-orange-50 border-orange-100', label: 'Rides with Caution' };
    return { color: 'text-rose-600 bg-rose-50 border-rose-100', label: 'Unreliable' };
  };

  const stats = [
    { label: 'Trust Score', value: user?.trustScore || 100, icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Trips Completed', value: user?.totalCompletedRides || 0, icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Rating', value: user?.averageRating || 5.0, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'History', value: `${user?.totalCancellations || 0} Cancels`, icon: History, color: 'text-purple-600', bg: 'bg-purple-50' }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex flex-col font-outfit selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      {/* Profile Content */}
      <main className="flex-1 pt-32 pb-24 px-6 max-w-5xl mx-auto w-full">
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white rounded-[4rem] shadow-2xl shadow-indigo-100/30 border border-slate-100 overflow-hidden"
         >
            {/* Header Banner */}
            <div className="h-48 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 relative">
               <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]"></div>
               <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
            </div>

            {/* Profile Info Overlay */}
            <div className="px-10 md:px-16 pb-16 relative -mt-24">
               <div className="flex flex-col md:flex-row items-end gap-8 mb-12">
                  <div className="relative group">
                     <div className="h-40 w-40 rounded-[3.5rem] bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-6xl font-black shadow-2xl shadow-indigo-200 ring-[12px] ring-white">
                        {user?.name?.charAt(0)}
                     </div>
                     <div className="absolute bottom-2 right-2 h-14 w-14 bg-white rounded-2xl flex items-center justify-center ring-[6px] ring-white shadow-lg">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black ${getTrustScoreInfo(user?.trustScore).color}`}>
                           {user?.trustScore}
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex-1 pb-2">
                     <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 italic">@{user?.name.replace(/\s/g, '').toLowerCase()}</h1>
                     <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200/50">
                           <User size={14} className="text-slate-500" />
                           <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest leading-none">{user?.gender} Member</span>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-black text-[11px] uppercase tracking-widest leading-none ${getTrustScoreInfo(user?.trustScore).color}`}>
                           <Shield size={14} />
                           {getTrustScoreInfo(user?.trustScore).label}
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <button className="px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-indigo-100 flex items-center gap-3 group">
                        <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                        Edit Profile
                     </button>
                     {user?.role === 'admin' && (
                         <Link 
                           to="/admin"
                           className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-xl flex items-center gap-3 group"
                         >
                            <LayoutDashboard size={18} />
                            Admin Console
                         </Link>
                      )}
                  </div>
               </div>

                {/* Wallet & Stats — JUSTICE ECONOMY */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                   {/* Main Wallet Card */}
                   <motion.div 
                     whileHover={{ y: -8, scale: 1.01 }}
                     whileTap={{ scale: 0.98 }}
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="lg:col-span-1 bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 group cursor-default"
                   >
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-400/30 transition-all duration-700 ${isRefreshing ? 'animate-pulse scale-150' : ''}`}></div>
                      
                      <div className="relative z-10 flex flex-col h-full justify-between">
                         <div>
                            <div className="flex items-center justify-between mb-8">
                               <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                  <Wallet size={24} className="text-indigo-400" />
                               </div>
                               <div className="flex gap-2">
                                  <button 
                                    onClick={() => setShowBalance(!showBalance)}
                                    className="h-10 w-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors text-white/40 hover:text-white"
                                  >
                                     {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
                                  </button>
                                  <button 
                                    onClick={handleRefresh}
                                    className={`h-10 w-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors text-white/40 hover:text-white ${isRefreshing ? 'animate-spin' : ''}`}
                                  >
                                     <RefreshCw size={18} />
                                  </button>
                               </div>
                            </div>
                            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Available Funds</p>
                            <h2 className={`text-5xl font-black tracking-tighter italic flex items-start ${balance < 0 ? 'text-rose-500' : ''}`}>
                               <span className={`text-2xl mt-1.5 mr-1 not-italic opacity-50 ${balance < 0 ? 'text-rose-400' : ''}`}>₹</span>
                               {showBalance ? balance : '••••••'}
                            </h2>
                            {balance < 0 && (
                               <div className="flex items-center gap-2 mt-2 text-rose-400">
                                  <AlertTriangle size={12} />
                                  <span className="text-[9px] font-black uppercase tracking-widest">Clear Negative Balance</span>
                               </div>
                            )}
                         </div>

                         {/* Mini Ledger Peek — Interactive bit */}
                         <div className="flex-1 my-6 space-y-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center justify-between">
                               <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400/60">Recent Activity</p>
                               <Link to="/wallet-history" className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">View All</Link>
                            </div>
                            {transactions.length > 0 ? (
                               transactions.slice(0, 2).map((t, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-[11px] font-bold">
                                     <span className="text-white/60 truncate mr-4 italic">"{t.description}"</span>
                                     <span className={t.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                        {t.amount > 0 ? '+' : ''}{t.amount}
                                     </span>
                                  </div>
                               ))
                            ) : (
                               <p className="text-[10px] italic text-white/30">No recent transactions</p>
                            )}
                         </div>
                         
                         <div className="mt-4 flex flex-col gap-3">
                            <div className="flex gap-3">
                               <button 
                                 onClick={() => setShowTopUp(true)}
                                 className={`flex-1 ${balance < 0 ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-white hover:text-indigo-600'} text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2`}
                               >
                                  <CreditCard size={14} /> Add Money
                               </button>
                               <Link 
                                  to="/wallet-history"
                                  className="h-12 w-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-colors text-indigo-300 group/arrow shrink-0"
                               >
                                  <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                               </Link>
                            </div>
                            <button 
                              onClick={() => setShowWithdraw(true)}
                              className="w-full bg-slate-900/50 hover:bg-rose-600 border border-white/10 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                               <ArrowUpRight size={14} className="rotate-180" /> Request Withdrawal
                            </button>
                         </div>
                      </div>
                   </motion.div>

                   {/* Stats Area */}
                   <div className="lg:col-span-2 grid grid-cols-2 gap-6">
                      {stats.map((stat, i) => (
                         <motion.div 
                           key={i}
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: i * 0.1 }}
                           className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-50 transition-all group"
                         >
                            <div className={`${stat.bg} ${stat.color} h-12 w-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                               <stat.icon size={22} />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                               <p className="text-2xl font-black text-slate-800 tracking-tighter italic">{stat.value}</p>
                            </div>
                         </motion.div>
                      ))}
                   </div>
                </div>

                {/* Priority Status — Justice Reward */}
                {user?.priorityBadgeExpires && new Date(user.priorityBadgeExpires) > new Date() && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12 bg-gradient-to-r from-indigo-600 to-indigo-900 p-8 rounded-[3rem] text-white flex items-center justify-between shadow-2xl shadow-indigo-200 border border-indigo-400 relative overflow-hidden group"
                  >
                     <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-x-12 -translate-y-12"></div>
                     <div className="flex items-center gap-6 relative z-10">
                        <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 animate-pulse text-indigo-200">
                           <Award size={32} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300 mb-1">Active Reward Protocol</p>
                           <h3 className="text-2xl font-black italic tracking-tighter">Priority Search <span className="text-indigo-200 uppercase">Unlocked</span></h3>
                           <p className="text-indigo-100/60 text-xs font-medium italic mt-1">Valid until {new Date(user.priorityBadgeExpires).toLocaleDateString()} — <Link to="/priority-benefits" className="text-white underline font-black ml-1">See Benefits</Link></p>
                        </div>
                     </div>
                     <div className="bg-white/10 px-6 py-4 rounded-2xl border border-white/10 text-center relative z-10">
                        <Star className="text-amber-400 fill-amber-400 mx-auto mb-1" size={16} />
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/80 leading-none">VIP Access</p>
                     </div>
                  </motion.div>
                )}

               {/* Penalty & History Dashboard (New) */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                  <div className="bg-rose-50/50 p-8 rounded-[3rem] border border-rose-100/50 flex items-center gap-6">
                     <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-rose-600 shadow-sm border border-rose-100">
                        <AlertTriangle size={24} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Warning Count</p>
                        <p className="text-2xl font-black text-rose-600">{user?.warnings || 0} / 3</p>
                     </div>
                  </div>
                  <div className="bg-slate-900 p-8 rounded-[3rem] text-white flex items-center gap-6 shadow-2xl shadow-slate-200">
                     <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center text-rose-400 backdrop-blur-md border border-white/10">
                        <Zap size={24} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Strikes</p>
                        <p className="text-2xl font-black text-rose-500">{user?.strikes || 0} STRIKES</p>
                     </div>
                  </div>
                  <div className={`p-8 rounded-[3rem] flex items-center gap-6 border-2 transition-all ${user?.restrictedUntil && new Date(user.restrictedUntil) > new Date() ? 'bg-rose-600 text-white border-rose-600 shadow-xl shadow-rose-200' : 'bg-slate-50 border-slate-100 opacity-40'}`}>
                     <div className={`h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center ${user?.restrictedUntil && new Date(user.restrictedUntil) > new Date() ? 'text-white' : 'text-slate-300'}`}>
                        <Ban size={24} />
                     </div>
                     <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${user?.restrictedUntil && new Date(user.restrictedUntil) > new Date() ? 'text-rose-100' : 'text-slate-400'}`}>Restricted Status</p>
                        <p className="text-sm font-black italic">{user?.restrictedUntil && new Date(user.restrictedUntil) > new Date() ? 'ACCOUNT BLOCKED' : 'NO RESTRICTIONS'}</p>
                     </div>
                  </div>
               </div>

               {/* Appeal System — Justice Dashboard */}
               {user?.strikes > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-12 bg-indigo-50/50 p-8 md:p-12 rounded-[3.5rem] border border-indigo-100 relative overflow-hidden group"
                  >
                     <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
                     
                     <div className="flex flex-col md:flex-row gap-10 relative z-10">
                        <div className="flex-1">
                           <div className="flex items-center gap-4 mb-6">
                              <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                                 <Shield size={24} />
                              </div>
                              <h3 className="text-2xl font-black text-slate-800 tracking-tight italic">Justice Appeal Portal</h3>
                           </div>
                           
                           {user.appealCount >= 2 ? (
                              <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 flex items-center gap-4">
                                 <Ban className="text-rose-500" size={20} />
                                 <p className="text-sm font-black text-rose-600 uppercase tracking-widest">Appeal limit reached for this year (Max 2)</p>
                              </div>
                           ) : (user.lastStrikeAt && (new Date() - new Date(user.lastStrikeAt)) > 48 * 60 * 60 * 1000) ? (
                              <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
                                 <Clock className="text-slate-400" size={20} />
                                 <p className="text-sm font-black text-slate-500 uppercase tracking-widest italic">Appeal window has closed (48h expired)</p>
                              </div>
                           ) : (
                              <div className="space-y-6">
                                 <p className="text-slate-600 font-medium leading-relaxed italic">
                                    Believe your strike was unfair? Our safety team manually reviews appeals within 24 hours.
                                 </p>
                                 <div className="bg-white p-8 rounded-[2.5rem] border border-indigo-100 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[.2em] mb-4">How to Appeal</p>
                                    <div className="space-y-4 font-bold text-slate-800 italic">
                                       <div className="flex items-center gap-4 group/mail cursor-pointer">
                                          <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover/mail:scale-110 transition-transform">
                                             <Mail size={18} />
                                          </div>
                                          <p className="text-lg tracking-tight">support.raiddhosthi@gmail.com</p>
                                       </div>
                                       <div className="pl-14 space-y-2">
                                          <p className="flex items-center gap-3 text-xs text-slate-500 uppercase tracking-widest"><span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span> Include Registered Email: {user.email}</p>
                                          <p className="flex items-center gap-3 text-xs text-slate-500 uppercase tracking-widest"><span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span> Attach Ride ID & Clear Explanation</p>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           )}
                        </div>
                        
                        <div className="md:w-64 bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white flex flex-col justify-center items-center text-center">
                           <Award className="text-indigo-400 mb-4" size={40} />
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fairness Guarantee</p>
                           <p className="text-xs font-bold text-slate-600 italic">Every appeal is reviewed by a human team member.</p>
                        </div>
                     </div>
                  </motion.div>
               )}

               {/* Details Sections */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-white p-8 rounded-[3rem] border border-slate-100">
                     <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-4">
                        <Fingerprint className="text-indigo-600" /> Digital Credentials
                     </h3>
                     <div className="space-y-6">
                        <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                           <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-inner">
                              <Mail size={18} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                              <p className="text-slate-700 font-bold italic">{user?.email}</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                           <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-inner">
                              <Phone size={18} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Comm ID</p>
                              <p className="text-slate-700 font-bold italic">{user?.phone || 'Not Connected'}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white p-8 rounded-[3rem] border border-slate-100">
                     <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                        <IdCard className="text-indigo-600" /> Government Verification
                     </h3>
                     <div className="space-y-6">
                        <div className="bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100/50">
                           <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[.2em]">License Plate Vault</p>
                              <ShieldCheck size={14} className="text-indigo-600" />
                           </div>
                           <p className="text-xl font-black text-slate-800 tracking-wider break-all italic">{user?.licenseNumber || 'VERIFIED_USER'}</p>
                        </div>
                        <div className="flex items-center justify-between px-4">
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aadhaar Key</span>
                           <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">ENCRYPTED</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Quick Links */}
               <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link to="/bookings" className="flex items-center justify-between bg-white border border-slate-100 p-6 rounded-3xl hover:border-indigo-200 transition-all group shadow-sm">
                     <span className="font-bold text-slate-700">Trip History</span>
                     <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link to="/offer-ride" className="flex items-center justify-between bg-white border border-slate-100 p-6 rounded-3xl hover:border-indigo-200 transition-all group shadow-sm">
                     <span className="font-bold text-slate-700">Earnings Log</span>
                     <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <div className="flex items-center justify-between bg-white border border-slate-100 p-6 rounded-3xl hover:border-red-200 transition-all group shadow-sm cursor-pointer opacity-50 grayscale hover:grayscale-0">
                     <span className="font-bold text-slate-700">Emergency Protocol</span>
                     <ChevronRight size={18} className="text-slate-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                  </div>
               </div>
            </div>
         </motion.div>
      </main>

      {/* Add Money Modal — STRIPE INTEGRATION */}
      <AddMoneyModal 
        show={showTopUp} 
        onClose={() => setShowTopUp(false)} 
        onSuccess={async () => {
           setShowTopUp(false);
           await refreshUser(); 
           await fetchWalletData();
        }}
      />
      
      <WithdrawMoneyModal 
        show={showWithdraw} 
        onClose={() => setShowWithdraw(false)} 
        balance={balance}
        onSuccess={async () => {
           await refreshUser();
           await fetchWalletData();
        }}
      />
    </div>
  );
};

export default Profile;
