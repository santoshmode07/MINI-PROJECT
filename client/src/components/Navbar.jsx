import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Find Rides', path: '/find-rides' },
    { name: 'Offer Ride', path: '/offer-ride' },
    { name: 'My Bookings', path: '/bookings' },
    { name: 'Profile', path: '/profile' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 md:px-12 py-4 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-4 group">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 transform group-hover:rotate-12 transition-transform duration-300">
            <LayoutDashboard className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-2xl tracking-tighter text-slate-800">Raid<span className="text-indigo-600">Dosthi</span></span>
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`text-sm font-bold transition-colors relative ${
                isActive(link.path) 
                ? 'text-indigo-600 after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600' 
                : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
        <div className="h-8 w-[1px] bg-slate-200 hidden lg:block"></div>
        
        <div className="flex items-center gap-4">
          <Link to="/profile" className="hidden sm:flex items-center gap-3 bg-white py-1.5 px-4 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-colors group">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold ring-2 ring-indigo-50 group-hover:scale-110 transition-transform">
              {user?.name?.charAt(0)}
            </div>
            <span className="text-sm font-bold text-slate-800 leading-none">{user?.name?.split(' ')[0]}</span>
          </Link>
          <button 
            onClick={logout} 
            className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
