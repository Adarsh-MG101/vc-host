'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Toast } from '../../../components/ui/Toast';
import { authService } from '../../../services/auth.service';
import { profileService } from '../../../services/profile.service';
import { User, Mail, Shield, Building2, Key, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Profile Form state
  const [name, setName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ isVisible: false, title: '', message: '', variant: 'info' as any });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setName(user.name || '');
    }
  }, []);

  const showToast = (title: string, message: string, variant: 'success'|'danger'|'info' = 'info') => {
    setToast({ isVisible: true, title, message, variant });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Validation Error', 'Name cannot be empty', 'danger');
      return;
    }
    
    setIsUpdatingProfile(true);
    try {
      await profileService.updateProfile(name);
      showToast('Success', 'Profile updated successfully', 'success');
      
      // Update local storage so the new name appears across the app
      const lsUserData = localStorage.getItem('user');
      if (lsUserData) {
        const parsed = JSON.parse(lsUserData);
        parsed.name = name;
        localStorage.setItem('user', JSON.stringify(parsed));
        setCurrentUser(parsed);
      }
    } catch (error: any) {
      showToast('Error', error.message || 'Failed to update profile', 'danger');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Validation Error', 'All password fields are required', 'danger');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showToast('Validation Error', 'New passwords do not match', 'danger');
      return;
    }
    
    if (newPassword.length < 8) {
      showToast('Validation Error', 'Password must be at least 8 characters long', 'danger');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await profileService.changePassword(currentPassword, newPassword);
      showToast('Success', 'Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showToast('Error', error.message || 'Failed to change password', 'danger');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex flex-col space-y-6 max-w-4xl mx-auto pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-3 mb-4"
      >
        <div className="w-10 h-10 bg-brand-navy border border-gray-200 rounded-xl flex items-center justify-center text-white shadow-sm">
          <User size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Your Profile</h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Manage your personal information and security.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Profile Form */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-center space-x-2 mb-6 border-b border-gray-100 pb-4">
              <User size={18} className="text-blue-500" />
              <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 px-1">Email Address</label>
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500">
                    <Mail size={16} />
                    <span className="text-sm font-medium truncate">{currentUser.email}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 px-1">Organization</label>
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500">
                    <Building2 size={16} />
                    <span className="text-sm font-medium truncate">{currentUser.organization?.name || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="primary" isLoading={isUpdatingProfile} className="shadow-lg shadow-blue-500/20">
                  <div className="flex items-center space-x-2">
                    <Save size={16} />
                    <span>Save Changes</span>
                  </div>
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Security Form */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-center space-x-2 mb-6 border-b border-gray-100 pb-4">
              <Shield size={18} className="text-brand-orange" />
              <h2 className="text-lg font-bold text-gray-900">Security</h2>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                />
                
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retype password"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="primary" isLoading={isUpdatingPassword} className="bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/20 text-white border-0">
                  <div className="flex items-center space-x-2">
                    <Key size={16} />
                    <span>Change Password</span>
                  </div>
                </Button>
              </div>
            </form>
          </motion.div>
          
        </div>

        {/* Right Column - Status/Info Panel */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-br from-brand-navy to-indigo-900 rounded-xl shadow-xl overflow-hidden text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
              <Shield size={120} />
            </div>
            
            <div className="p-8 relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 bg-white/10 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-sm text-3xl font-black mb-2">
                {currentUser.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">{currentUser.name}</h3>
                <p className="text-indigo-200 text-sm mt-1">{currentUser.email}</p>
              </div>
              
              <div className="pt-6 w-full">
                <div className="bg-black/20 rounded-xl p-4 border border-white/10 text-left space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Role Level</p>
                    <p className="text-sm font-semibold capitalize mt-0.5">{currentUser.role === 'user' ? 'Member' : currentUser.role}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Account Status</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-sm font-semibold text-emerald-400">Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
      </div>

      <Toast
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
        title={toast.title}
        message={toast.message}
        variant={toast.variant}
      />
    </div>
  );
}
