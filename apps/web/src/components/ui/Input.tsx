'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

import { Eye, EyeOff } from 'lucide-react';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, showPasswordToggle, className = '', id, type, ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
    
    const inputType = type === 'password' && isPasswordVisible ? 'text' : type;

    const errorClasses = error ? 'border-red-500 bg-red-50/50' : 'border-gray-300 bg-white';
    const focusClasses = error ? 'focus:ring-red-500/10 focus:border-red-500' : 'focus:ring-brand-orange/10 focus:border-brand-orange';


    return (
      <div className="w-full space-y-1.5 font-sans">
        <style>{`
          input:-webkit-autofill,
          input:-webkit-autofill:hover, 
          input:-webkit-autofill:focus, 
          input:-webkit-autofill:active {
            transition: background-color 5000s ease-in-out 0s;
            -webkit-text-fill-color: #111827;
          }
        `}</style>
        {label && (
          <label className="block ml-1 text-xs font-bold text-gray-500 uppercase tracking-widest" htmlFor={id}>
            {label}
          </label>
        )}
        <div className="relative group rounded-lg transition-all duration-300">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors duration-200">
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            type={inputType}
            className={`
              w-full px-4 py-3.5 text-sm font-medium text-gray-900 border appearance-none outline-none
              transition-all duration-300 rounded-lg shadow-sm hover:shadow-md
              placeholder-gray-400 focus:ring-4 focus:shadow-lg
              disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200 disabled:shadow-none
              ${leftIcon ? 'pl-11' : ''}
              ${rightIcon || (type === 'password' && showPasswordToggle) ? 'pr-11' : ''}
              ${errorClasses}
              ${focusClasses}
              ${className}
            `}
            {...props}
          />
          {(rightIcon || (type === 'password' && showPasswordToggle)) && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors duration-200 cursor-pointer">
              {type === 'password' && showPasswordToggle ? (
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="flex items-center justify-center focus:outline-none hover:text-brand-orange transition-colors"
                >
                  {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p className={`ml-1 text-[11px] font-semibold tracking-tight ${error ? 'text-red-500' : 'text-gray-400'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
