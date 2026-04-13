'use client';

import React from 'react';
import { Input } from './Input';

interface DateTimePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({ 
  label, 
  error, 
  helperText, 
  className = '', 
  id, 
  value,
  onChange,
  ...props 
}) => {
  return (
    <Input
      id={id}
      type="datetime-local"
      label={label}
      error={error}
      helperText={helperText}
      value={value}
      onChange={onChange}
      className={`
        w-full px-4 py-3.5 text-sm font-medium text-gray-900 border appearance-none outline-none
        transition-all duration-300 rounded-2xl shadow-sm hover:shadow-md
        placeholder-gray-400 focus:bg-white focus:ring-4 focus:shadow-lg
        bg-no-repeat bg-[right_1rem_center] cursor-pointer
        ${className}
      `}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundSize: '1.25rem'
      }}
      {...props}
    />
  );
};
