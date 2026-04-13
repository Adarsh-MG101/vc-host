import React from 'react';
import { motion } from 'framer-motion';
import { Activity as ActivityIcon } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
  description: string;
  isLoading?: boolean;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  gradient,
  description,
  isLoading = false,
  delay = 0,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group relative bg-white p-8 rounded-xl border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-blue-500/10 transition-all overflow-hidden"
    >
      {/* Background Decorative Gradient */}
      <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br ${gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity blur-3xl`} />
      
      <div className="relative z-10 flex items-start justify-between mb-8">
        <div className={`p-4 rounded-2xl shadow-xl shadow-gray-200/50 text-white bg-gradient-to-br ${gradient}`}>
          {icon}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1 italic">Real-Time</span>
          <div className="w-12 h-1 bg-gray-50 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, delay: delay + 0.5 }}
              className={`h-full bg-gradient-to-r ${gradient}`} 
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-1 relative z-10">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{label}</h3>
        <p className="text-4xl font-black text-brand-navy tracking-tighter">
          {isLoading ? (
            <span className="w-20 h-10 bg-gray-50 animate-pulse rounded-lg inline-block" />
          ) : (
            typeof value === 'number' ? value.toLocaleString() : value
          )}
        </p>
        <p className="text-[10px] font-medium text-gray-400 pt-2 flex items-center gap-1.5">
          <ActivityIcon size={12} className="text-gray-300" />
          {description}
        </p>
      </div>
    </motion.div>
  );
};
