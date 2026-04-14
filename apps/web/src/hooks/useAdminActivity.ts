import { useState, useEffect, useCallback } from 'react';
import { superadminService, ActivityResponse, ActivityFilterOptions } from '../services/superadmin.service';

export function useAdminActivity(initialOptions: ActivityFilterOptions = { limit: 10, page: 1 }) {
  const [data, setData] = useState<ActivityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<ActivityFilterOptions>(initialOptions);

  const fetchActivity = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await superadminService.getActivities(options);
      setData(result);
    } catch (err: any) {
      console.error('Failed to fetch admin activity:', err);
      setError(err.message || 'Failed to fetch activity logs');
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const setPage = (page: number) => {
    setOptions(prev => ({ ...prev, page }));
  };

  const updateFilters = (newFilters: Partial<ActivityFilterOptions>) => {
    setOptions(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  return {
    activities: data?.activities || [],
    total: data?.total || 0,
    pages: data?.pages || 0,
    currentPage: data?.currentPage || 1,
    organizations: data?.organizations || [],
    isLoading,
    error,
    setPage,
    updateFilters,
    refresh: fetchActivity
  };
}
