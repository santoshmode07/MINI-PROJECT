import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, MessageSquare, ShieldCheck, Loader2, Send } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const ReviewModal = ({ isOpen, onClose, rideId, subject, onReviewSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please share a brief comment about your experience');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/reviews/${rideId}/${subject._id}`, { rating, comment });
      toast.success('Your feedback has been logged. Thank you!');
      if (onReviewSuccess) onReviewSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (!subject || !rideId) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white overflow-hidden relative"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">Elite Feedback</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Rating your experience with {subject.name}</p>
              </div>
              <button 
                onClick={onClose}
                className="h-12 w-12 rounded-2xl bg-white hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all flex items-center justify-center shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Star Rating Section */}
              <div className="flex flex-col items-center gap-4">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Select Star Protocol</p>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      className="transition-all transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        size={36}
                        className={`transition-colors ${
                          star <= (hover || rating) 
                            ? 'text-amber-500 fill-amber-500' 
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                   <p className="text-xs font-black text-amber-600 uppercase tracking-tighter animate-pulse">
                      {rating === 5 ? 'EXCEPTIONAL SERVICE' : rating >= 4 ? 'VERY GOOD' : rating >= 3 ? 'DECENT RIDE' : 'IMPROVEMENT NEEDED'}
                   </p>
                )}
              </div>

              {/* Comment Box */}
              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 block flex items-center gap-2">
                   <MessageSquare size={14} className="text-indigo-600" /> Share Experience Details
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about the safety, punctuality, and overall journey experience..."
                  className="w-full h-32 p-6 rounded-3xl bg-slate-50 border border-slate-100 focus:border-indigo-600 focus:bg-white transition-all text-sm font-medium outline-none resize-none placeholder:text-slate-300 shadow-inner"
                />
              </div>

              {/* Safety Shield Info */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <p className="text-[10px] font-bold text-emerald-700 leading-relaxed uppercase tracking-tight italic">
                   Verified feedback maintained under RaidDosthi Safety Protocol. Your review helps keep the community travel secure.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 hover:bg-indigo-600 text-white h-16 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50 disabled:pointer-events-none group"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    SUBMIT VERIFIED FEEDBACK
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;
