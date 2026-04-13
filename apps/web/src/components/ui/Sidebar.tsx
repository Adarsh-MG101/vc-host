'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutGrid, 
  Users, 
  Activity,
  LogOut,
  Menu,
  FileText,
  Award
} from 'lucide-react';
import Image from 'next/image';
import { authService } from '../../services/auth.service';
import { motion } from 'framer-motion';
import { ROUTES } from '../../routes/paths';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

interface SidebarItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  isCollapsed: boolean;
  disabled?: boolean;
  isOwner?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ href, label, icon, isActive, isCollapsed, disabled, isOwner }) => {
  return (
    <div title={isCollapsed ? label : ''} className={`block group ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      <Link 
        href={disabled ? '#' : href} 
        className={`
          flex items-center rounded-lg transition-all duration-300 relative
          ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'}
          ${isActive 
            ? (isOwner ? 'bg-orange-50 text-brand-orange' : 'bg-blue-50 text-brand-navy') 
            : 'text-gray-500 hover:bg-gray-50'}
          ${disabled ? 'opacity-40 grayscale pointer-events-none' : ''}
        `}
        onClick={(e) => disabled && e.preventDefault()}
      >
        <div className={`
          flex items-center justify-center w-8 h-8 rounded-md transition-all duration-300
          ${isActive 
            ? (isOwner ? 'bg-brand-orange text-white shadow-md' : 'bg-brand-navy text-white shadow-md') 
            : 'text-gray-400 group-hover:text-gray-600'}
        `}>
          {icon}
        </div>
        
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="text-sm font-medium tracking-tight whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </Link>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = mounted ? authService.getCurrentUser() : null;
  const isOwner = mounted ? (user?.role !== 'superadmin') : false;

  const handleLogout = async () => {
    const isSuperAdmin = user?.role === 'superadmin';
    await authService.logout();
    if (isSuperAdmin) {
      router.push(ROUTES.SUPERADMIN.LOGIN);
    } else {
      router.push(ROUTES.HOME);
    }
  };

  const superadminNavItems: NavItem[] = [
    { href: ROUTES.SUPERADMIN.DASHBOARD, label: 'Overview', icon: <LayoutGrid size={18} /> },
    { href: ROUTES.SUPERADMIN.ORGANIZATIONS, label: 'Organizations', icon: <Users size={18} /> },
    { href: ROUTES.SUPERADMIN.ACTIVITY, label: 'Admin Activity', icon: <Activity size={18} /> },
  ];

  const ownerNavItems: NavItem[] = [
    { href: ROUTES.ORGANIZATION.DASHBOARD, label: 'Dashboard', icon: <LayoutGrid size={18} /> },
    { href: ROUTES.ORGANIZATION.TEMPLATES, label: 'Templates', icon: <FileText size={18} /> },
    { href: ROUTES.ORGANIZATION.CERTIFICATES, label: 'Certificates', icon: <Award size={18} />, disabled: true },
    { href: ROUTES.ORGANIZATION.ROLES, label: 'Roles and Users', icon: <Users size={18} /> },
    { href: ROUTES.ORGANIZATION.ACTIVITY, label: 'Activity', icon: <Activity size={18} /> },
  ];

  const navItems = isOwner ? ownerNavItems : superadminNavItems;

  const logoHref = isOwner ? ROUTES.ORGANIZATION.DASHBOARD : ROUTES.SUPERADMIN.DASHBOARD;

  return (
    <aside 
      className={`bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 z-[110] transition-all duration-300 ease-in-out shadow-sm
        ${isCollapsed ? 'w-[88px]' : 'w-[280px]'}
      `}
    >
      {/* Brand & Menu */}
      <div className={`px-4 h-[72px] flex items-center border-b border-gray-100 ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
        {!isCollapsed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center"
          >
            <Link href={logoHref} className="flex items-center space-x-4 group">
              <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-md border border-brand-orange/10 group-hover:shadow-lg transition-all transform group-hover:scale-105 duration-300">
                <Image src="/vc logo.jpeg" alt="VerifyCerts Logo" fill className="object-cover" priority />
              </div>
              <div className="flex flex-col">
                <span className="text-[18px] font-black text-brand-orange tracking-tighter uppercase leading-none">VerifyCerts</span>
                <span className="text-[8px] font-bold text-brand-navy uppercase tracking-[0.3em] mt-1.5">Secure & Reliable</span>
              </div>
            </Link>
          </motion.div>
        ) : (
          <Link href={logoHref} className="relative w-8 h-8 overflow-hidden rounded-lg shadow-sm border border-gray-100 shrink-0">
            <Image src="/vc logo.jpeg" alt="VerifyCerts Logo" fill className="object-cover" priority />
          </Link>
        )}
        
        {!isCollapsed && (
          <button 
            onClick={onToggle}
            className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
          >
            <Menu size={18} />
          </button>
        )}
      </div>

      {/* Toggle button for collapsed state */}
      {isCollapsed && (
        <div className="flex justify-center pt-6">
          <button 
            onClick={onToggle}
            className="p-3 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
          >
            <Menu size={20} />
          </button>
        </div>
      )}

      {/* Nav Content */}
      <div className={`flex-1 overflow-y-auto overflow-x-hidden py-8 space-y-2 ${isCollapsed ? 'px-3' : 'px-4'}`}>
        {navItems.map((item) => (
          <SidebarItem 
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={pathname === item.href}
            isCollapsed={isCollapsed}
            disabled={item.disabled}
            isOwner={isOwner}
          />
        ))}
      </div>

      {/* Logout & Footer */}
      <div className={`py-6 border-t border-gray-100 space-y-4 ${isCollapsed ? 'px-3' : 'px-4'}`}>
        <button 
          onClick={handleLogout}
          className={`flex items-center bg-gray-50 hover:bg-red-50 hover:text-red-500 transition-all rounded-xl text-gray-500 group
            ${isCollapsed ? 'justify-center p-3 w-full' : 'space-x-3 px-4 py-3 w-full'}
          `}
          title={isCollapsed ? 'Sign out' : ''}
        >
          <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Sign out</span>}
        </button>
        
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4"
          >
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest text-center">
              VerifyCerts © 2026
            </p>
          </motion.div>
        )}
      </div>
    </aside>
  );
};
