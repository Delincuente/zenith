import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import useAuthStore from '../store/useAuthStore';
import { Zap, User as UserIcon } from 'lucide-react';

const Layout = () => {
  const { user, isLoading } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }


  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden">
      {/* Mobile Top Header (Native Feel) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between px-5 pt-[var(--sat)]">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap size={16} className="text-white fill-current" />
          </div>
          <span className="font-black text-lg tracking-tighter text-white">Zenith</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden active:scale-90 transition-transform"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <UserIcon size={20} className="text-slate-400" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar (Acts as "More" menu) */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full lg:overflow-auto pt-20 lg:pt-8 pb-16 lg:pb-8 p-3 md:p-8">
        <Outlet />
      </main>

      {/* Native Bottom Navigation */}
      <BottomNav />
    </div>
  );
};


export default Layout;
