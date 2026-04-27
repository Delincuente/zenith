import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  CheckSquare, 
  DollarSign, 
  Activity,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-4 md:p-6 rounded-2xl md:rounded-3xl hover:border-slate-700 transition-all group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
    
    <div className="flex justify-between items-start mb-3 md:mb-5 relative z-10">
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg ${color} bg-opacity-10`}>
        <Icon size={20} className={`${color.replace('bg-', 'text-')} md:w-6 md:h-6`} />
      </div>
      {trend && (
        <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
          {trend}
        </span>
      )}
    </div>
    
    <div className="relative z-10">
      <h3 className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 md:mb-1.5">{title}</h3>
      <p className="text-2xl md:text-3xl font-black text-white tracking-tighter">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeProjects: 12,
    pendingTasks: 45,
    revenue: '$12,450',
    completionRate: '87%'
  });

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2 tracking-tighter">Workspace Overview</h2>
          <p className="text-slate-400 text-xs md:text-base font-medium">Here's what's happening in your projects today.</p>
        </div>
        
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl backdrop-blur-sm self-start md:self-auto shadow-xl shadow-black/20">
          <div className="p-1.5 md:p-2 bg-blue-600/10 text-blue-400 rounded-lg md:rounded-xl">
            <ShieldCheck size={18} className="md:w-5 md:h-5" />
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] text-slate-500 uppercase font-black tracking-widest">Plan</p>
            <p className="text-xs md:text-sm font-black text-white uppercase">{user?.plan || 'Free'}</p>
          </div>
          <a href="/billing" className="ml-3 p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
            <ChevronRight size={14} className="md:w-4 md:h-4" />
          </a>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard 
          title="Active Projects" 
          value={stats.activeProjects} 
          icon={Briefcase} 
          color="bg-blue-500"
          trend="+2 this month"
        />
        <StatCard 
          title="Pending Tasks" 
          value={stats.pendingTasks} 
          icon={CheckSquare} 
          color="bg-amber-500"
          trend="-5 from yesterday"
        />
        <StatCard 
          title="Total Revenue" 
          value={stats.revenue} 
          icon={DollarSign} 
          color="bg-emerald-500"
          trend="+18.2%"
        />
        <StatCard 
          title="Avg. Completion" 
          value={stats.completionRate} 
          icon={Activity} 
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-white">Recent Projects</h2>
            <button className="text-blue-400 hover:text-blue-300 text-xs md:text-sm font-medium flex items-center transition-colors">
              View all <ChevronRight size={14} className="ml-1 md:w-4 md:h-4" />
            </button>
          </div>
          
          <div className="space-y-3 md:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 md:p-4 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group border border-transparent hover:border-slate-700">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600/10 group-hover:text-blue-400 transition-colors">
                    <Briefcase size={18} className="md:w-5 md:h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm md:text-base text-white font-medium">Modern SaaS Platform</h4>
                    <p className="text-[10px] md:text-sm text-slate-400">Client: Acme Corp • 8 tasks remaining</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="text-right hidden sm:block">
                    <div className="w-24 md:w-32 h-1.5 md:h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-[9px] md:text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">65% Complete</p>
                  </div>
                  <ExternalLink size={16} className="text-slate-600 group-hover:text-slate-300 transition-colors md:w-[18px] md:h-[18px]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">Activity Log</h2>
          <div className="space-y-4 md:space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex space-x-3 md:space-x-4">
                <div className="relative">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full mt-1.5 md:mt-2 relative z-10 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  {i !== 5 && <div className="absolute top-4 left-[2.5px] md:left-[3px] bottom-[-18px] md:bottom-[-24px] w-[1px] md:w-[2px] bg-slate-800"></div>}
                </div>
                <div>
                  <p className="text-xs md:text-sm text-slate-200 leading-snug md:leading-normal">
                    <span className="font-bold">You</span> created a new task <span className="text-blue-400">"Setup Stripe Webhooks"</span>
                  </p>
                  <p className="text-[10px] md:text-xs text-slate-500 mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
