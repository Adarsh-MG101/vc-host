'use client';

import React from 'react';
import { Button } from './Button';
import { motion } from 'framer-motion';

interface ConfirmationCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isSingleAction?: boolean;
}

export function ConfirmationCard({
  title,
  description,
  icon,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'warning',
  isSingleAction = false,
}: ConfirmationCardProps) {
  const variantStyles = {
    danger: {
      border: 'border-rose-100',
      iconBg: 'bg-rose-50',
      iconText: 'text-rose-500',
      titleText: 'text-rose-900',
      descText: 'text-gray-500',
      btnBg: 'bg-rose-500 shadow-rose-500/20',
    },
    warning: {
      border: 'border-amber-100',
      iconBg: 'bg-amber-50',
      iconText: 'text-amber-500',
      titleText: 'text-amber-900',
      descText: 'text-gray-500',
      btnBg: 'bg-brand-navy shadow-brand-navy/20',
    },
    info: {
      border: 'border-blue-100',
      iconBg: 'bg-blue-50',
      iconText: 'text-blue-500',
      titleText: 'text-blue-900',
      descText: 'text-gray-500',
      btnBg: 'bg-brand-navy shadow-brand-navy/20',
    },
    success: {
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-50',
      iconText: 'text-emerald-500',
      titleText: 'text-emerald-900',
      descText: 'text-gray-500',
      btnBg: 'bg-emerald-500 shadow-emerald-500/20',
    },
  };

  const style = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border border-gray-100 bg-white p-8 text-center space-y-8`}
    >
      <div
        className={`w-20 h-20 ${style.iconBg} rounded-3xl flex items-center justify-center ${style.iconText} mx-auto transition-transform hover:scale-110 duration-500`}
      >
        {icon}
      </div>

      <div className="space-y-2">
        <h3 className={`text-lg font-bold tracking-tight text-gray-900`}>
          {title}
        </h3>
        <p
          className={`text-sm tracking-tight ${style.descText} max-w-[280px] mx-auto leading-relaxed`}
        >
          {description}
        </p>
      </div>

      <div className="flex gap-4 pt-2">
        {!isSingleAction && onCancel && (
          <Button
            variant="ghost"
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg h-14 uppercase font-black tracking-widest text-[10px] text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          onClick={onConfirm}
          isLoading={isLoading}
          className={`${
            isSingleAction ? 'w-full' : 'flex-1'
          } rounded-lg h-14 text-white shadow-xl uppercase font-black tracking-widest text-[10px] active:scale-95 transition-all ${
            style.btnBg
          }`}
        >
          {confirmLabel}
        </Button>
      </div>
    </motion.div>
  );
}
