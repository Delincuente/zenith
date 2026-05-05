import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const StatusDropdown = ({ value, onChange, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (onOpenChange) onOpenChange(isOpen);
  }, [isOpen]);

  const statuses = [
    { value: 'todo', label: 'TO DO', color: 'text-slate-400 bg-slate-400/10', dot: 'bg-slate-500' },
    { value: 'in_progress', label: 'IN PROGRESS', color: 'text-blue-500 bg-blue-500/10', dot: 'bg-blue-500' },
    { value: 'review', label: 'REVIEW', color: 'text-purple-500 bg-purple-500/10', dot: 'bg-purple-500' },
    { value: 'done', label: 'DONE', color: 'text-emerald-500 bg-emerald-500/10', dot: 'bg-emerald-500' },
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
        className={`flex items-center space-x-2 text-[10px] font-bold py-1.5 px-2.5 rounded-lg transition-all duration-200 border border-transparent ${activeStatus.color} ${isOpen ? 'ring-2 ring-blue-500/20 border-slate-700' : 'hover:opacity-80'}`}
      >
        <span className="uppercase tracking-wider">{activeStatus.label}</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 z-50 mt-1 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1.5 backdrop-blur-xl"
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
                    ? `${status.color} brightness-125` 
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

export default StatusDropdown;
