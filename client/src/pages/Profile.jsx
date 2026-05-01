import React, { useState, useEffect } from 'react';
import { userService } from '../api';
import useAuthStore from '../store/useAuthStore';
import { User, Mail, Lock, CheckCircle, AlertCircle, Loader2, Settings } from 'lucide-react';
import { focusFirstError } from '../utils/formUtils';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  
  // Profile Update State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [profileFieldErrors, setProfileFieldErrors] = useState({});

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [passwordFieldErrors, setPasswordFieldErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const onUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ type: '', text: '' });
    setProfileFieldErrors({});

    const newErrors = {};
    if (!profileData.name.trim()) newErrors.name = 'Full name is required.';
    if (!profileData.email.trim()) newErrors.email = 'Email address is required.';
    
    if (Object.keys(newErrors).length > 0) {
      setProfileFieldErrors(newErrors);
      focusFirstError(newErrors);
      setProfileLoading(false);
      return;
    }

    try {
      const response = await userService.updateProfile(profileData);
      updateUser(response.user);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setProfileMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    setPasswordFieldErrors({});
    
    const newErrors = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = 'Current password is required.';
    if (!passwordData.newPassword) newErrors.newPassword = 'New password is required.';
    if (passwordData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters.';
    if (!passwordData.confirmPassword) newErrors.confirmPassword = 'Please confirm your new password.';
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordFieldErrors(newErrors);
      focusFirstError(newErrors);
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage({ type: '', text: '' });

    try {
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password' 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <div className="flex items-center space-x-3 mb-2">
          <Settings className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
        </div>
        <p className="text-slate-400 text-lg">
          Manage your profile information and security settings.
        </p>
      </div>

      <div className="space-y-12">
        {/* Profile Information Section */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] lg:rounded-3xl shadow-2xl p-8 lg:p-10">
          <div className="md:grid md:grid-cols-3 md:gap-10">
            <div className="md:col-span-1 mb-8 md:mb-0">
              <h3 className="text-xl font-bold text-white mb-2">Profile Information</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Update your account's profile information and email address.
              </p>
            </div>
            
            <div className="md:col-span-2">
              <form onSubmit={onUpdateProfile} noValidate className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                      <User size={20} />
                    </span>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className={`block w-full pl-12 pr-4 py-4 bg-slate-800/40 border ${profileFieldErrors.name ? 'border-red-500' : 'border-slate-700/50'} rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium`}
                      placeholder="Your Name"
                    />
                  </div>
                  {profileFieldErrors.name && <p className="mt-2 text-xs text-red-500 ml-1 font-medium">{profileFieldErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                      <Mail size={20} />
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className={`block w-full pl-12 pr-4 py-4 bg-slate-800/40 border ${profileFieldErrors.email ? 'border-red-500' : 'border-slate-700/50'} rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {profileFieldErrors.email && <p className="mt-2 text-xs text-red-500 ml-1 font-medium">{profileFieldErrors.email}</p>}
                </div>

                {profileMessage.text && (
                  <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
                    profileMessage.type === 'success' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {profileMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="text-sm font-medium">{profileMessage.text}</span>
                  </div>
                )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="w-full sm:w-auto flex items-center justify-center space-x-2 py-2.5 px-6 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed"
                    >
                    {profileLoading ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Profile</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] lg:rounded-3xl shadow-2xl p-8 lg:p-10">
          <div className="md:grid md:grid-cols-3 md:gap-10">
            <div className="md:col-span-1 mb-8 md:mb-0">
              <h3 className="text-xl font-bold text-white mb-2">Security</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Ensure your account is using a long, random password to stay secure.
              </p>
            </div>

            <div className="md:col-span-2">
              <form onSubmit={onChangePassword} noValidate className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">
                    Current Password
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                      <Lock size={20} />
                    </span>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`block w-full pl-12 pr-4 py-4 bg-slate-800/40 border ${passwordFieldErrors.currentPassword ? 'border-red-500' : 'border-slate-700/50'} rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium`}
                    />
                  </div>
                  {passwordFieldErrors.currentPassword && <p className="mt-2 text-xs text-red-500 ml-1 font-medium">{passwordFieldErrors.currentPassword}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">
                      New Password
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                        <Lock size={20} />
                      </span>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`block w-full pl-12 pr-4 py-4 bg-slate-800/40 border ${passwordFieldErrors.newPassword ? 'border-red-500' : 'border-slate-700/50'} rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium`}
                      />
                    </div>
                    {passwordFieldErrors.newPassword && <p className="mt-2 text-xs text-red-500 ml-1 font-medium">{passwordFieldErrors.newPassword}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">
                      Confirm New Password
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                        <Lock size={20} />
                      </span>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`block w-full pl-12 pr-4 py-4 bg-slate-800/40 border ${passwordFieldErrors.confirmPassword ? 'border-red-500' : 'border-slate-700/50'} rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium`}
                      />
                    </div>
                    {passwordFieldErrors.confirmPassword && <p className="mt-2 text-xs text-red-500 ml-1 font-medium">{passwordFieldErrors.confirmPassword}</p>}
                  </div>
                </div>

                {passwordMessage.text && (
                  <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
                    passwordMessage.type === 'success' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {passwordMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="text-sm font-medium">{passwordMessage.text}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 py-2.5 px-6 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
