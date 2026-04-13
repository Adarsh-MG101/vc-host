'use client';

import React from 'react';
import { Input } from './Input';

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  isLoading = false, 
  className = '', 
  placeholder = 'Search records, certificates, or organizations...',
  onChange,
  ...props 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <Input
      type="text"
      placeholder={placeholder}
      className={`bg-white shadow-xl shadow-gray-200 border-gray-100 hover:border-blue-200 focus:ring-blue-100 ${className}`}
      leftIcon={
        isLoading ? (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )
      }
      rightIcon={
        <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-bold text-gray-400 bg-gray-100 border border-gray-200 rounded-lg shadow-sm tracking-widest uppercase">
          Ctrl/K
        </kbd>
      }
      onChange={handleChange}
      {...props}
    />
  );
};
