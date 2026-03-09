import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, User, ShieldCheck, 
  MapPin, IdCard, Mail, Phone, Fingerprint,
  Award, Star, Shield, Settings, ChevronRight
} from 'lucide-react';

import Navbar from '../components/Navbar';

const Profile = () => {
  const { user, logout } = useAuth();

  const stats = [
    { label: 'Rides Taken', value: '12', icon: MapPin, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Safety Score', value: '98%', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Rating', value: '4.9', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Rewards', value: '240', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' }
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
                     <div className="absolute bottom-2 right-2 h-10 w-10 bg-emerald-500 rounded-2xl flex items-center justify-center ring-[6px] ring-white shadow-lg">
                        <ShieldCheck size={20} className="text-white" />
                     </div>
                  </div>
                  
                  <div className="flex-1 pb-2">
                     <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{user?.name}</h1>
                     <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200/50">
                           <User size={14} className="text-slate-500" />
                           <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest leading-none">Verified {user?.gender} Member</span>
                        </div>
                        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100/50">
                           <Shield size={14} className="text-indigo-600" />
                           <span className="text-[11px] font-black text-indigo-700 uppercase tracking-widest leading-none underline decoration-indigo-200">Trust Certified V2.0</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <button className="px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-indigo-100 flex items-center gap-3 group">
                        <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                        Edit Profile
                     </button>
                  </div>
               </div>

               {/* Stats Grid */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                  {stats.map((stat, i) => (
                     <motion.div 
                       key={i}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: i * 0.1 }}
                       className="bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100 text-center hover:bg-white hover:shadow-xl hover:shadow-indigo-50 transition-all group"
                     >
                        <div className={`${stat.bg} ${stat.color} h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                           <stat.icon size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tighter italic">{stat.value}</p>
                     </motion.div>
                  ))}
               </div>

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
    </div>
  );
};

export default Profile;
