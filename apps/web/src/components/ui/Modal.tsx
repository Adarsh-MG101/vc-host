'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  noScroll?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  size = 'md',
  noScroll = false
}) => {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-[calc(100vw-2rem)] h-[calc(100vh-2rem)]',
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 font-sans overflow-hidden">
          {/* Dimmed Focus Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/60 transition-all duration-500"
            onClick={onClose}
          />
          
          {/* Animated Pop-out Content */}
          <motion.div 
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`bg-white w-full ${sizes[size]} rounded-lg shadow-4xl relative z-10 flex flex-col max-h-full border border-white/20`}
          >
            <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-extrabold text-brand-navy tracking-tight select-none">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-lg text-gray-400 hover:text-brand-navy hover:bg-gray-100 transition-all active:scale-95 duration-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className={`px-8 pt-4 pb-8 ${noScroll ? 'overflow-visible' : 'overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent'}`}>
              {children}
            </div>
            {footer && (
              <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/10 flex items-center justify-end space-x-3 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
