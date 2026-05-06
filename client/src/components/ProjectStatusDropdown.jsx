import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const ProjectStatusDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const statuses = [
    { value: 'active', label: 'ACTIVE', color: 'text-blue-500 bg-blue-500/10 border-blue-500/50', dot: 'bg-blue-500' },
    { value: 'completed', label: 'COMPLETED', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/50', dot: 'bg-emerald-500' },
    { value: 'on_hold', label: 'ON HOLD', color: 'text-orange-500 bg-orange-500/10 border-orange-500/50', dot: 'bg-orange-500' },
    { value: 'cancelled', label: 'CANCELLED', color: 'text-red-500 bg-red-500/10 border-red-500/50', dot: 'bg-red-500' },
  ];

  const activeStatus = statuses.find(s => s.value === value) || statuses[0];

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
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 text-[10px] font-bold py-1 px-3 rounded-full transition-all duration-200 border ${activeStatus.color} ${isOpen ? 'ring-2 ring-blue-500/20' : 'hover:brightness-125'}`}
      >
        <span className="uppercase tracking-widest">{activeStatus.label}</span>
        <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 z-50 mt-1 w-44 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden py-1.5 backdrop-blur-xl"
          >
            {statuses.map((status) => {
              const isActive = value === status.value;
              return (
                <button
                  key={status.value}
                  onClick={() => {
                    onChange(status.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-[11px] font-bold flex items-center justify-between transition-colors ${
                    isActive 
                    ? `bg-blue-600/10 text-blue-400` 
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                     <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                     <span className="uppercase tracking-widest">{status.label}</span>
                  </div>
                  {isActive && <Check size={12} className="shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectStatusDropdown;
