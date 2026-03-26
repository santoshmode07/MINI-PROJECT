import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, User, Phone, MapPin, CreditCard, Banknote, ShieldCheck, Star } from 'lucide-react';

const PassengerList = ({ passengers, totalSeats, remainingSeats }) => {
  if (!passengers || passengers.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
         <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6 shadow-sm border border-slate-100">
            <User size={32} />
         </div>
         <h3 className="text-xl font-black text-slate-800 tracking-tighter italic">No Co-Riders Yet</h3>
         <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Waiting for first booking...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirmed Riders</p>
           <p className="text-3xl font-black italic text-indigo-600 tracking-tighter">{passengers.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Remaining Seats</p>
           <p className="text-3xl font-black italic text-slate-800 tracking-tighter">{remainingSeats}</p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-2">Verified Co-Riders List</h4>
        {passengers.map((p, i) => (
          <motion.div
            key={p._id || i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-indigo-100/50 hover:scale-[1.01] transition-all relative overflow-hidden group"
          >
             {/* Gradient Accent */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -translate-y-16 translate-x-16 group-hover:bg-indigo-50 transition-colors duration-700"></div>

             <div className="flex flex-col gap-6 relative z-10">
                {/* Person Profile Area */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-50 pb-6">
                   <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                         {p.passenger.profilePhoto ? (
                           <div className="h-16 w-16 rounded-2xl bg-white shadow-xl border-2 border-white overflow-hidden ring-4 ring-slate-50 transition-transform duration-500 hover:scale-110">
                              <img 
                                src={p.passenger.profilePhoto} 
                                className="h-full w-full object-cover hd-profile" 
                                loading="lazy"
                                decoding="async"
                              />
                           </div>
                         ) : (
                           <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black italic border-2 border-white uppercase shadow-lg">
                             {p.passenger.name[0]}
                           </div>
                         )}
                         <div className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-lg z-20">
                           <CheckCircle2 size={10} />
                         </div>
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                         <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-lg font-black text-slate-900 tracking-tighter italic leading-none">{p.passenger.name}</h4>
                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border leading-none ${p.passenger.gender === 'female' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                               {p.passenger.gender}
                            </span>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">
                               <Star size={10} fill="currentColor" />
                               <span className="text-[10px] font-black">{p.passenger.averageRating || 5.0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100">
                               <ShieldCheck size={10} />
                               <span className="text-[9px] font-black uppercase tracking-widest leading-none">Verified</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-1.5 text-slate-500 pt-1">
                            <Phone size={12} className="text-indigo-400" />
                            <span className="text-xs font-bold tracking-tight">+91 {p.passenger.phone}</span>
                         </div>
                      </div>
                   </div>

                   {/* Fare & Payment Tip */}
                   <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 flex items-center justify-between sm:flex-col sm:items-end sm:justify-start gap-1 shrink-0">
                      <div>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-center sm:text-right">Earnings</p>
                         <p className="text-xl font-black italic text-indigo-600 leading-none">₹{p.fareCharged}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                         {p.paymentMethod === 'online' ? (
                           <><CreditCard size={12} className="text-emerald-500" /><span className="text-[9px] font-black uppercase text-emerald-600">ONLINE</span></>
                         ) : (
                           <><Banknote size={12} className="text-amber-500" /><span className="text-[9px] font-black uppercase text-amber-600">CASH</span></>
                         )}
                      </div>
                   </div>
                </div>

                {/* Tracking / Journey Segment Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-3xl border border-slate-100/50 shadow-inner">
                   <div className="space-y-2">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-indigo-600"></div> Boarding Point
                       </p>
                       <p className="text-[11px] font-bold text-slate-700 leading-tight italic pl-2.5 border-l border-indigo-200">{p.boardingPoint.address || 'Pickup Point'}</p>
                   </div>
                   <div className="space-y-2">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-rose-500"></div> Drop-off Point
                       </p>
                       <p className="text-[11px] font-bold text-slate-700 leading-tight italic pl-2.5 border-l border-rose-200">{p.dropoffPoint.address || 'Dropoff Point'}</p>
                   </div>
                </div>
             </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PassengerList;
