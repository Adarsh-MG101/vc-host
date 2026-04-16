'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  label: string;
  value: string | number;
  meta?: string;
}

interface SelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  className?: string;
  id?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  options, 
  value, 
  onChange, 
  label, 
  error, 
  placeholder = 'Select option...', 
  className = '', 
  id,
  searchable = false,
  searchPlaceholder = 'Search...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = searchable && searchQuery
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opt.meta && opt.meta.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  return (
    <div className={`w-full space-y-1.5 font-sans ${className}`} ref={containerRef}>
      {label && (
        <label className="block ml-1 text-xs font-bold text-gray-500 uppercase tracking-widest" htmlFor={id}>
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between px-5 py-3 text-sm bg-white border outline-none
            transition-all duration-310 rounded-xl shadow-sm hover:shadow-md
            ${isOpen ? 'ring-4 border-brand-navy shadow-lg ring-blue-500/5' : 'border-gray-100'}
            ${error ? 'border-red-500 bg-red-50/50' : 'bg-gray-50/30'}
            active:scale-[0.99]
          `}
        >
          <span className={`font-semibold tracking-tight ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            size={16} 
            className={`text-gray-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-navy' : ''}`} 
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute z-[500] w-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden"
            >
              {searchable && (
                <div className="p-2 border-b border-gray-50 bg-gray-50/20">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={searchPlaceholder}
                      className="w-full pl-9 pr-4 py-2 text-xs font-medium text-gray-700 bg-white rounded-lg border border-gray-100 outline-none focus:border-brand-navy transition-colors placeholder:text-gray-300"
                    />
                  </div>
                </div>
              )}
              <div className="p-1.5 space-y-0.5 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                {filteredOptions.length > 0 ? filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`
                      w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all
                      ${value === option.value 
                        ? 'bg-brand-navy text-white shadow-md' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-brand-navy'}
                    `}
                  >
                    <div className="flex flex-col items-start">
                      <span className="tracking-tight">{option.label}</span>
                      {option.meta && <span className={`text-[9px] font-medium ${value === option.value ? 'text-white/70' : 'text-gray-400'}`}>{option.meta}</span>}
                    </div>
                    {value === option.value && <Check size={14} className="text-white" />}
                  </button>
                )) : (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs text-gray-400 font-medium italic">No results found</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p className="ml-1 text-[11px] font-semibold tracking-tight text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};
