import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, User, Calendar, AlertCircle } from 'lucide-react';
import CustomSelect from './CustomSelect';
import { focusFirstError } from '../utils/formUtils';

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
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchClients();
    } else {
      // Reset form when modal is closed
      setFormData({
        title: '',
        description: '',
        client_id: '',
        deadline: '',
      });
      setFieldErrors({});
      setError('');
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
    setFieldErrors({});
    
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Project title is required.';
    if (!formData.client_id) newErrors.client_id = 'Please select a client.';
    
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      focusFirstError(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Ensure empty optional fields are sent as null
      const submissionData = {
        ...formData,
        deadline: formData.deadline || null,
        description: formData.description.trim() || null
      };
      await axiosInstance.post('/projects', submissionData);
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

            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Create New Project</h2>
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

            <form onSubmit={handleSubmit} noValidate className="space-y-6 md:space-y-8 pb-10 lg:pb-0">
              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Project Title</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors">
                    <Briefcase size={20} />
                  </span>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`block w-full pl-12 pr-4 py-4 bg-slate-800/40 border ${fieldErrors.title ? 'border-red-500' : 'border-slate-700/50'} rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium`}
                    placeholder="e.g. Website Redesign"
                  />
                </div>
                {fieldErrors.title && <p className="mt-2 text-xs text-red-500 ml-1 font-medium">{fieldErrors.title}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <CustomSelect
                  id="client_id"
                  label="Client"
                  icon={User}
                  placeholder="Select Client..."
                  options={clients.map(c => ({ value: c.id, label: c.company_name }))}
                  value={formData.client_id}
                  onChange={(val) => setFormData({ ...formData, client_id: val })}
                  error={fieldErrors.client_id}
                />

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

              <div className="flex justify-end items-center space-x-3 pt-6 border-t border-slate-800/50">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 md:py-3 px-8 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl font-semibold transition-all text-xs md:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || clients.length === 0}
                  className="flex items-center justify-center space-x-2 py-2.5 md:py-3 px-10 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 text-xs md:text-sm"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
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
