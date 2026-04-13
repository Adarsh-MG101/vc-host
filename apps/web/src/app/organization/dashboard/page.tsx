'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  FileText, 
  Award, 
  Plus, 
  ArrowRight,
  ExternalLink,
  History,
  TrendingUp,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { authService } from '../../../services/auth.service';
import { dashboardService, DashboardStats } from '../../../services/dashboard.service';
import { StatCard } from '../../../components/ui/StatCard';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { ROUTES } from '../../../routes/paths';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<{ stats: DashboardStats, recentCertificates: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await dashboardService.getOrgStats();
      setData(response);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const user = mounted ? authService.getCurrentUser() : null;

  const statCards = [
    {
      label: 'Templates Created',
      value: data?.stats.totalTemplates || 0,
      icon: <FileText size={24} />,
      gradient: 'from-blue-600 to-indigo-600',
      description: 'Active certificate designs'
    },
    {
      label: 'Total Certificates',
      value: data?.stats.totalCertificates || 0,
      icon: <Award size={24} />,
      gradient: 'from-brand-orange to-orange-500',
      description: 'Lifetime issued documents'
    },
    {
      label: 'Issued This Month',
      value: data?.stats.monthlyCertificates || 0,
      icon: <TrendingUp size={24} />,
      gradient: 'from-emerald-600 to-teal-500',
      description: 'Generated in current cycle'
    },
    {
      label: 'Last Generated',
      value: data?.stats.lastGeneratedAt 
        ? new Date(data.stats.lastGeneratedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : 'Never',
      icon: <Clock size={24} />,
      gradient: 'from-purple-600 to-pink-500',
      description: 'Most recent issuance date'
    }
  ];

  return (
    <div className="flex flex-col space-y-10">
      {/* Premium Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-medium text-gray-900 tracking-tight flex items-center">
            <LayoutGrid size={28} className="mr-3 text-brand-orange" />
            Welcome back, <span className="font-bold ml-2">{user?.name || 'Owner'}</span>
          </h1>
          <p className="text-xs text-gray-400 font-medium ml-[40px]">
            Here is the current orchestration status of <span className="text-brand-navy font-bold">{user?.organization?.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={ROUTES.ORGANIZATION.TEMPLATES}>
            <Button variant="outline" leftIcon={<Plus size={16} />} className="rounded-xl font-black text-[10px] uppercase tracking-widest border-gray-100 shadow-sm">
              Upload Template
            </Button>
          </Link>
          <Link href={ROUTES.ORGANIZATION.CERTIFICATES}>
            <Button variant="primary" rightIcon={<ArrowRight size={16} />} className="rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-500/20">
              Generate Certificate
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Experimental Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Main Dashboard Interaction Area */}
      <div className="grid grid-cols-1 space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-brand-orange">
              <History size={16} />
            </div>
            <h2 className="text-2xl font-medium text-gray-900 tracking-tight">Recent Certificates</h2>
          </div>
          <Link href={ROUTES.ORGANIZATION.CERTIFICATES} className="text-[10px] font-black text-gray-400 hover:text-brand-orange uppercase tracking-[0.2em] transition-all">
            VIEW ALL RECORDS
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <Table 
            data={data?.recentCertificates.map(cert => ({ ...cert, id: cert._id })) || []}
            isLoading={isLoading}
            columns={[
              {
                header: 'UNIQUE ID',
                accessor: 'uniqueId',
                className: 'font-mono text-[11px] text-brand-navy font-black'
              },
              {
                header: 'TEMPLATE',
                accessor: (cert: any) => cert.template?.name || 'Unknown'
              },
              {
                header: 'ISSUED BY',
                accessor: (cert: any) => cert.createdBy?.name || 'System'
              },
              {
                header: 'DATE ISSUED',
                accessor: (cert: any) => new Date(cert.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }),
                className: 'text-gray-400 font-medium'
              },
              {
                header: 'VIEW',
                className: 'text-right',
                accessor: (cert: any) => (
                  <a 
                    href={cert.filePath} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 inline-flex items-center justify-center text-gray-300 hover:text-brand-orange hover:bg-orange-50 rounded-lg transition-all"
                  >
                    <ExternalLink size={16} />
                  </a>
                )
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
