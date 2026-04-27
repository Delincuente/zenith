import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  Users,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Projects', icon: Briefcase, path: '/projects' },
  { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { name: 'Clients', icon: Users, path: '/clients' },
];

const BottomNav = () => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Safe Area Background */}
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800" />

      <div className="relative flex justify-around items-center h-14 pb-[var(--sab)] px-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              relative flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-colors duration-200
              ${isActive ? 'text-blue-400' : 'text-slate-500'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon size={20} className={isActive ? 'fill-blue-400/10' : ''} />
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavGlow"
                      className="absolute inset-0 bg-blue-400/10 blur-md rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1.2 }}
                    />
                  )}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-tighter transition-all">{item.name}</span>

                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 w-8 h-1 bg-blue-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
