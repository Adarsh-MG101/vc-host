import { apiFetch } from '../utils/api';
import { ActivityFilterOptions, ActivityResponse } from './superadmin.service';

export interface CreateOrgData {
  orgName: string;
  orgSlug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword?: string;
  logo?: string;
}

export const organizationService = {
  getOrganizations: async () => {
    return apiFetch('/superadmin/organizations');
  },

  createOrganization: async (data: CreateOrgData) => {
    return apiFetch('/superadmin/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateOrganization: async (id: string, data: Partial<CreateOrgData> & { status?: 'active' | 'inactive' }) => {
    return apiFetch(`/superadmin/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...(data.orgName && { name: data.orgName }),
        ...(data.orgSlug && { slug: data.orgSlug }),
        ...(data.status && { status: data.status })
      }),
    });
  },

  deleteOrganization: async (id: string) => {
    return apiFetch(`/superadmin/organizations/${id}`, {
      method: 'DELETE',
    });
  },
  getActivities: async (options: ActivityFilterOptions = {}): Promise<ActivityResponse> => {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.search) params.append('search', options.search);
    if (options.type) params.append('type', options.type);
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);

    const queryString = params.toString();
    return apiFetch(`/organization/activity?${queryString}`);
  },
};
