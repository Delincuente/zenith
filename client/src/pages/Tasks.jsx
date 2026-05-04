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
  ChevronRight,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';
import { formatDate } from '../utils/dateFormatter';
import CreateTaskModal from '../components/CreateTaskModal';
import StatusDropdown from '../components/StatusDropdown';
import ConfirmModal from '../components/ConfirmModal';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  const statusColors = {
    todo: 'bg-slate-500/10 text-slate-400',
    in_progress: 'bg-blue-500/10 text-blue-500',
    review: 'bg-purple-500/10 text-purple-500',
    done: 'bg-emerald-500/10 text-emerald-500',
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

  const handleDeleteTask = async () => {
    if (!deletingTaskId) return;
    try {
      await axiosInstance.delete(`/tasks/${deletingTaskId}`);
      toast.success('Task deleted successfully');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete task');
    } finally {
      setDeletingTaskId(null);
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const openDeleteConfirm = (taskId) => {
    setDeletingTaskId(taskId);
    setActiveMenu(null);
  };

  const toggleExpand = (taskId) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  return (
    <div className="space-y-4 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500" onClick={() => setActiveMenu(null)}>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2 tracking-tight">Tasks Explorer</h2>
          <p className="text-slate-400 text-xs md:text-base">Track and manage your work across projects.</p>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 active:scale-95 w-full md:w-auto text-xs md:text-sm"
        >
          <Plus size={18} className="md:w-5 md:h-5" />
          <span>New Task</span>
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 md:py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white text-xs md:text-sm"
          />
        </div>
        
        <div className="flex p-0.5 md:p-1 bg-slate-900 border border-slate-800 rounded-xl md:rounded-2xl overflow-x-auto no-scrollbar scroll-smooth" onClick={(e) => e.stopPropagation()}>
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
            <p className="text-slate-400 mt-2 text-xs md:text-sm px-4">Try adjusting your filters or create a new task.</p>
            <button 
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              className="mt-4 text-blue-400 hover:text-blue-300 font-medium"
            >
              Create first task
            </button>
          </div>
        ) : (
          tasks.map((task) => {
            const StatusIcon = statusIcons[task.status];
            const isExpanded = expandedTaskId === task.id;
            const isMenuOpen = activeMenu === task.id;
            
            return (
              <div 
                key={task.id} 
                className={`bg-slate-900 border border-slate-800 rounded-xl md:rounded-2xl hover:border-slate-700 transition-all group ${isExpanded ? 'ring-1 ring-blue-500/30' : ''} ${isMenuOpen ? 'z-30 relative' : 'z-0'}`}
              >
                <div 
                  className="p-3 md:p-5 flex items-center justify-between gap-2 md:gap-4 cursor-pointer"
                  onClick={() => toggleExpand(task.id)}
                >
                  <div className="flex items-center space-x-2 md:space-x-4 min-w-0">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(task.id, task.status === 'done' ? 'todo' : 'done');
                      }}
                      className={`min-w-8 md:min-w-10 h-8 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-all shrink-0 ${statusColors[task.status]}`}
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
                    <div className="hidden sm:block" onClick={(e) => e.stopPropagation()}>
                      <StatusDropdown 
                        value={task.status} 
                        onChange={(newStatus) => handleStatusUpdate(task.id, newStatus)} 
                      />
                    </div>
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === task.id ? null : task.id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${activeMenu === task.id ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-white hover:bg-slate-800/50'}`}
                      >
                        <MoreVertical size={16} className="md:w-[18px] md:h-[18px]" />
                      </button>

                      {activeMenu === task.id && (
                        <div className="absolute right-0 mt-2 w-36 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-[100] backdrop-blur-xl">
                          <button 
                            onClick={() => openEditModal(task)}
                            className="w-full px-4 py-2 text-[11px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 flex items-center space-x-2 transition-colors"
                          >
                            <Edit2 size={14} />
                            <span>EDIT TASK</span>
                          </button>
                          <button 
                            onClick={() => openDeleteConfirm(task.id)}
                            className="w-full px-4 py-2 text-[11px] font-bold text-red-500/70 hover:text-red-500 hover:bg-red-500/10 flex items-center space-x-2 transition-colors border-t border-slate-800/50"
                          >
                            <Trash2 size={14} />
                            <span>DELETE</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <ChevronRight size={16} className={`text-slate-700 transition-transform duration-300 hidden md:block ${isExpanded ? 'rotate-90 text-blue-500' : ''}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-3 md:px-5 pb-4 md:pb-6 pt-0 border-t border-slate-800/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="mt-4 bg-slate-950/30 p-3 md:p-4 rounded-xl border border-slate-800/50">
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Description</h5>
                      <p className="text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {task.description || 'No description provided for this task.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <CreateTaskModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onTaskCreated={fetchTasks}
        task={editingTask}
      />

      <ConfirmModal 
        isOpen={!!deletingTaskId}
        onClose={() => setDeletingTaskId(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Tasks;
