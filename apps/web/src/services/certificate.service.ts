import { apiFetch } from '../utils/api';

export interface IDocument {
  _id: string;
  uniqueId: string;
  template: { _id: string; name: string };
  data: Record<string, any>;
  filePath: string;
  verificationUrl: string;
  createdBy: { _id: string; name: string };
  createdAt: string;
}

export interface CertificateResponse {
  documents: IDocument[];
  total: number;
  pages: number;
  currentPage: number;
}

export const certificateService = {
  getCertificates: async (params: { search?: string; templateId?: string; startDate?: string; endDate?: string; page?: number; limit?: number } = {}): Promise<CertificateResponse> => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.templateId) searchParams.append('templateId', params.templateId);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    
    return apiFetch(`/organization/certificates?${searchParams.toString()}`);
  },

  generateSingle: async (payload: { templateId: string; data: Record<string, any>; sendEmail?: boolean; emailSettings?: any }) => {
    return apiFetch('/organization/certificates/single', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  generateBulk: async (payload: any) => {
    return apiFetch('/organization/certificates/bulk', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getCertificateFileUrl: (id: string, mode: 'view' | 'download' = 'view') => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
    return `${API_URL}/organization/certificates/${id}/file?mode=${mode}`;
  },

  deleteCertificate: async (id: string) => {
    return apiFetch(`/organization/certificates/${id}`, {
      method: 'DELETE',
    });
  },

  sendCertificateEmail: async (id: string, emailSettings: { recipientEmail: string; subject: string; message: string }) => {
    return apiFetch(`/organization/certificates/${id}/email`, {
      method: 'POST',
      body: JSON.stringify(emailSettings),
    });
  },

  sendBulkEmail: async (ids: string[], emailSettings: { recipientEmail: string; subject: string; message: string }) => {
    return apiFetch('/organization/certificates/bulk-email', {
      method: 'POST',
      body: JSON.stringify({ ids, ...emailSettings }),
    });
  },

  getBulkZipUrl: (ids: string[]) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api'}/organization/certificates/bulk-zip-download?ids=${ids.join(',')}&token=${token}`;
  }
};
