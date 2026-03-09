import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LogOut, LayoutDashboard, User, ShieldCheck, Clock, MapPin, Search, IdCard, ArrowRight, Car } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex flex-col font-outfit selection:bg-indigo-100 selection:text-indigo-900">
      {/* Premium Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 md:px-12 py-4 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 transform hover:rotate-12 transition-transform duration-300">
            <LayoutDashboard className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-2xl tracking-tighter text-slate-800">Raid<span className="text-indigo-600">Dosthi</span></span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-10">
             <Link to="/find-rides" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Find Rides</Link>
             <Link to="/offer-ride" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Offer Ride</Link>
             <Link to="/bookings" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">My Bookings</Link>
          </div>
          <div className="h-8 w-[1px] bg-slate-200 hidden lg:block"></div>
          <button onClick={logout} className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center h-11 w-11 shadow-sm border border-slate-200/50">
             <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Main Command Center */}
      <main className="flex-1 pt-32 pb-24 px-6 max-w-7xl mx-auto w-full">
         
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Passenger Profile Sidebar */}
            <div className="lg:col-span-4 space-y-8">
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 text-center relative overflow-hidden"
               >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full translate-x-12 -translate-y-12 blur-3xl opacity-50"></div>
                  <div className="relative z-10">
                     <div className="h-28 w-28 rounded-[2.5rem] bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black mx-auto mb-6 shadow-2xl shadow-indigo-200 ring-8 ring-indigo-50">
                        {user?.name?.charAt(0)}
                     </div>
                     <h2 className="text-2xl font-black text-slate-800 leading-tight mb-1">{user?.name}</h2>
                     <div className="flex items-center justify-center gap-2 mb-8">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified {user?.gender} Co-Rider</span>
                        <div className="h-4 w-4 bg-emerald-500 rounded-full flex items-center justify-center ring-4 ring-emerald-50">
                           <ShieldCheck size={10} className="text-white" />
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-3 mb-8">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Rides Taken</p>
                           <p className="text-lg font-black text-slate-800 tracking-tight italic">12</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Safety Score</p>
                           <p className="text-lg font-black text-emerald-600 tracking-tight italic">98%</p>
                        </div>
                     </div>

                     <button className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-xl shadow-slate-200">
                        View Public Profile
                     </button>
                  </div>
               </motion.div>

               <div className="bg-indigo-600 p-8 rounded-[3rem] text-white space-y-6 shadow-2xl shadow-indigo-200 relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 translate-y-12 blur-3xl"></div>
                  <h3 className="text-xl font-bold leading-tight">Safety Passport <br/> Ready for Travel</h3>
                  <p className="text-indigo-100 text-sm font-medium opacity-80 uppercase tracking-wider text-[10px]">Your identity is secured with multi-factor biometric checks.</p>
                  <div className="flex gap-2">
                     <span className="h-2 w-8 bg-white/20 rounded-full"></span>
                     <span className="h-2 w-8 bg-white/20 rounded-full"></span>
                     <span className="h-2 w-16 bg-white rounded-full"></span>
                  </div>
               </div>
            </div>

            {/* Main Grid Actions */}
            <div className="lg:col-span-8 space-y-10">
               <div className="flex items-end justify-between px-2">
                  <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Command <span className="text-indigo-600 italic">Center.</span></h2>
                    <p className="text-slate-500 font-medium text-lg mt-1">Effortless travel connections start here.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Link to="/find-rides" className="group">
                     <motion.div 
                       whileHover={{ y: -8 }}
                       className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-indigo-100/30 border border-slate-100 relative overflow-hidden h-full flex flex-col justify-between"
                     >
                        <div className="h-20 w-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-indigo-100/50 group-hover:scale-110 transition-transform duration-500">
                           <Search size={36} strokeWidth={2.5} />
                        </div>
                        <div>
                           <h3 className="text-3xl font-black text-slate-800 mb-2 italic">Find a Ride</h3>
                           <p className="text-slate-500 font-medium mb-8 leading-relaxed">Join verified professionals heading your way.</p>
                           <div className="flex items-center gap-3 text-indigo-600 font-black text-sm uppercase tracking-widest">
                              Launch Radar <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                           </div>
                        </div>
                     </motion.div>
                  </Link>

                  <Link to="/offer-ride" className="group">
                     <motion.div 
                       whileHover={{ y: -8 }}
                       className="bg-indigo-600 p-10 rounded-[3.5rem] shadow-2xl shadow-indigo-200 text-white relative overflow-hidden h-full flex flex-col justify-between"
                     >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-12 -translate-y-12 blur-3xl opacity-50"></div>
                        <div className="h-20 w-20 bg-white/20 backdrop-blur-md text-white rounded-[2rem] flex items-center justify-center mb-8 border border-white/20 group-hover:scale-110 transition-transform duration-500">
                           <MapPin size={36} strokeWidth={2.5} />
                        </div>
                        <div className="relative z-10">
                           <h3 className="text-3xl font-black text-white mb-2 italic">Offer a Ride</h3>
                           <p className="text-indigo-100 font-medium mb-8 leading-relaxed opacity-80">Post your route and earn co-rider rewards.</p>
                           <div className="flex items-center gap-3 text-white font-black text-sm uppercase tracking-widest">
                              Create Route <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                           </div>
                        </div>
                     </motion.div>
                  </Link>
               </div>

               {/* Account Details Glass Card */}
               <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100"
               >
                  <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-4">
                     <IdCard className="text-indigo-600" size={28} />
                     Secure Identity <span className="text-indigo-600 italic">Credentials</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                     <div className="space-y-2 group">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] group-hover:text-indigo-600 transition-colors">Digital Email</p>
                        <p className="text-slate-800 font-black text-sm tracking-tight truncate italic">{user?.email}</p>
                     </div>
                     <div className="space-y-2 group">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] group-hover:text-indigo-600 transition-colors">Comm-Link ID</p>
                        <p className="text-slate-800 font-black text-sm tracking-tight italic">{user?.phone || 'Not Provided'}</p>
                     </div>
                     <div className="space-y-2 group">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] group-hover:text-indigo-600 transition-colors">License Key</p>
                        <p className="text-slate-800 font-black text-sm tracking-tight italic break-all">{user?.licenseNumber || 'Verified'}</p>
                     </div>
                  </div>
                  
                  <div className="mt-12 pt-10 border-t border-slate-50 flex items-center gap-6">
                     <div className="flex items-center gap-3 bg-emerald-50 text-emerald-600 px-5 py-3 rounded-2xl border border-emerald-100">
                        <ShieldCheck size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">Community Pass Active</span>
                     </div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-[200px] leading-relaxed">Identity re-verified every 30 days for transit safety.</p>
                  </div>
               </motion.div>
            </div>
         </div>
      </main>
    </div>
  );
};

export default Dashboard;
