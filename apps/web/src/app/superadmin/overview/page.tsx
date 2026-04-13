'use client';

import { 
  Building2, 
  FileText, 
  Award, 
  Activity as ActivityIcon,
  LayoutGrid
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Table } from '../../../components/ui/Table';
import { StatCard } from '../../../components/ui/StatCard';

import { useDashboard } from '../../../hooks/useDashboard';

export default function OverviewPage() {
  const { stats, isLoading } = useDashboard();

  const statCards = [
    { 
      label: 'Total Organizations', 
      value: stats?.totalOrgs || 0, 
      icon: <Building2 size={24} />, 
      color: 'bg-blue-500',
      gradient: 'from-blue-600 to-indigo-600',
      description: 'Onboarded institutions'
    },
    { 
      label: 'Global Templates', 
      value: stats?.totalTemplates || 0, 
      icon: <FileText size={24} />, 
      color: 'bg-amber-500',
      gradient: 'from-amber-500 to-orange-600',
      description: 'Certificate designs'
    },
    { 
      label: 'Certificates Issued', 
      value: stats?.totalCertificates || 0, 
      icon: <Award size={24} />, 
      color: 'bg-green-500',
      gradient: 'from-green-500 to-emerald-600',
      description: 'Validated credentials'
    },
  ];

  const activityColumns = [
    { 
      header: 'ORGANIZATION', 
      accessor: (a: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-brand-navy border border-gray-100 uppercase font-black text-[10px]">
            {a.organization?.name?.charAt(0) || 'S'}
          </div>
          <p className="font-bold text-gray-900 tracking-tight">{a.organization?.name || 'System'}</p>
        </div>
      )
    },
    { 
      header: 'ACTION', 
      accessor: (a: any) => (
        <div className="flex flex-col">
          <p className="text-[11px] font-black text-brand-navy uppercase tracking-widest">{a.action}</p>
          <p className="text-[10px] text-gray-400 font-medium truncate max-w-[200px]">{a.details}</p>
        </div>
      )
    },
    { 
      header: 'USER', 
      accessor: (a: any) => (
        <div className="flex flex-col">
          <p className="text-[11px] font-bold text-gray-700">{a.user?.name || 'Unknown'}</p>
          <p className="text-[10px] text-gray-400">{a.user?.email || '-'}</p>
        </div>
      )
    },
    { 
      header: 'TIME', 
      accessor: (a: any) => (
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
          {new Date(a.createdAt).toLocaleDateString(undefined, { 
            month: 'short', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      )
    }
  ];

  return (
    <div className="flex flex-col space-y-6">
      {/* Premium Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-medium text-gray-900 tracking-tight flex items-center">
            <LayoutGrid size={28} className="mr-3 text-brand-navy" />
            Platform Overview
          </h1>
          <p className="text-xs text-gray-400 font-medium ml-[40px]">
            Real-time global orchestration and system health.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {statCards.map((stat, i) => (
          <StatCard
            key={i}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            gradient={stat.gradient}
            description={stat.description}
            isLoading={isLoading}
            delay={i * 0.1}
          />
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-brand-navy">
              <ActivityIcon size={16} />
            </div>
            <h2 className="text-2xl font-medium text-gray-900 tracking-tight">Global Activity</h2>
          </div>
          <button className="text-[10px] font-black text-gray-400 hover:text-brand-navy uppercase tracking-[0.2em] transition-all">
            VIEW ALL LOGS
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <Table 
            data={stats?.recentActivity || []} 
            columns={activityColumns} 
            isLoading={isLoading} 
          />
          {(!isLoading && (!stats?.recentActivity || stats.recentActivity.length === 0)) && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <ActivityIcon size={48} className="text-gray-200" />
              <p className="text-xs font-black text-gray-300 uppercase tracking-widest italic">No platform activity recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
