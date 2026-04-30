import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, User, Calendar, AlertCircle } from 'lucide-react';

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_id: '',
    deadline: '',
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  const fetchClients = async () => {
    try {
      const { data } = await axiosInstance.get('/clients');
      setClients(data);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.client_id) {
      setError('Please select a client for this project.');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/projects', formData);
      onProjectCreated();
      onClose();
      setFormData({ title: '', description: '', client_id: '', deadline: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center lg:items-center justify-center lg:p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
            onClick={onClose}
          />

          {/* Modal / Bottom Sheet */}
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-slate-900 border border-slate-800 w-full max-w-lg rounded-t-[2.5rem] lg:rounded-3xl shadow-2xl p-8 lg:p-10 mt-auto lg:mt-0"
          >
            {/* Mobile Drag Indicator */}
            <div className="lg:hidden w-16 h-1.5 bg-slate-800 rounded-full mx-auto mb-8 -mt-2" />

            <div className="flex justify-between items-center mb-6 md:mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Create New Project</h2>
                <p className="text-slate-400 text-sm md:text-base mt-1">Fill in the details to start a new collaboration.</p>
              </div>
              <button onClick={onClose} className="hidden lg:flex text-slate-500 hover:text-white transition-colors bg-slate-800/50 p-2 rounded-xl">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-6 flex items-center space-x-2 bg-red-400/10 border border-red-400/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 pb-10 lg:pb-0">
              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Project Title</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors">
                    <Briefcase size={20} />
                  </span>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="block w-full pl-12 pr-4 py-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    placeholder="e.g. Website Redesign"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Client</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                      <User size={20} />
                    </span>
                    <select
                      value={formData.client_id}
                      onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                      className="block w-full pl-12 pr-10 py-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer font-medium"
                      required
                    >
                      <option value="" className="bg-slate-900">Select...</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id} className="bg-slate-900">
                          {client.company_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Deadline (Opt)</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors">
                      <Calendar size={20} />
                    </span>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="block w-full pl-12 pr-4 py-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Brief Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="block w-full px-5 py-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[120px] font-medium"
                  placeholder="What are the main goals?"
                />
              </div>

              <div className="flex flex-col-reverse md:flex-row md:items-center justify-end gap-2 md:gap-4 pt-4 md:pt-6 border-t border-slate-800/50">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full md:w-auto px-8 py-3 md:py-3.5 text-slate-400 hover:text-white font-semibold transition-all text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || clients.length === 0}
                  className="w-full md:w-auto flex items-center justify-center space-x-2 px-10 py-3 md:py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl md:rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                  ) : (
                    <span>Create Project</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateProjectModal;
