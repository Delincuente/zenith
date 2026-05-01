import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone. Please confirm to proceed.", 
  confirmText = "Delete", 
  cancelText = "Cancel",
  type = "danger" // danger or warning
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="relative bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
          >
            {/* Background Glow */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 ${type === 'danger' ? 'bg-red-500/10' : 'bg-amber-500/10'} blur-[80px] rounded-full pointer-events-none`} />
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className={`w-16 h-16 ${type === 'danger' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'} rounded-2xl flex items-center justify-center mb-6 border`}>
                <AlertTriangle size={32} />
              </div>
              
              <h3 className="text-xl font-black text-white tracking-tight mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 px-2">
                {message}
              </p>
              
              <div className="flex flex-col w-full space-y-3">
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`w-full py-3.5 ${type === 'danger' ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' : 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20'} text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 text-[10px] md:text-xs`}
                >
                  {confirmText}
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 text-slate-400 hover:text-white font-bold transition-all text-xs"
                >
                  {cancelText}
                </button>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors bg-slate-800/50 rounded-xl"
            >
              <X size={18} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
