'use client';

import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'brand';
type BadgeSize = 'xs' | 'sm' | 'md';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  label, 
  variant = 'gray', 
  size = 'sm', 
  dot = false 
}) => {
  const baseStyles = 'inline-flex items-center text-[10px] font-bold leading-none select-none tracking-widest uppercase px-2.5 py-1.5 rounded-lg border shadow-sm font-sans whitespace-nowrap transition-all duration-300 transform hover:scale-105';
  
  const variants = {
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/10',
    warning: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-500/10',
    danger: 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-500/10',
    info: 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-500/10',
    gray: 'bg-slate-50 text-slate-500 border-slate-100 shadow-slate-500/10',
    brand: 'bg-orange-50 text-brand-orange border-orange-100 shadow-orange-500/10',
  };

  const sizes = {
    xs: 'px-1.5 py-1 text-[9px]',
    sm: 'px-2.5 py-1.5 text-[10px]',
    md: 'px-3.5 py-2 text-xs',
  };

  const dots = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-blue-500',
    gray: 'bg-slate-400',
    brand: 'bg-brand-orange',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full mr-2 shadow-sm animate-pulse ${dots[variant]}`}></span>}
      {label}
    </span>
  );
};
