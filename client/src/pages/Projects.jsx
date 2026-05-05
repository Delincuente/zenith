import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../api';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Calendar,
  Layers,
  Clock,
  Briefcase,
  Edit2,
  Trash2
} from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';
import ConfirmModal from '../components/ConfirmModal';
import useDebounce from '../hooks/useDebounce';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 600);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await projectService.getAll({ search: debouncedSearch });
      setProjects(data.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [debouncedSearch]);

  const handleDeleteProject = async () => {
    try {
      await axiosInstance.delete(`/projects/${projectToDelete.id}`);
      toast.success('Project deleted successfully');
      fetchProjects();
      setIsConfirmOpen(false);
    } catch (error) {
      console.error('Delete project error:', error);
    }
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const openDeleteConfirm = (project) => {
    setProjectToDelete(project);
    setIsConfirmOpen(true);
    setActiveMenu(null);
  };


  return (
    <div className="space-y-4 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500" onClick={() => setActiveMenu(null)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2 tracking-tight">Projects</h2>
          <p className="text-slate-400 text-xs md:text-base">Manage and track all your active projects.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 active:scale-95 w-full md:w-auto text-xs md:text-sm"
        >
          <Plus size={18} className="md:w-5 md:h-5" />
          <span>New Project</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 md:py-3 bg-slate-900 border border-slate-800 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white text-xs md:text-sm"
          />
        </div>

        <div className="flex gap-2">
          <button className="flex-1 md:flex-none px-3 md:px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg md:rounded-xl text-slate-400 hover:text-white transition-colors flex items-center justify-center space-x-2 text-xs md:text-sm">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button className="px-3 md:px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg md:rounded-xl text-slate-400 hover:text-white transition-colors">
            <Layers size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 md:h-64 bg-slate-900/50 animate-pulse rounded-2xl border border-slate-800"></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 md:py-20 bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl md:rounded-3xl">
          <div className="bg-slate-800 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
            <Briefcase size={24} className="md:w-8 md:h-8" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-white">No projects found</h3>
          <p className="text-slate-400 mt-2 text-xs md:text-sm max-w-xs mx-auto px-4">Get started by creating your first project for a client.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 md:mt-6 text-blue-400 text-sm md:text-base font-medium hover:underline underline-offset-4"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {projects.map((project) => (
            <div 
              key={project.id} 
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 hover:shadow-2xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden cursor-pointer active:scale-[0.98]"
            >
              <div className="absolute top-0 right-0 p-3 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === project.id ? null : project.id);
                    }}
                    className={`p-2 rounded-lg transition-colors ${activeMenu === project.id ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'}`}
                  >
                    <MoreVertical size={18} className="md:w-5 md:h-5" />
                  </button>

                  {activeMenu === project.id && (
                    <div className="absolute right-0 mt-2 w-36 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-[100] backdrop-blur-xl">
                      <button 
                        onClick={() => openEditModal(project)}
                        className="w-full px-4 py-2 text-[11px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 flex items-center space-x-2 transition-colors"
                      >
                        <Edit2 size={14} />
                        <span>EDIT PROJECT</span>
                      </button>
                      <button 
                        onClick={() => openDeleteConfirm(project)}
                        className="w-full px-4 py-2 text-[11px] font-bold text-red-500/70 hover:text-red-500 hover:bg-red-500/10 flex items-center space-x-2 transition-colors border-t border-slate-800/50"
                      >
                        <Trash2 size={14} />
                        <span>DELETE</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mb-3 md:mb-4">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center font-bold text-[10px] md:text-xs ${
                  project.status === 'active' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'
                }`}>
                  {project.title.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm md:text-base text-white font-bold group-hover:text-blue-400 transition-colors truncate pr-6">{project.title}</h4>
                  <p className="text-[9px] md:text-xs text-slate-500 uppercase tracking-wider font-bold">{project.Client?.company_name || 'Individual'}</p>
                </div>
              </div>

              <p className="text-slate-400 text-xs md:text-sm line-clamp-2 md:line-clamp-3 mb-4 md:mb-6 min-h-[32px] md:min-h-[60px]">
                {project.description || 'No description provided.'}
              </p>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] md:text-xs">
                  <span className="text-slate-500">Progress</span>
                  <span className="text-slate-300 font-medium">65%</span>
                </div>
                <div className="w-full h-1 md:h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>

              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center text-slate-500 text-[10px] md:text-xs">
                  <Clock size={12} className="mr-1.5 md:w-3.5 md:h-3.5" />
                  <span>2 days left</span>
                </div>
                <div className="flex border border-slate-800 rounded-full p-0.5 md:p-1 bg-slate-950">
                   <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-500 flex items-center justify-center text-[9px] md:text-[10px] text-white border-2 border-slate-950">JD</div>
                   <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-purple-500 flex items-center justify-center text-[9px] md:text-[10px] text-white border-2 border-slate-950 -ml-1.5 md:-ml-2">AK</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateProjectModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onProjectCreated={fetchProjects}
        project={editingProject}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project?"
        message={`Are you sure you want to delete "${projectToDelete?.title}"? This will permanently delete the project and all its associated tasks. This action cannot be undone.`}
        confirmText="Yes, Delete"
        type="danger"
      />
    </div>
  );
};

export default Projects;
