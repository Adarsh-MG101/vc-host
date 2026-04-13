'use client';

import React, { useEffect } from 'react';

type ToastVariant = 'success' | 'warning' | 'danger' | 'info';

interface ToastProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  isVisible, 
  onClose, 
  title, 
  message, 
  variant = 'info', 
  duration = 5000 
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const baseStyles = 'fixed bottom-8 right-8 z-[100] w-full max-w-sm overflow-hidden bg-white rounded-3xl shadow-5xl border-2 transition-all duration-500 transform font-sans';
  const animationStyles = isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-12 scale-95 opacity-0';
  
  const variants = {
    success: 'border-emerald-100 text-emerald-600',
    warning: 'border-amber-100 text-amber-600',
    danger: 'border-rose-100 text-rose-600',
    info: 'border-blue-100 text-blue-600',
  };

  const icons = {
    success: (
      <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    danger: (
      <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className={`${baseStyles} ${animationStyles} ${variants[variant]}`}>
      <div className="p-6 flex items-start space-x-6">
        <div className="p-3 bg-gray-50 rounded-2xl shrink-0 group hover:scale-110 transition-transform">
          {icons[variant]}
        </div>
        <div className="flex-1 space-y-1 select-none pr-8">
          <h4 className="text-sm font-black uppercase tracking-widest leading-none translate-y-1">
            {title}
          </h4>
          <p className="text-gray-500 text-xs font-bold leading-relaxed pr-2">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-900 bg-gray-50/50 hover:bg-gray-100 rounded-xl transition-all active:scale-90"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div 
        className="h-1 bg-current opacity-20 absolute bottom-0 left-0 transition-opacity duration-300"
        style={{ 
          width: '100%', 
          animation: `toast-shrink ${duration}ms linear forwards` 
        }}
      />
      <style jsx>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
