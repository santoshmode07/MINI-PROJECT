import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useNotifications } from '../context/NotificationContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { driverStats } = useNotifications();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-outfit">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 max-w-6xl mx-auto w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-16 space-y-4"
        >
          <motion.div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 italic mb-4">
            <Sparkles size={12} fill="currentColor" /> Welcome Back
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none italic">
            Hello, <span className="text-indigo-600">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto italic">
            Where would you like to go today? Choose an option below to get started.
          </p>
        </motion.div>

        {/* Driver awareness stats summary */}
        {driverStats?.activeRidesCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mb-12 px-2"
          >
             <Link to="/my-rides" className="block group">
                <div className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 group-hover:bg-slate-900 transition-colors duration-500">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                   <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
                      <div className="space-y-2">
                         <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase opacity-60 mb-2 justify-center lg:justify-start">
                            <TrendingUp size={14} /> Active Transit Status
                         </div>
                         <h2 className="text-3xl md:text-4xl font-black italic">Manage Your <span className="text-indigo-200">Active Rides</span></h2>
                         <p className="text-indigo-100 font-medium max-w-md">You have {driverStats.activeRidesCount} active rides with {driverStats.totalBookingsCount} confirmed passengers.</p>
                      </div>
                      <div className="flex gap-4">
                         <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-3xl border border-white/10 text-center min-w-[120px]">
                            <p className="text-2xl font-black">{driverStats.activeRidesCount}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Rides</p>
                         </div>
                         <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-3xl border border-white/10 text-center min-w-[120px]">
                            <p className="text-2xl font-black">{driverStats.totalBookingsCount}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Passengers</p>
                         </div>
                      </div>
                      <div className="bg-white text-indigo-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/20 flex items-center gap-2 group-hover:gap-4 transition-all whitespace-nowrap">
                         View Roster <ArrowRight size={16} />
                      </div>
                   </div>
                </div>
             </Link>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <Link to="/find-rides" className="group">
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[4rem] -translate-y-4 translate-x-4 group-hover:bg-indigo-600 transition-colors duration-500"></div>
              <div className="h-20 w-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                <Search size={36} strokeWidth={2.5} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter italic">Find a Ride</h3>
              <p className="text-slate-500 font-medium italic opacity-80 mb-10">Search and join verified rides in your city.</p>
              <div className="mt-auto flex items-center gap-3 text-indigo-600 font-black text-xs uppercase tracking-widest italic group-hover:gap-5 transition-all">
                Search Now <ArrowRight size={16} />
              </div>
            </motion.div>
          </Link>

          <Link to="/offer-ride" className="group text-white">
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="bg-slate-900 p-10 rounded-[3rem] shadow-xl shadow-slate-900/20 border border-slate-800 flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[4rem] -translate-y-4 translate-x-4 group-hover:bg-indigo-600 transition-colors duration-500"></div>
              <div className="h-20 w-20 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-10 group-hover:bg-indigo-600 transition-all duration-500">
                <MapPin size={36} strokeWidth={2.5} />
              </div>
              <h3 className="text-3xl font-black mb-4 tracking-tighter italic">Offer a Ride</h3>
              <p className="text-slate-400 font-medium italic opacity-80 mb-10">Register your route and earn while you commute.</p>
              <div className="mt-auto flex items-center gap-3 text-indigo-400 font-black text-xs uppercase tracking-widest italic group-hover:gap-5 transition-all">
                Start Offering <ArrowRight size={16} />
              </div>
            </motion.div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
