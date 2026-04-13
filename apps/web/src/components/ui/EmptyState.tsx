'use client';

import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  fullHeight?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction, 
  fullHeight = false 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center font-sans space-y-6 ${fullHeight ? 'min-h-[60vh]' : ''}`}>
      <div className="w-24 h-24 bg-gray-50 flex items-center justify-center rounded-3xl text-gray-400 group hover:bg-blue-50 hover:text-blue-500 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/10 active:scale-95">
        {icon}
      </div>
      <div className="max-w-xs space-y-2">
        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
          {title}
        </h3>
        <p className="text-sm font-medium text-gray-500 leading-relaxed px-2">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="md"
          onClick={onAction}
          className="mt-6 px-8 shadow-xl shadow-blue-600/10"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
