import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Zap, Star, ShieldCheck, Users, 
  ArrowLeft, LayoutDashboard, Sparkles, 
  Search, Shield, Gift 
} from 'lucide-react';
import Navbar from '../components/Navbar';

const PriorityBenefits = () => {
  const benefits = [
    {
      title: "VIP Search Visibility",
      description: "Your bookings are highlighted to drivers with a 'Priority Legend' tag, making them 3x more likely to be accepted immediately.",
      icon: Search,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "Elite Driver Matching",
      description: "Our algorithm prioritizes matching you with 'Highly Reliable' drivers (Trust Score > 90) to ensure your next trip is perfect.",
      icon: ShieldCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Instant Verification Trust",
      description: "New drivers see your badge and know you are a verified, serious traveler who respect the community rules.",
      icon: Shield,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Cancellation Insurance",
      description: "If any future driver cancels on you while you have this badge, they face stricter penalties (Scenario 4) to protect your time.",
      icon: Gift,
      color: "text-rose-600",
      bg: "bg-rose-50"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex flex-col font-outfit">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-6 max-w-5xl mx-auto w-full">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-black text-xs uppercase tracking-widest mb-10 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>

        <section className="mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 italic">
              <Sparkles size={14} fill="currentColor" /> Premium Status Unlocked
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none italic">
              Priority <span className="text-indigo-600">Benefits.</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto italic">
              You've been awarded this status as part of our Justice System. Here is how we prioritize your transit for the next 7 days.
            </p>
          </motion.div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:border-indigo-100 transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] group-hover:bg-indigo-600 transition-colors duration-500 opacity-50 group-hover:opacity-10"></div>
              
              <div className={`${benefit.bg} ${benefit.color} h-16 w-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner ring-4 ring-white group-hover:scale-110 transition-transform`}>
                <benefit.icon size={32} />
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight italic">{benefit.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed italic">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 bg-slate-900 rounded-[3.5rem] p-12 text-center text-white relative overflow-hidden shadow-2xl"
        >
           <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 to-slate-900"></div>
           <div className="relative z-10">
              <Zap className="text-amber-400 mx-auto mb-6" size={48} fill="currentColor" />
              <h2 className="text-3xl font-black tracking-tight italic mb-4">Ready to test your status?</h2>
              <p className="text-slate-400 font-medium mb-10 max-w-md mx-auto italic">Search for a ride now. You'll see your priority badge active in the results.</p>
              <Link to="/find-rides" className="inline-flex h-16 px-10 bg-indigo-600 rounded-2xl items-center justify-center font-black uppercase tracking-widest text-xs hover:bg-white hover:text-indigo-900 transition-all shadow-xl shadow-indigo-900/40">
                Explore Available Rides
              </Link>
           </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PriorityBenefits;
