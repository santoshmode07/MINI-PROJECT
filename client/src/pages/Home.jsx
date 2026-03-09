import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, Star, Users, MapPin, 
  Sparkles, CheckCircle2, TrendingUp, Zap, Award, 
  LayoutDashboard, LogOut, ChevronRight, Globe, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import heroImage from '../assets/hero.png';
import mockupImage from '../assets/mockup.png';

const Home = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Safety', href: '#safety' },
    { name: 'Features', href: '#features' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-outfit selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {/* Premium Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 md:px-12 py-4 md:py-6 ${
        scrolled ? 'bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 transform hover:rotate-12 transition-transform duration-300">
              <LayoutDashboard className="text-white h-5 w-5" />
            </div>
            <span className="font-bold text-2xl tracking-tighter text-slate-800">Raid<span className="text-indigo-600">Dosthi</span></span>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors tracking-tight"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {token ? (
              <>
                <Link to="/dashboard" className="hidden sm:flex items-center gap-2 bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all">
                  Dashboard <ChevronRight size={14} />
                </Link>
                <button onClick={logout} className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all border border-slate-200/50">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors mr-2">Login</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.1em] hover:bg-slate-900 transition-all shadow-xl shadow-indigo-200 active:scale-95">
                  Join Community
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-50 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 -z-10 opacity-60"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-8 border border-indigo-100 shadow-sm">
                <Sparkles size={14} className="animate-pulse" /> The Future of Transit is Shared
              </span>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8">
                Rideshare with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 italic">Confidence.</span>
              </h1>
              <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto lg:mx-0 mb-12 leading-relaxed">
                Connect with verified professionals and students in a secure, community-driven network. Save costs, reduce carbon, and travel safe.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
                <Link to="/register" className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200 group active:scale-95">
                  Get Started Now <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link to="/find-rides" className="w-full sm:w-auto bg-white text-slate-700 px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-200 flex items-center justify-center gap-3 shadow-sm active:scale-95">
                  Find a Ride
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-8 opacity-60">
                <div className="flex items-center gap-2 text-slate-700">
                  <ShieldCheck size={18} className="text-indigo-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Aadhaar Verified</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Award size={18} className="text-indigo-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Premium Community</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Globe size={18} className="text-indigo-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Eco-Friendly</span>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 relative"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(79,70,229,0.3)] border-8 border-white">
              <img src={heroImage} alt="Premium Ride Sharing" className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-1000" />
            </div>
            {/* Float Floating Badges */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute -top-10 -right-10 bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-100 hidden md:block z-20"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm italic tracking-tight">Verified Driver</p>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Safety Pass Active</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Brands Section */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] mb-12">Trusted co-riders from leading organizations</p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 font-black text-slate-200 text-3xl md:text-4xl tracking-[0.3em] italic uppercase opacity-50 hover:opacity-100 transition-all duration-700">
            <span className="hover:text-indigo-600 transition-colors cursor-default">Microsoft</span>
            <span className="hover:text-indigo-600 transition-colors cursor-default">Google</span>
            <span className="hover:text-indigo-600 transition-colors cursor-default">TCS</span>
            <span className="hover:text-indigo-600 transition-colors cursor-default">Infosys</span>
            <span className="hover:text-indigo-600 transition-colors cursor-default">Amazon</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-[#FDFDFF] relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6">Designed for <span className="text-indigo-600 italic">Modern</span> Mobility.</h2>
            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto leading-relaxed">We've built the world's most secure ride-sharing platform for professionals, focus on safety, community, and efficiency.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { 
                icon: ShieldCheck, 
                title: 'ID-Pass Verified', 
                desc: 'Every member must pass Aadhaar and License verification before joining.',
                color: 'text-indigo-500',
                bg: 'bg-indigo-50'
              },
              { 
                icon: Users, 
                title: 'Professional Circle', 
                desc: 'Connect with verified colleagues and co-workers from top organizations.',
                color: 'text-purple-500',
                bg: 'bg-purple-50'
              },
              { 
                icon: Zap, 
                title: 'Smart Matching', 
                desc: 'Our radar-based search finds the most efficient routes and timings for you.',
                color: 'text-amber-500',
                bg: 'bg-amber-50'
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-indigo-100 transition-all group"
              >
                <div className={`${feature.bg} ${feature.color} h-16 w-16 rounded-2xl flex items-center justify-center mb-8 border border-slate-50 shadow-inner group-hover:scale-110 transition-transform`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mockup Section */}
      <section id="safety" className="py-32 bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500-10 rounded-full blur-[150px] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-24">
          <div className="flex-1 relative order-2 lg:order-1">
             <div className="relative z-10 rounded-[3.5rem] overflow-hidden shadow-2xl shadow-indigo-500/20 ring-1 ring-white/10 max-w-sm mx-auto lg:mx-0">
                <img src={mockupImage} alt="App Mockup" className="w-full h-auto" />
             </div>
             {/* Decorative particles */}
             <div className="absolute -top-10 -left-10 h-32 w-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
             <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-purple-500/20 rounded-full blur-3xl"></div>
          </div>
          <div className="flex-1 order-1 lg:order-2 text-white">
            <span className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] mb-8 inline-block">Safety Protocol One</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-[0.9]">Experience the <span className="text-indigo-400 italic">Verified</span> Difference.</h2>
            <div className="space-y-8">
               {[
                 { title: 'Biometric Verification', desc: 'Secure login and multi-factor authentication for every ride.' },
                 { title: 'Gender Preference', desc: 'Specialized safe zones for female passengers and drivers.' },
                 { title: 'Live Trip Intel', desc: 'Share your live route coordinates with emergency contacts instantly.' }
               ].map((item, i) => (
                 <div key={i} className="flex gap-6 items-start group">
                    <div className="h-8 w-8 bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0 border border-indigo-500/30 group-hover:bg-indigo-500 transition-colors">
                       <CheckCircle2 size={16} className="text-indigo-400 group-hover:text-white" />
                    </div>
                    <div>
                       <h4 className="text-xl font-bold tracking-tight mb-2 italic uppercase">{item.title}</h4>
                       <p className="text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-200"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-[80px]"></div>
          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10 leading-none">Ready to start your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 italic">Next Journey?</span></h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/register" className="w-full sm:w-auto bg-white text-indigo-700 px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-2xl active:scale-95">
                Join Now Free
              </Link>
              <Link to="/find-rides" className="w-full sm:w-auto bg-indigo-500/30 backdrop-blur-md text-white border border-white/20 px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95">
                Calculate Savings
              </Link>
            </div>
            <p className="mt-12 text-indigo-200 font-bold uppercase tracking-[0.2em] text-xs">Join 10,000+ verified professionals today</p>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-1">
             <div className="flex items-center gap-3 mb-8">
                <div className="bg-indigo-600 p-2 rounded-xl shadow-lg">
                  <LayoutDashboard className="text-white h-5 w-5" />
                </div>
                <span className="font-bold text-2xl tracking-tighter text-slate-800">Raid<span className="text-indigo-600">Dosthi</span></span>
             </div>
             <p className="text-slate-500 font-medium leading-relaxed mb-10">Revolutionizing urban transit through verified community trust and shared journeys.</p>
             <div className="flex gap-4">
               {/* Social placeholders */}
               <div className="h-12 w-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 cursor-pointer transition-all">
                  <Globe size={20} />
               </div>
               <div className="h-12 w-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 cursor-pointer transition-all">
                  <Lock size={20} />
               </div>
             </div>
          </div>
          
          <div>
            <h4 className="text-slate-800 font-black text-sm uppercase tracking-widest mb-8">Product</h4>
            <ul className="space-y-4 text-slate-500 font-bold text-sm">
               <li className="hover:text-indigo-600 cursor-pointer transition-colors">Find a Ride</li>
               <li className="hover:text-indigo-600 cursor-pointer transition-colors">Offer a Ride</li>
               <li className="hover:text-indigo-600 cursor-pointer transition-colors">Enterprise</li>
               <li className="hover:text-indigo-600 cursor-pointer transition-colors">Price Match</li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-800 font-black text-sm uppercase tracking-widest mb-8">Resources</h4>
            <ul className="space-y-4 text-slate-500 font-bold text-sm">
               <li className="hover:text-indigo-600 cursor-pointer transition-colors">Safety Protocol</li>
               <li className="hover:text-indigo-600 cursor-pointer transition-colors">Verified Drivers</li>
               <li className="hover:text-indigo-600 cursor-pointer transition-colors">Student Plan</li>
               <li className="hover:text-indigo-600 cursor-pointer transition-colors">Carbon Report</li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-800 font-black text-sm uppercase tracking-widest mb-8">Legal</h4>
            <ul className="space-y-4 text-slate-500 font-bold text-sm">
               <li className="hover:text-indigo-600 cursor-pointer transition-colors">Privacy Policy</li>
               <li className="hover:text-indigo-600 cursor-pointer transition-colors">Terms of Service</li>
               <li className="hover:text-indigo-600 cursor-pointer transition-colors">Compliance</li>
               <li className="hover:text-indigo-600 cursor-pointer transition-colors">Biometrics Consent</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-slate-50 text-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">© 2026 RaidDosthi Transit Systems. Handcrafted by Design Mavericks.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
