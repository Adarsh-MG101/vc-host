'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  label: string;
  value: string | number;
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
}

export const Select: React.FC<SelectProps> = ({ 
  options, 
  value, 
  onChange, 
  label, 
  error, 
  placeholder = 'Select option...', 
  className = '', 
  id 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            w-full flex items-center justify-between px-6 py-4 text-sm bg-white border outline-none
            transition-all duration-310 rounded-2xl shadow-sm hover:shadow-md
            ${isOpen ? 'ring-4 border-brand-navy shadow-lg ring-blue-500/5' : 'border-gray-100'}
            ${error ? 'border-red-500 bg-red-50/50' : 'bg-gray-50/30'}
            active:scale-[0.99]
          `}
        >
          <span className={`font-semibold tracking-tight ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            size={18} 
            className={`text-gray-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-navy' : ''}`} 
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute z-[200] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-gray-200/50 overflow-hidden max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200"
            >
              <div className="p-2 space-y-1">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all
                      ${value === option.value 
                        ? 'bg-blue-50 text-brand-navy' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                    `}
                  >
                    <span className="tracking-tight">{option.label}</span>
                    {value === option.value && <Check size={16} className="text-brand-navy" />}
                  </button>
                ))}
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
