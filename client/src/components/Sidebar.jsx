import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  Users,
  LogOut,
  Zap,
  Settings,
  X
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Sidebar = ({ onClose }) => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Projects', icon: Briefcase, path: '/projects' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Clients', icon: Users, path: '/clients' },
    { name: 'Profile', icon: Settings, path: '/profile' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full border-r border-slate-800">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Zap size={18} className="text-white fill-current" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">
          Zenith
        </h1>
        <button
          onClick={onClose}
          className="lg:hidden ml-auto p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className={({ isActive }) => `
              flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200
              ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
            `}
          >
            <item.icon size={18} />
            <span className="text-sm font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center space-x-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 truncate">
            <p className="text-xs font-semibold truncate text-slate-200">{user?.name}</p>
            <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider font-bold">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors group"
        >
          <LogOut size={18} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
