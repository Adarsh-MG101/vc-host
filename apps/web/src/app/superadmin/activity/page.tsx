'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Download, 
  Search, 
  History,
  Globe,
  Monitor,
  Calendar as CalendarIcon,
  LayoutGrid
} from 'lucide-react';
import { motion } from 'framer-motion';
import { superadminService, AdminActivity, ActivityFilterOptions } from '../../../services/superadmin.service';
import { Table } from '../../../components/ui/Table';
import { Select } from '../../../components/ui/Select';
import { CustomDatePicker } from '../../../components/ui/CustomDatePicker';

const ACTIVITY_TYPES = [
  { label: 'All Activities', value: 'all' },
  { label: 'User Login', value: 'USER_LOGIN' },
  { label: 'User Logout', value: 'USER_LOGOUT' },
  { label: 'Template Uploaded', value: 'TEMPLATE_UPLOADED' },
  { label: 'Template Deleted', value: 'TEMPLATE_DELETED' },
  { label: 'Certificate Generated', value: 'CERTIFICATE_GENERATED' },
  { label: 'Bulk Batch Generation', value: 'CERTIFICATES_GENERATED_BULK' },
  { label: 'Profile Updated', value: 'PROFILE_UPDATED' },
  { label: 'Password Changed', value: 'PASSWORD_CHANGED' }
];

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [organizations, setOrganizations] = useState<Array<{ _id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchActivity = useCallback(async () => {
    setIsLoading(true);
    try {
      const options: ActivityFilterOptions = {
        page: currentPage,
        limit: rowsPerPage,
        search: search || undefined,
        organization: selectedOrg !== 'all' ? selectedOrg : undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const response = await superadminService.getActivities(options);
      const mappedActivities = response.activities.map(act => ({
        ...act,
        id: act._id
      }));
      setActivities(mappedActivities);
      setTotal(response.total);
      
      if (response.organizations) {
        setOrganizations(response.organizations);
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, selectedOrg, selectedType, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchActivity();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchActivity]);

  const handleExportCSV = () => {
    if (activities.length === 0) return;

    const headers = ['Timestamp', 'User', 'Email', 'Organization', 'Action', 'IP Address', 'Browser'];
    const rows = activities.map(act => [
      new Date(act.createdAt).toLocaleString(),
      act.userId?.name || 'Unknown',
      act.userId?.email || 'N/A',
      act.organization?.name || 'System / Platform',
      act.type,
      act.ipAddress || 'Internal',
      act.userAgent || 'Unknown'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `activity_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadgeColor = (type: string) => {
    if (type.includes('LOGIN')) return 'bg-green-50 text-green-600 border-green-100';
    if (type.includes('DELETE')) return 'bg-red-50 text-red-600 border-red-100';
    if (type.includes('TEMPLATE')) return 'bg-purple-50 text-purple-600 border-purple-100';
    if (type.includes('CERTIFICATE')) return 'bg-blue-50 text-blue-600 border-blue-100';
    return 'bg-gray-50 text-gray-500 border-gray-100';
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Page Title & Breadcrumb */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-medium text-gray-900 tracking-tight flex items-center">
            <LayoutGrid size={28} className="mr-3 text-brand-navy" />
            Admin Activity
          </h1>
          <p className="text-xs text-gray-400 font-medium ml-[40px]">Global audit trail across all organizations</p>
        </div>
        
        <button 
          onClick={handleExportCSV}
          className="flex items-center space-x-2 bg-white border border-gray-100 text-gray-700 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98]"
        >
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </motion.div>

      {/* Advanced Filter Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4"
      >
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-navy transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by user name or email..."
              className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-brand-navy outline-none transition-all text-sm font-medium text-gray-700 placeholder:text-gray-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="w-[200px]">
            <Select 
              value={selectedOrg}
              onChange={(val: string | number) => setSelectedOrg(val as string)}
              options={[
                { label: 'All Organizations', value: 'all' },
                ...organizations.map(org => ({ label: org.name, value: org._id }))
              ]}
              placeholder="All Organizations"
            />
          </div>

          <div className="w-[200px]">
            <Select 
              value={selectedType}
              onChange={(val: string | number) => setSelectedType(val as string)}
              options={ACTIVITY_TYPES}
              placeholder="Activity Type"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4 pt-2 border-t border-gray-50 mt-2">
          <div className="flex items-center space-x-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mr-4">
            <CalendarIcon size={14} />
            <span>Date Range Filter</span>
          </div>
          <CustomDatePicker 
            value={startDate} 
            onChange={setStartDate} 
            placeholder="From Date"
          />
          <span className="text-gray-200 font-medium">to</span>
          <CustomDatePicker 
            value={endDate} 
            onChange={setEndDate} 
            placeholder="To Date"
          />
          
          {(startDate || endDate || selectedOrg !== 'all' || selectedType !== 'all' || search) && (
            <button 
              onClick={() => {
                setSearch('');
                setSelectedOrg('all');
                setSelectedType('all');
                setStartDate('');
                setEndDate('');
              }}
              className="px-4 py-2 text-[10px] font-black text-red-500 hover:bg-red-50 rounded-lg uppercase tracking-widest transition-colors ml-auto"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </motion.div>

      {/* Activity Table */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <Table 
          data={activities}
          isLoading={isLoading}
          columns={[
            {
              header: 'USER IDENTITY',
              accessor: (act: AdminActivity) => (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-brand-navy font-black text-[10px] uppercase overflow-hidden shrink-0">
                    {act.userId?.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 tracking-tight">{act.userId?.name || 'Deleted User'}</span>
                    <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">{act.userId?.email || 'N/A'}</span>
                  </div>
                </div>
              )
            },
            {
              header: 'ORGANIZATION',
              accessor: (act: AdminActivity) => (
                <div className="flex items-center space-x-2">
                  <Building2 size={14} className="text-gray-300" />
                  <span className="text-sm font-bold text-gray-700">{act.organization?.name || 'Platform'}</span>
                </div>
              )
            },
            {
              header: 'ACTION PERFORMED',
              accessor: (act: AdminActivity) => (
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getActionBadgeColor(act.type)}`}>
                  {act.type.replace(/_/g, ' ')}
                </span>
              )
            },
            {
              header: 'DEVICE / IP',
              accessor: (act: AdminActivity) => (
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Globe size={12} className="text-gray-300" />
                    <span className="text-[11px] font-medium">{act.ipAddress || '127.0.0.1'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Monitor size={12} className="text-gray-200" />
                    <span className="text-[9px] font-medium truncate max-w-[150px]">{act.userAgent || 'Unknown Browser'}</span>
                  </div>
                </div>
              )
            },
            {
              header: 'TIME LOG',
              accessor: (act: AdminActivity) => (
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-700">
                    {new Date(act.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                    {new Date(act.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              )
            }
          ]}
        />
        
        {/* Pagination Controls */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Showing <span className="text-brand-navy">{(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, total)}</span> of {total} audit logs
          </p>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1 || isLoading}
              className="p-1.5 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-400"
              title="Previous Page"
            >
              <History size={14} className="rotate-180" />
            </button>
            
            <div className="flex items-center px-3 h-8 bg-gray-50/50 rounded-lg border border-gray-100">
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
                Page {currentPage}
              </span>
            </div>

            <button 
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={activities.length < rowsPerPage || isLoading}
              className="p-1.5 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-400"
              title="Next Page"
            >
              <History size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
