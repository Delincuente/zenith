import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { UserPlus, Mail, Lock, User, AlertCircle, Building, Zap } from 'lucide-react';
import { validateEmail, validatePassword, validateName } from '../utils/validators';
import { focusFirstError } from '../utils/formUtils';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client'
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const register = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.isLoading);
  const navigate = useNavigate();


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const newErrors = {};
    if (!validateName(formData.name)) newErrors.name = 'Name must be at least 2 characters.';
    if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address.';
    if (!validatePassword(formData.password)) newErrors.password = 'Password must be at least 6 characters.';
    
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      focusFirstError(newErrors);
      return;
    }

    setFieldErrors({});
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };


  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10 overflow-hidden">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 mx-auto mb-6 animate-in zoom-in-50 duration-500">
            <Zap size={32} className="text-white fill-current" />
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-3 tracking-tighter">
            Join Zenith
          </h1>
          <p className="text-slate-400 font-medium">Start your journey to the peak.</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">
          {error && (
            <div className="mb-6 flex items-center space-x-2 bg-red-400/10 border border-red-400/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 bg-slate-800/50 border ${fieldErrors.name ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all`}
                  placeholder="John Doe"
                />
              </div>
              {fieldErrors.name && <p className="mt-1.5 text-xs text-red-500 ml-1">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 bg-slate-800/50 border ${fieldErrors.email ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all`}
                  placeholder="john@example.com"
                />
              </div>
              {fieldErrors.email && <p className="mt-1.5 text-xs text-red-500 ml-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 bg-slate-800/50 border ${fieldErrors.password ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all`}
                  placeholder="••••••••"
                />
              </div>
              {fieldErrors.password && <p className="mt-1.5 text-xs text-red-500 ml-1">{fieldErrors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">I am an</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                  className={`px-4 py-3 rounded-xl border flex items-center justify-center space-x-2 transition-all ${
                    formData.role === 'admin' 
                    ? 'bg-blue-600/20 border-blue-600 text-blue-400' 
                    : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600'
                  }`}
                >
                  <Building size={18} />
                  <span>Agency</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'client' })}
                  className={`px-4 py-3 rounded-xl border flex items-center justify-center space-x-2 transition-all ${
                    formData.role === 'client' 
                    ? 'bg-blue-600/20 border-blue-600 text-blue-400' 
                    : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600'
                  }`}
                >
                  <User size={18} />
                  <span>Freelancer</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
