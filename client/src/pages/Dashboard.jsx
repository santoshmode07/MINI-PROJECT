import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const { user } = useAuth();

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

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 max-w-5xl mx-auto w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-16 space-y-4"
        >
          <motion.div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 italic mb-4">
            <Sparkles size={12} fill="currentColor" /> Welcome Back
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-930 tracking-tighter leading-none italic">
            Hello, <span className="text-indigo-600">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto italic">
            Where would you like to go today? Choose an option below to get started.
          </p>
        </motion.div>

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
