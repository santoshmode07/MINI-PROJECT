import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Shield, ShieldCheck, Mail, Phone, Calendar, 
  MoreVertical, UserPlus, ArrowUpRight, Loader2, AlertTriangle,
  UserCheck, UserMinus, HardDrive, X, Wallet, Star, MapPin, 
  Fingerprint, Award, TrendingUp, Briefcase
} from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

const UserDetailModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white/90 w-full max-w-lg rounded-[3rem] shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden border border-white/20"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 w-full"></div>

        <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
            {/* Header Section */}
            <div className="flex flex-col items-center text-center mb-10">
                <div className="relative mb-6">
                    <div className="h-24 w-24 bg-white rounded-3xl flex items-center justify-center text-slate-200 text-3xl font-black uppercase shadow-2xl ring-4 ring-slate-50 overflow-hidden transition-transform duration-700 hover:rotate-6">
                        {user.profilePhoto ? (
                            <img 
                                src={user.profilePhoto} 
                                className="w-full h-full object-cover hd-profile" 
                                loading="eager"
                                decoding="async"
                            />
                        ) : user.name[0]}
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-emerald-500 rounded-xl border-4 border-white flex items-center justify-center shadow-lg z-20">
                        <ShieldCheck size={14} className="text-white" />
                    </div>
                </div>
                
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-2">{user.name}</h2>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/50">
                        {user.role} Authority
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-mono">ID: {user._id.toString().slice(-8).toUpperCase()}</span>
                </div>
            </div>

            {/* Core Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center group hover:bg-white hover:shadow-xl transition-all duration-500">
                    <Star size={20} className="text-amber-400 mb-2 group-hover:scale-125 transition-transform" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Trust Integrity</p>
                    <p className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">{user.trustScore || 100}%</p>
                </div>
                <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center group hover:bg-white hover:shadow-xl transition-all duration-500">
                    <Briefcase size={20} className="text-slate-400 mb-2 group-hover:scale-125 transition-transform" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Operations</p>
                    <p className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">{user.totalCompletedRides || 0} Rides</p>
                </div>
            </div>

            {/* Verification & Detail Cards */}
            <div className="space-y-3">
                {[
                    { icon: Mail, label: 'Verified Email', value: user.email, theme: 'indigo' },
                    { icon: Phone, label: 'Secure Channel', value: user.phone || 'Not Registered', theme: 'emerald' },
                    { icon: Fingerprint, label: 'Government Vault', value: user.licenseNumber || 'Verified Guest', theme: 'slate' }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-5 p-5 bg-white border border-slate-50 rounded-2xl hover:border-indigo-100 hover:shadow-lg transition-all group">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center
                            ${item.theme === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                              item.theme === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                              'bg-slate-50 text-slate-400'}`}>
                            <item.icon size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{item.label}</p>
                            <p className="text-xs font-bold text-slate-700 tracking-tight">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Metadata */}
            <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
                <div>
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Accession Logged</p>
                    <p className="text-[10px] font-bold text-slate-500 italic uppercase mt-0.5">{new Date(user.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                <button 
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors shadow-lg active:scale-95"
                >
                    Dismiss Record
                </button>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get('/admin/users');
                setUsers(data.data);
            } catch (error) {
                toast.error('Failed to access encrypted user registry');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-slate-50">
            <Loader2 className="h-16 w-16 animate-spin text-slate-900 mb-6 drop-shadow-2xl" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Accessing Member Directory...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Navbar />
            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                           <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-lg shadow-emerald-100">
                              <ShieldCheck size={10} /> Live Registry
                           </span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Platform <span className="text-indigo-600">Records</span></h1>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 italic">Total Synchronized Members: {users.length}</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-600 transition-colors" size={18} />
                            <input 
                                type="text"
                                placeholder="Search by name or email..."
                                className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl w-full md:w-80 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all shadow-xl shadow-slate-200/40"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            className="px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-black uppercase tracking-widest focus:outline-none shadow-xl shadow-slate-200/40 cursor-pointer text-slate-700"
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="user">Standard</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredUsers.length > 0 ? filteredUsers.map((user, idx) => (
                        <motion.div 
                            key={user._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden group hover:scale-[1.02] transition-all duration-500 relative"
                        >
                            {/* Role Badge */}
                            <div className="absolute top-6 right-6">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm
                                    ${user.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    {user.role === 'admin' ? <Shield size={10} /> : <Users size={10} />}
                                    {user.role}
                                </span>
                            </div>

                            <div className="p-8 pb-4">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="relative">
                                        <div className="h-20 w-20 bg-white rounded-[1.5rem] flex items-center justify-center text-slate-200 text-2xl font-black uppercase ring-8 ring-slate-50 group-hover:rotate-12 transition-transform duration-500 shadow-2xl overflow-hidden">
                                            {user.profilePhoto ? (
                                                <img 
                                                    src={user.profilePhoto} 
                                                    className="w-full h-full object-cover hd-profile" 
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            ) : user.name[0]}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-emerald-500 rounded-xl border-4 border-white flex items-center justify-center z-20">
                                            <div className="h-2 w-2 bg-white rounded-full animate-ping"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-1">{user.name}</h3>
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-mono italic truncate max-w-[150px]">#{user._id.toString().slice(-12).toUpperCase()}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                            <Mail size={16} />
                                        </div>
                                        <p className="text-xs font-bold truncate tracking-tight">{user.email}</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                            <Phone size={16} />
                                        </div>
                                        <p className="text-xs font-bold tracking-tight">{user.phone || 'N/A'}</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                            <Calendar size={16} />
                                        </div>
                                        <p className="text-xs font-bold tracking-tight">Accession: {new Date(user.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 pb-8 pt-4 border-t border-slate-50 flex items-center gap-3">
                                <button 
                                  onClick={() => setSelectedUser(user)}
                                  className="flex-1 bg-slate-900 text-white h-12 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 overflow-hidden group/btn"
                                >
                                    <span className="group-hover/btn:-translate-y-10 group-hover/btn:opacity-0 transition-all duration-300">View Profile</span>
                                    <span className="absolute translate-y-10 opacity-0 group-hover/btn:translate-y-0 group-hover/btn:opacity-100 transition-all duration-300 flex items-center gap-2">
                                        Full Details <ArrowUpRight size={12} />
                                    </span>
                                </button>
                                <button className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                                    <HardDrive size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="col-span-full py-20 bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
                            <div className="h-20 w-20 bg-slate-100 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Search size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase italic">No Matches Found</h3>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] italic">Search registry again or adjust frequency</p>
                        </div>
                    )}
                </div>
            </main>

            <AnimatePresence>
                {selectedUser && (
                    <UserDetailModal 
                      user={selectedUser} 
                      onClose={() => setSelectedUser(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserManagement;
