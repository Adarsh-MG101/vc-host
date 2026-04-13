import { apiFetch } from '../utils/api';

export interface DashboardStats {
  totalOrgs?: number;
  totalTemplates: number;
  totalCertificates: number;
  monthlyCertificates?: number;
  lastGeneratedAt?: string | null;
  recentActivity?: any[];
  recentCertificates?: any[];
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    return apiFetch('/superadmin/dashboard/stats');
  },
  getOrgStats: async (): Promise<{ stats: DashboardStats, recentCertificates: any[] }> => {
    return apiFetch('/organization/dashboard/stats');
  }
};
