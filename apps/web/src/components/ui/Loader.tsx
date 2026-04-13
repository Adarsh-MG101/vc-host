'use client';

import React from 'react';

type LoaderSize = 'sm' | 'md' | 'lg' | 'xl';
type LoaderVariant = 'primary' | 'white' | 'gray';

interface LoaderProps {
  size?: LoaderSize;
  variant?: LoaderVariant;
  label?: string;
  fullPage?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  variant = 'primary', 
  label, 
  fullPage = false 
}) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-6',
  };

  const variants = {
    primary: 'border-blue-600/10 border-t-blue-600',
    white: 'border-white/20 border-t-white',
    gray: 'border-gray-200 border-t-gray-500',
  };

  const loader = (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 animate-in fade-in zoom-in duration-500">
      <div 
        className={`rounded-full animate-spin transition-all duration-300 shadow-sm ${sizes[size]} ${variants[variant]}`}
      />
      {label && (
        <p className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] animate-pulse whitespace-nowrap px-4 py-2 bg-white rounded-full shadow-sm">
          {label}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-50/80 backdrop-blur-md">
        {loader}
      </div>
    );
  }

  return loader;
};
