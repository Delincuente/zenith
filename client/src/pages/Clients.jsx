import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  User,
  Phone,
  Trash2,
  X,
  AlertCircle,
  Building
} from 'lucide-react';
import { validateName, validatePhone } from '../utils/validators';
import { formatDate } from '../utils/dateFormatter';
import ConfirmModal from '../components/ConfirmModal';
import { focusFirstError } from '../utils/formUtils';

import useDebounce from '../hooks/useDebounce';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ company_name: '', phone: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 600);

  useEffect(() => {
    fetchClients();
  }, [debouncedSearch]);

  useEffect(() => {
    if (!isModalOpen) {
      setFormData({ company_name: '', phone: '' });
      setFieldErrors({});
      setError('');
    }
  }, [isModalOpen]);

  const fetchClients = async () => {
    try {
      const { data } = await axiosInstance.get('/clients', {
        params: { search: debouncedSearch }
      });
      setClients(data);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setError('');

    // Custom Validation
    const newErrors = {};
    if (!validateName(formData.company_name)) newErrors.company_name = 'Company name must be at least 2 characters.';
    if (formData.phone && !validatePhone(formData.phone)) newErrors.phone = 'Please enter a valid phone number.';

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      focusFirstError(newErrors);
      return;
    }

    setFieldErrors({});
    setSubmitLoading(true);
    try {
      await axiosInstance.post('/clients', formData, { _skipToast: true });
      setIsModalOpen(false);
      setFormData({ company_name: '', phone: '' });
      fetchClients();
      toast.success('Client created successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create client');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteClient = async (id) => {
    try {
      await axiosInstance.delete(`/clients/${id}`);
      fetchClients();
      toast.success('Client deleted successfully!');
    } catch (err) {
      console.error('Delete client error:', err);
    }
  };

  const confirmDelete = (client) => {
    setClientToDelete(client);
    setIsConfirmOpen(true);
  };

  return (
    <div className="space-y-4 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">My Clients</h1>
          <p className="text-slate-400 text-xs md:text-base">Manage your business contacts and agencies.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 active:scale-95 text-xs md:text-sm"
        >
          <Plus size={18} className="md:w-5 md:h-5" />
          <span>Add Client</span>
        </button>
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Search clients by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 md:py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-white text-sm placeholder-slate-500 font-medium"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-12 md:p-20 text-center">
            <div className="animate-spin rounded-full h-8 md:h-12 w-8 md:w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12 md:py-20 bg-slate-900/50">
            <div className="bg-slate-800 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
              {search ? <Search size={24} className="md:w-8 md:h-8" /> : <Building size={24} className="md:w-8 md:h-8" />}
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-white">
              {search ? 'No results found' : 'No clients added yet'}
            </h3>
            <p className="text-slate-400 mt-2 text-xs md:text-sm max-w-xs mx-auto px-4">
              {search ? `We couldn't find any clients matching "${search}"` : 'Start by adding your first client info.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Company Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Added On</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                            {client.company_name.charAt(0)}
                          </div>
                          <span className="text-white font-medium">{client.company_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-400">
                        <div className="flex items-center space-x-2">
                          <Phone size={14} />
                          <span>{client.phone || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-400 text-sm">
                        {formatDate(client.createdAt)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            confirmDelete(client);
                          }}
                          className="p-2 text-slate-500 hover:text-red-400 transition-colors bg-slate-800/30 rounded-lg group-hover:bg-red-400/10"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-slate-800">
              {clients.map((client) => (
                <div key={client.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-base">
                      {client.company_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm text-white font-bold">{client.company_name}</h4>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5">
                        <Phone size={10} />
                        <span>{client.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => confirmDelete(client)}
                    className="p-2.5 text-slate-500 hover:text-red-400 bg-slate-800/50 rounded-lg transition-colors active:scale-95"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add Client Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center lg:items-center justify-center lg:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Bottom Sheet Slider */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-slate-900 border border-slate-800 w-full max-w-md rounded-t-[2.5rem] lg:rounded-3xl shadow-2xl p-8 md:p-10 mt-auto lg:mt-0 pb-12 lg:pb-10"
            >
              {/* Mobile Drag Indicator */}
              <div className="lg:hidden w-16 h-1.5 bg-slate-800 rounded-full mx-auto mb-8 -mt-2" />

              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Add Client</h2>
                <button onClick={() => setIsModalOpen(false)} className="hidden lg:flex text-slate-500 hover:text-white transition-colors p-2 bg-slate-800 rounded-xl">
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="mb-6 flex items-center space-x-2 bg-red-400/10 border border-red-400/20 text-red-400 px-4 py-3 rounded-xl text-sm leading-relaxed">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateClient} noValidate className="space-y-6 md:space-y-8">
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Company/Client Name</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors">
                      <Building size={20} />
                    </span>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      className={`block w-full pl-12 pr-4 py-4 bg-slate-800/40 border ${fieldErrors.company_name ? 'border-red-500' : 'border-slate-700/50'} rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium`}
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  {fieldErrors.company_name && <p className="mt-2 text-xs text-red-500 ml-1 font-medium">{fieldErrors.company_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Phone Number</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors">
                      <Phone size={20} />
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`block w-full pl-12 pr-4 py-4 bg-slate-800/40 border ${fieldErrors.phone ? 'border-red-500' : 'border-slate-700/50'} rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium`}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  {fieldErrors.phone && <p className="mt-2 text-xs text-red-500 ml-1 font-medium">{fieldErrors.phone}</p>}
                </div>

                <div className="flex justify-end items-center space-x-3 pt-6 border-t border-slate-800/50">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="py-2.5 md:py-3 px-8 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl font-semibold transition-all text-xs md:text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="flex items-center justify-center space-x-2 py-2.5 md:py-3 px-10 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 text-xs md:text-sm"
                  >
                    {submitLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <span>Create Client</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
       <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => handleDeleteClient(clientToDelete?.id)}
        title="Delete Client?"
        message={`Are you sure you want to delete ${clientToDelete?.company_name}? This will permanently remove their profile and data.`}
        confirmText="Yes, Delete"
      />
    </div>
  );
};

export default Clients;
