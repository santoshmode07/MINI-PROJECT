import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const LoadingSpinner = () => {
    return (
        <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-10">
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                   className="h-32 w-32 rounded-[2.5rem] border-4 border-slate-50 border-t-indigo-600 shadow-2xl shadow-indigo-100"
                />
                <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                    <Zap size={32} className="animate-pulse" />
                </div>
            </div>
            
            <motion.h2 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic mb-2"
            >
                RIDE <span className="text-indigo-600">DOSTHI</span>
            </motion.h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">
                Synchronizing Justice Node...
            </p>
            
            <div className="mt-12 w-48 h-1 bg-slate-50 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full h-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                />
            </div>
        </div>
    );
};

export default LoadingSpinner;
