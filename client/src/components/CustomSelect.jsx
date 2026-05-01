import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

/**
 * A premium, theme-matched custom select component.
 */
const CustomSelect = ({ 
  label, 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select...", 
  error, 
  icon: Icon,
  className = "",
  id 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">
          {label}
        </label>
      )}
      
      <div 
        id={id}
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative group cursor-pointer flex items-center bg-slate-800/40 border transition-all duration-300 outline-none ${
          error 
            ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.2)]' 
            : 'border-slate-700/50 hover:border-slate-600'
        } rounded-2xl text-white py-4 ${Icon ? 'pl-12' : 'pl-5'} pr-10 ${
          isOpen ? 'ring-4 ring-blue-500/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'
        }`}
      >
        {Icon && (
          <span className={`absolute inset-y-0 left-0 pl-4 flex items-center transition-colors duration-300 ${
            isOpen ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-400'
          }`}>
            <Icon size={20} />
          </span>
        )}
        
        <span className={`block truncate text-sm font-medium transition-colors ${
          !selectedOption ? 'text-slate-600' : 'text-white'
        }`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <motion.div 
            animate={{ rotate: isOpen ? 180 : 0, color: isOpen ? '#3b82f6' : '#64748b' }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <ChevronDown size={18} />
          </motion.div>
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-[100] mt-1 w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden py-1.5 backdrop-blur-xl"
          >
            <div className="max-h-60 overflow-y-auto no-scrollbar">
              {options.length === 0 ? (
                <div className="px-4 py-4 text-slate-500 text-xs font-bold uppercase tracking-widest text-center">
                  No options available
                </div>
              ) : (
                options.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`px-4 py-2.5 text-sm font-medium flex items-center justify-between cursor-pointer transition-all ${
                      value === option.value 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <span>{option.label}</span>
                    {value === option.value && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check size={16} strokeWidth={3} />
                      </motion.div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {error && (
        <motion.p 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mt-2 text-xs text-red-500 ml-1 font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default CustomSelect;
