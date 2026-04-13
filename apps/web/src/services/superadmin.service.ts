import { apiFetch } from '../utils/api';

export interface AdminActivity {
  _id: string;
  id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    status: string;
  };
  organization?: {
    _id: string;
    name: string;
    slug: string;
  };
  type: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ActivityFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  organization?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

export interface ActivityResponse {
  activities: AdminActivity[];
  total: number;
  pages: number;
  currentPage: number;
  organizations: Array<{ _id: string; name: string }>;
}

export const superadminService = {
  getActivities: async (options: ActivityFilterOptions = {}): Promise<ActivityResponse> => {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.search) params.append('search', options.search);
    if (options.organization) params.append('organization', options.organization);
    if (options.type) params.append('type', options.type);
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);

    const queryString = params.toString();
    return apiFetch(`/superadmin/activity?${queryString}`);
  }
};

