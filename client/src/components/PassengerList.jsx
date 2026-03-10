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

             <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                {/* Person Profile */}
                <div className="flex items-center gap-6">
                   <div className="relative">
                      {p.passenger.profilePhoto ? (
                        <img src={p.passenger.profilePhoto} className="h-20 w-20 rounded-3xl object-cover shadow-2xl border-4 border-slate-50" />
                      ) : (
                        <div className="h-20 w-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-black italic border-4 border-slate-50 uppercase">
                          {p.passenger.name[0]}
                        </div>
                      )}
                      <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center border-4 border-white shadow-lg">
                        <CheckCircle2 size={12} />
                      </div>
                   </div>
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-xl font-black text-slate-900 tracking-tighter italic">{p.passenger.name}</h4>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${p.passenger.gender === 'female' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                           {p.passenger.gender}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="flex items-center gap-1.5 text-amber-500">
                            <Star size={12} fill="currentColor" />
                            <span className="text-xs font-black">{p.passenger.averageRating || 5.0}</span>
                         </div>
                         <div className="flex items-center gap-1.5 text-slate-400">
                            <ShieldCheck size={12} className="text-indigo-500" />
                            <span className="text-xs font-bold uppercase tracking-widest">ID Verified</span>
                         </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-slate-500">
                         <Phone size={14} className="text-indigo-600" />
                         <span className="text-sm font-black">+91 {p.passenger.phone}</span>
                      </div>
                   </div>
                </div>

                {/* Journey Segment Details */}
                <div className="space-y-4 md:text-right flex flex-col md:items-end">
                   <div className="flex flex-col md:items-end gap-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Journey Segment</p>
                      <div className="flex items-center gap-2 text-slate-700">
                         <MapPin size={12} className="text-indigo-600" />
                         <span className="text-xs font-black">{p.boardingPoint.address || 'Pickup Point'}</span>
                         <span className="text-slate-300 text-[10px] font-black italic">→</span>
                         <span className="text-xs font-black">{p.dropoffPoint.address || 'Dropoff Point'}</span>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-8 md:justify-end">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fare Charged</p>
                         <p className="text-xl font-black italic text-indigo-600">₹{p.fareCharged}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment</p>
                         <div className="flex items-center gap-2 justify-end">
                            {p.paymentMethod === 'online' ? (
                              <><CreditCard size={14} className="text-emerald-500" /><span className="text-xs font-black uppercase text-emerald-600 tracking-tighter">ONLINE</span></>
                            ) : (
                              <><Banknote size={14} className="text-amber-500" /><span className="text-xs font-black uppercase text-amber-600 tracking-tighter">CASH</span></>
                            )}
                         </div>
                      </div>
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
