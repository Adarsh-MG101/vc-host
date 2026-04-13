'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock, User as UserIcon, LogOut } from 'lucide-react';
import { authService } from '../../services/auth.service';
import Link from 'next/link';
import { ROUTES } from '../../routes/paths';
import { motion, AnimatePresence } from 'framer-motion';

export const SuperadminTopBar: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const user = mounted ? authService.getCurrentUser() : null;
  const isOwner = mounted ? (user?.role !== 'superadmin') : false;

  return (
    <header className="h-[72px] bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-[120]">
      {/* Page Context */}
      <div className="flex items-center space-x-5">
        <div className={`w-12 h-12 rounded-2xl overflow-hidden ${isOwner ? 'bg-orange-50 text-brand-orange shadow-orange-500/10' : 'bg-blue-50 text-brand-navy shadow-indigo-500/10'} flex items-center justify-center shadow-sm border border-gray-50/50`}>
          {isOwner ? (
            user?.organization?.logo ? (
              <img src={user.organization.logo} alt={user.organization.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[18px] font-black">{user?.organization?.name?.[0].toUpperCase() || 'O'}</span>
            )
          ) : (
            <Clock size={24} />
          )}
        </div>
        <div>
          <h2 className="text-[14px] font-black text-brand-navy uppercase tracking-[0.25em] leading-none">
            {isOwner ? (user?.organization?.name || 'ORGANIZATION PANEL') : 'SUPERADMIN PANEL'}
          </h2>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-2 leading-none">
            {isOwner ? 'Management Dashboard' : 'System Administration'}
          </p>
        </div>
      </div>

      {/* User Status */}
      <div className="relative" ref={dropdownRef}>
        <div 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-4 group cursor-pointer hover:bg-gray-50/80 px-4 py-2 rounded-2xl transition-all duration-300"
        >
          <div className="flex flex-col items-end mr-1">
            <span className="text-[12px] font-semibold text-gray-900 tracking-tight leading-none">
              {user?.name || 'User'}
            </span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              {isOwner ? 'Owner' : 'Superadmin'}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-full ${isOwner ? 'bg-orange-50 border-orange-100 text-brand-orange' : 'bg-blue-50 border-indigo-100 text-brand-navy'} border-2 flex items-center justify-center text-[14px] font-black shadow-inner`}>
            {user?.name?.[0].toUpperCase() || 'U'}
          </div>
          <div className={`text-gray-300 group-hover:text-gray-500 transition-all ${dropdownOpen ? 'rotate-180 text-gray-600' : ''}`}>
            <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden py-2"
            >
              <div className="px-4 py-3 border-b border-gray-50 mb-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Signed in as</p>
                <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">{user?.email}</p>
              </div>

              <Link 
                href={ROUTES.ORGANIZATION.PROFILE}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-brand-orange hover:bg-orange-50/50 transition-colors"
              >
                <UserIcon size={16} />
                <span>Your Profile</span>
              </Link>

              <button 
                onClick={() => {
                  setDropdownOpen(false);
                  authService.logout().then(() => window.location.href = isOwner ? ROUTES.HOME : ROUTES.SUPERADMIN.LOGIN);
                }}
                className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50/50 hover:text-rose-700 transition-colors mt-1"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
