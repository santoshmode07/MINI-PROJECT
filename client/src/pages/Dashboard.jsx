import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, User, ShieldCheck, MapPin, 
  Search, IdCard, ArrowRight, Car, TrendingUp, Sparkles,
  History, Settings, Briefcase, Bell
} from 'lucide-react';

import Navbar from '../components/Navbar';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const quickStats = [
    { label: 'Active Trips', value: '2', color: 'text-indigo-600', icon: Car },
    { label: 'Total Distance', value: '1,240 km', color: 'text-purple-600', icon: TrendingUp },
    { label: 'Savings', value: '₹2,400', color: 'text-emerald-600', icon: Briefcase }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex flex-col font-outfit selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      {/* Main Command Center */}
      <main className="flex-1 pt-32 pb-24 px-6 max-w-7xl mx-auto w-full">
         
         <div className="flex flex-col md:flex-row items-end justify-between mb-16 px-2 gap-8">
            <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
            >
               <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-indigo-100 italic">
                  <Sparkles size={12} /> System Status: Online
               </span>
               <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
                  Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 italic">{user?.name?.split(' ')[0]}</span>
               </h2>
               <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl">
                  Your verified travel portal is ready. Connect with co-riders, track earnings, and explore safe routes.
               </p>
            </motion.div>

            <div className="flex items-center gap-3">
               {quickStats.map((stat, i) => (
                  <div key={i} className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm text-center min-w-[140px]">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                     <p className={`text-xl font-black ${stat.color} tracking-tighter italic`}>{stat.value}</p>
                  </div>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Primary Action Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
               <Link to="/find-rides" className="group h-full">
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -8 }}
                    className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-indigo-100/30 border border-slate-100 relative overflow-hidden h-full flex flex-col justify-between"
                  >
                     <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-bl-full translate-x-12 -translate-y-12 blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000"></div>
                     <div className="relative z-10 h-24 w-24 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center mb-12 shadow-inner border border-indigo-100/50 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        <Search size={40} strokeWidth={2.5} />
                     </div>
                     <div className="relative z-10">
                        <h3 className="text-4xl font-black text-slate-900 mb-2 italic tracking-tighter">Find a Ride</h3>
                        <p className="text-slate-500 font-medium mb-10 leading-relaxed max-w-[240px]">Radar search through 100+ verified daily routes.</p>
                        <div className="flex items-center gap-3 text-indigo-600 font-black text-sm uppercase tracking-[0.2em]">
                           Launch Search <ArrowRight size={18} className="group-hover:translate-x-3 transition-transform" />
                        </div>
                     </div>
                  </motion.div>
               </Link>

               <Link to="/offer-ride" className="group h-full">
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -8 }}
                    className="bg-slate-900 p-12 rounded-[4rem] shadow-2xl shadow-slate-300 text-white relative overflow-hidden h-full flex flex-col justify-between"
                  >
                     <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                     <div className="relative z-10 h-24 w-24 bg-white/10 backdrop-blur-xl text-white rounded-[2.5rem] flex items-center justify-center mb-12 border border-white/20 group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all duration-500 shadow-2xl">
                        <MapPin size={40} strokeWidth={2.5} />
                     </div>
                     <div className="relative z-10">
                        <h3 className="text-4xl font-black text-white mb-2 italic tracking-tighter">Offer a Ride</h3>
                        <p className="text-slate-400 font-medium mb-10 leading-relaxed max-w-[240px]">Post your routine route and share transit rewards.</p>
                        <div className="flex items-center gap-3 text-indigo-400 font-black text-sm uppercase tracking-[0.2em]">
                           Start Protocol <ArrowRight size={18} className="group-hover:translate-x-3 transition-transform" />
                        </div>
                     </div>
                  </motion.div>
               </Link>
            </div>

            {/* Utility Space (Right Side) */}
            <div className="lg:col-span-4 space-y-8">
               <motion.div
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-100 space-y-6"
               >
                  <div className="flex items-center justify-between mb-2">
                     <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                        <History size={14} className="text-indigo-600" /> Recent Activity
                     </h4>
                     <Link to="/bookings" className="text-[10px] font-bold text-indigo-600 hover:underline underline-offset-4 italic">View All</Link>
                  </div>
                  
                  <div className="space-y-4">
                     {[1, 2].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100/50 group cursor-pointer hover:bg-white hover:shadow-md transition-all">
                           <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                              <Car size={18} />
                           </div>
                           <div className="flex-1">
                              <p className="text-xs font-black text-slate-800 italic">Trip to Office</p>
                              <p className="text-[10px] text-slate-500 font-medium">Completed • 09 Mar 2026</p>
                           </div>
                           <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-600" />
                        </div>
                     ))}
                  </div>
               </motion.div>

               <div className="bg-indigo-600 p-8 rounded-[3.5rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 -translate-y-12 blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000"></div>
                  <div className="flex items-center gap-4 mb-6">
                     <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                        <Bell size={24} className="text-white" />
                     </div>
                     <p className="text-sm font-black italic tracking-tight">Active Alerts</p>
                  </div>
                  <p className="text-indigo-100 text-xs font-medium leading-relaxed mb-6 opacity-80">
                     New ID-Verified riders joined your frequent route between Chennai and Vellore.
                  </p>
                  <button className="w-full h-12 bg-white text-indigo-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-xl shadow-indigo-800/20">
                     Check New Connections
                  </button>
               </div>
            </div>

         </div>

         {/* Bottom Control Strip */}
         <div className="mt-20 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
            <div className="flex items-center gap-3"><ShieldCheck size={20} /><span className="text-[10px] font-black uppercase tracking-[0.3em]">Protocol Verified</span></div>
            <div className="flex items-center gap-3"><Settings size={20} /><span className="text-[10px] font-black uppercase tracking-[0.3em]">Auto-Sync Enabled</span></div>
            <div className="flex items-center gap-3"><Bell size={20} /><span className="text-[10px] font-black uppercase tracking-[0.3em]">Smart Alerts On</span></div>
         </div>
      </main>
    </div>
  );
};

const ChevronRight = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default Dashboard;
