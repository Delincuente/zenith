import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { projectService } from '../api';
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar, 
  User, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Circle,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  MoreVertical,
  Layers,
  ArrowRight,
  CheckSquare
} from 'lucide-react';
import { formatDate } from '../utils/dateFormatter';
import toast from 'react-hot-toast';
import CreateTaskModal from '../components/CreateTaskModal';
import CreateProjectModal from '../components/CreateProjectModal';
import ConfirmModal from '../components/ConfirmModal';
import StatusDropdown from '../components/StatusDropdown';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeStatusId, setActiveStatusId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

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
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const response = await axiosInstance.get(`/projects/${id}`);
      setProject(response.data);
    } catch (err) {
      toast.error('Failed to load project details');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await axiosInstance.put(`/tasks/${taskId}`, { status: newStatus });
      fetchProjectDetails();
    } catch (err) {
      // Global interceptor handles the toast
    }
  };
  
  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
    setActiveMenu(null);
  };

  const toggleExpand = (taskId) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
    setActiveMenu(null);
    setActiveStatusId(null);
  };

  const openDeleteConfirm = (taskId) => {
    setDeletingTaskId(taskId);
    setActiveMenu(null);
  };

  const handleDeleteTask = async () => {
    if (!deletingTaskId) return;
    try {
      await axiosInstance.delete(`/tasks/${deletingTaskId}`);
      toast.success('Task deleted successfully');
      fetchProjectDetails();
    } catch (err) {
      // Global interceptor handles the toast
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await axiosInstance.delete(`/projects/${id}`);
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (err) {
      // Global interceptor handles the toast
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!project) return null;

  const tasks = project.tasks || [];
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  const filteredTasks = statusFilter === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === statusFilter);

  const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500" onClick={() => {
      setActiveMenu(null);
      setActiveStatusId(null);
    }}>
      {/* Navigation & Header */}
      <div className="flex flex-col space-y-4">
        <button 
          onClick={() => navigate('/projects')}
          className="flex items-center space-x-2 text-slate-500 hover:text-white transition-colors w-fit group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold uppercase tracking-widest text-xs">Back to Projects</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
               <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                 project.status === 'active' ? 'bg-blue-500/10 border-blue-500/50 text-blue-500' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
               }`}>
                 {project.status}
               </div>
               <span className="text-slate-600 text-xs font-bold uppercase tracking-widest">Project ID: #{project.id.slice(0, 8)}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{project.title}</h1>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsProjectModalOpen(true)}
              className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-700 transition-all active:scale-95"
            >
              <Edit2 size={18} />
            </button>
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-500/50 transition-all active:scale-95"
            >
              <Trash2 size={18} />
            </button>
            <button 
              onClick={() => {
                setEditingTask({ project_id: id });
                setIsTaskModalOpen(true);
              }}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 active:scale-95"
            >
              <Plus size={18} />
              <span className="hidden md:inline">Add Task</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column: Stats & Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Progress Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all"></div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Project Progress</h3>
            <div className="flex items-end justify-between mb-4">
              <span className="text-5xl font-black text-white">{progress}%</span>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{stats.done}/{stats.total} Tasks Done</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"
              />
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Project Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client</p>
                  <p className="text-white font-bold">{project.client?.company_name || 'Individual'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deadline</p>
                  <p className="text-white font-bold">{project.deadline ? formatDate(project.deadline) : 'No Deadline'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Layers size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Tasks</p>
                  <p className="text-white font-bold">{stats.total} Tasks Linked</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
               <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Description</h4>
               <p className="text-slate-400 text-sm leading-relaxed">
                 {project.description || 'No detailed description provided for this project.'}
               </p>
            </div>
          </div>
        </div>

        {/* Right Column: Tasks List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Project Tasks</h2>
            <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth gap-1">
               <button
                 onClick={(e) => { e.stopPropagation(); setStatusFilter('all'); }}
                 className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center space-x-2 ${
                   statusFilter === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                 }`}
               >
                 <span>All</span>
                 <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${statusFilter === 'all' ? 'bg-white/20' : 'bg-slate-800'}`}>{stats.total}</span>
               </button>
               {[
                 { id: 'todo', label: 'To Do', count: stats.todo, color: 'text-slate-400' },
                 { id: 'in_progress', label: 'Active', count: stats.inProgress, color: 'text-blue-500' },
                 { id: 'review', label: 'Review', count: stats.review, color: 'text-purple-500' },
                 { id: 'done', label: 'Done', count: stats.done, color: 'text-emerald-500' }
               ].map(s => (
                 <button
                   key={s.id}
                   onClick={(e) => { e.stopPropagation(); setStatusFilter(s.id); }}
                   className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center space-x-2 ${
                     statusFilter === s.id 
                       ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                       : `${s.color} hover:bg-slate-800/50`
                   }`}
                 >
                   <span>{s.label}</span>
                   <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${statusFilter === s.id ? 'bg-white/20' : 'bg-slate-800'}`}>{s.count}</span>
                 </button>
               ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                  <CheckSquare size={32} />
                </div>
                <h3 className="text-lg font-bold text-white">No tasks found</h3>
                <p className="text-slate-500 text-sm mt-1 mb-6">
                  {statusFilter === 'all' 
                    ? 'Get started by breaking down your project into tasks.' 
                    : `No tasks matching the "${statusFilter.replace('_', ' ')}" filter.`}
                </p>
                <button 
                  onClick={() => {
                    setEditingTask({ project_id: id });
                    setIsTaskModalOpen(true);
                  }}
                  className="text-blue-500 font-bold uppercase tracking-widest text-xs hover:text-blue-400 transition-colors inline-flex items-center space-x-2"
                >
                  <span>Create first task</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const StatusIcon = statusIcons[task.status] || Circle;
                const isExpanded = expandedTaskId === task.id;
                const isMenuOpen = activeMenu === task.id;
                const isStatusOpen = activeStatusId === task.id;
                const isAnyMenuOpen = isMenuOpen || isStatusOpen;

                return (
                  <div 
                    key={task.id}
                    className={`bg-slate-900 border border-slate-800 rounded-2xl flex flex-col group transition-all hover:border-slate-700 ${isExpanded ? 'ring-1 ring-blue-500/30' : ''} ${isAnyMenuOpen ? 'z-50 relative' : 'z-0 relative'}`}
                  >
                    <div 
                      className="p-4 md:p-5 flex items-center justify-between gap-4 cursor-pointer"
                      onClick={() => toggleExpand(task.id)}
                    >
                      <div className="flex items-center space-x-4 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${statusColors[task.status]}`}>
                          <StatusIcon size={20} />
                        </div>
                        <div className="min-w-0">
                          <h4 className={`text-sm md:text-base font-bold text-white truncate ${task.status === 'done' ? 'line-through text-slate-600 opacity-50' : ''}`}>
                            {task.title}
                          </h4>
                          <p className="text-[10px] md:text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">
                            {formatDate(task.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="hidden sm:block" onClick={(e) => e.stopPropagation()}>
                          <StatusDropdown 
                            value={task.status}
                            onChange={(newStatus) => handleStatusUpdate(task.id, newStatus)}
                            onOpenChange={(isOpen) => {
                              if (isOpen) setActiveMenu(null);
                              setActiveStatusId(isOpen ? task.id : null);
                            }}
                          />
                        </div>
                        
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activeMenu !== task.id) setActiveStatusId(null);
                              setActiveMenu(activeMenu === task.id ? null : task.id);
                            }}
                            className={`p-2 rounded-lg transition-colors ${activeMenu === task.id ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-white hover:bg-slate-800/50'}`}
                          >
                            <MoreVertical size={18} />
                          </button>

                          <AnimatePresence>
                            {activeMenu === task.id && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute right-0 mt-2 w-40 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-[100] backdrop-blur-xl"
                              >
                                <button 
                                  onClick={() => openEditTaskModal(task)}
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
                                  <span>DELETE TASK</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <ChevronRight size={18} className={`text-slate-700 transition-transform duration-300 hidden md:block ${isExpanded ? 'rotate-90 text-blue-500' : ''}`} />
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 md:px-5 pb-5 md:pb-6 pt-0 border-t border-slate-800/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="mt-4 bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
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
        </div>
      </div>

      {/* Modals */}
      <CreateTaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onTaskCreated={fetchProjectDetails}
        task={editingTask}
        isProjectContext={true}
      />

      <CreateProjectModal 
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={fetchProjectDetails}
        project={project}
      />

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project?"
        message={`Are you sure you want to delete "${project.title}"? This will permanently delete the project and all its associated tasks. This action cannot be undone.`}
        confirmText="Yes, Delete"
        type="danger"
      />

      <ConfirmModal 
        isOpen={!!deletingTaskId}
        onClose={() => setDeletingTaskId(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task?"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Yes, Delete"
        type="danger"
      />
    </div>
  );
};

export default ProjectDetail;
