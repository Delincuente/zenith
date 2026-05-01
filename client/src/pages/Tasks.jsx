import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { 
  CheckSquare, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Circle,
  AlertCircle,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { formatDate } from '../utils/dateFormatter';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const statusColors = {
    todo: 'text-slate-500 bg-slate-500/10',
    in_progress: 'text-blue-500 bg-blue-500/10',
    review: 'text-purple-500 bg-purple-500/10',
    done: 'text-emerald-500 bg-emerald-500/10',
  };

  const statusIcons = {
    todo: Circle,
    in_progress: Clock,
    review: AlertCircle,
    done: CheckCircle2,
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, search]);

  const fetchTasks = async () => {
    try {
      const { data } = await axiosInstance.get('/tasks', {
        params: { status: statusFilter, search }
      });
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await axiosInstance.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  return (
    <div className="space-y-4 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2 tracking-tight">Tasks Explorer</h2>
        <p className="text-slate-400 text-xs md:text-base">Track and manage your work across projects.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 md:py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white text-xs md:text-sm"
          />
        </div>
        
        <div className="flex p-0.5 md:p-1 bg-slate-900 border border-slate-800 rounded-xl md:rounded-2xl overflow-x-auto no-scrollbar scroll-smooth">
          {['', 'todo', 'in_progress', 'review', 'done'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-sm font-semibold whitespace-nowrap transition-all ${
                statusFilter === status 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {status === '' ? 'All' : status.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:gap-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-20 md:h-24 bg-slate-900/50 animate-pulse rounded-xl md:rounded-2xl border border-slate-800"></div>
          ))
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 md:py-20 bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl md:rounded-3xl">
            <CheckSquare size={32} className="mx-auto text-slate-700 mb-3 md:mb-4 md:w-10 md:h-10" />
            <h3 className="text-base md:text-lg font-semibold text-white">No tasks found</h3>
            <p className="text-slate-400 mt-2 text-xs md:text-sm px-4">Try adjusting your filters.</p>
          </div>
        ) : (
          tasks.map((task) => {
            const StatusIcon = statusIcons[task.status];
            return (
              <div key={task.id} className="bg-slate-900 border border-slate-800 p-3 md:p-5 rounded-xl md:rounded-2xl hover:border-slate-700 transition-all group flex items-center justify-between gap-2 md:gap-4">
                <div className="flex items-center space-x-2 md:space-x-4 min-w-0">
                  <button 
                    onClick={() => handleStatusUpdate(task.id, task.status === 'done' ? 'todo' : 'done')}
                    className={`min-w-8 md:min-w-10 h-8 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-all shrink-0 ${
                      task.status === 'done' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500 hover:text-blue-400'
                    }`}
                  >
                    <StatusIcon size={18} className="md:w-5 md:h-5" />
                  </button>
                  <div className="min-w-0">
                    <h4 className={`text-xs md:text-base font-bold text-white transition-all truncate ${task.status === 'done' ? 'line-through text-slate-500 opacity-50' : ''}`}>
                      {task.title}
                    </h4>
                    <p className="text-[9px] md:text-xs text-slate-500 mt-0.5 md:mt-1 flex items-center space-x-1.5 truncate">
                       <span className="font-semibold text-blue-500 uppercase shrink-0">{task.Project?.title}</span>
                       <span className="shrink-0">•</span>
                       <span className="truncate">{formatDate(task.createdAt)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 md:space-x-4 shrink-0">
                  <div className="hidden sm:block">
                    <select 
                      value={task.status}
                      onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                      className={`text-[10px] font-bold py-1.5 px-2.5 rounded-lg border-none focus:ring-0 cursor-pointer ${statusColors[task.status]}`}
                    >
                      <option value="todo">TO DO</option>
                      <option value="in_progress">IN PROGRESS</option>
                      <option value="review">REVIEW</option>
                      <option value="done">DONE</option>
                    </select>
                  </div>
                  <button className="p-1.5 text-slate-600 hover:text-white transition-colors">
                    <MoreVertical size={16} className="md:w-[18px] md:h-[18px]" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default Tasks;
