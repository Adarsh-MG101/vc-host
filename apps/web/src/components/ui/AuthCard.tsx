'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Input } from './Input';
import { Button } from './Button';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  emailLabel?: string;
  passwordLabel?: string;
  buttonText: string;
  variant?: 'orange' | 'navy';
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  error?: string | null;
  footerText?: string;
  linkText?: string;
  onLinkClick?: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  emailLabel = 'Email',
  passwordLabel = 'Password',
  buttonText,
  variant = 'orange',
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  isLoading = false,
  error = null,
  footerText = '',
  linkText,
  onLinkClick,
}) => {
  const isNavy = variant === 'navy';
  const accentColorClass = isNavy ? 'text-brand-navy' : 'text-brand-orange';
  const buttonVariant = isNavy ? 'secondary' : 'primary';

  return (
    <div className="bg-white p-14 shadow-2xl rounded-md border border-gray-100 group transition-all duration-700 w-full relative overflow-hidden">
      <div className="mb-12 text-center">
        <h1 className={`text-3xl font-black ${accentColorClass} tracking-tighter mb-4 uppercase italic leading-none block`}>
          {title}
        </h1>
        <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[12px]">
          {subtitle}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center text-red-600 text-sm font-bold"
          >
            <AlertCircle size={18} className="mr-3 shrink-0" />
            {error}
          </motion.div>
        )}

        <div className="space-y-6">
          <Input
            label={emailLabel}
            type="email"
            placeholder="admin@vc.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail size={20} />}
            required
          />

          <Input
            label={passwordLabel}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock size={20} />}
            showPasswordToggle={true}
            required
          />
        </div>

        <Button
          type="submit"
          variant={buttonVariant}
          isLoading={isLoading}
          className="w-full h-14 text-[11px] font-black uppercase tracking-[0.25em] active:scale-[0.98]"
          rightIcon={<ArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform" />}
        >
          {buttonText}
        </Button>
      </form>

      <div className="mt-10 text-center space-y-4">
        {linkText && (
          <p 
            onClick={onLinkClick}
            className={`text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:underline opacity-60 hover:opacity-100 transition-all ${accentColorClass}`}
          >
            {linkText}
          </p>
        )}
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.1em] leading-relaxed">
          {footerText}
        </p>
      </div>
    </div>
  );
};
