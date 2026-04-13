import { apiFetch } from '../utils/api';

export interface ITemplate {
  _id: string;
  id: string;
  organization: string;
  name: string;
  filePath: string;
  thumbnailPath?: string;
  placeholders: string[];
  enabled: boolean;
  createdBy: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export const templateService = {
  getTemplates: async (search?: string, status?: string): Promise<ITemplate[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'all') params.append('status', status);
    const queryString = params.toString();

    return apiFetch(`/organization/templates${queryString ? `?${queryString}` : ''}`);
  },

  uploadTemplate: async (file: File, name: string): Promise<ITemplate> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);

    return apiFetch('/organization/templates', {
      method: 'POST',
      body: formData,
    });
  },

  updateTemplate: async (id: string, updates: { name?: string; enabled?: boolean }): Promise<ITemplate> => {
    return apiFetch(`/organization/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteTemplate: async (id: string): Promise<void> => {
    return apiFetch(`/organization/templates/${id}`, {
      method: 'DELETE',
    });
  },
};
