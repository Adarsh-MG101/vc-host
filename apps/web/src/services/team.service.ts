import { apiFetch } from '../utils/api';

export interface IRole {
  _id: string;
  name: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  orgRole: 'owner' | 'admin' | 'member';
  customRole?: string | { _id: string; name: string };
  status: 'active' | 'inactive';
  createdAt: string;
}

export const teamService = {
  // Roles
  getRoles: async (): Promise<IRole[]> => {
    return apiFetch('/organization/roles');
  },
  createRole: async (data: { name: string; permissions: string[] }): Promise<IRole> => {
    return apiFetch('/organization/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateRole: async (roleId: string, data: { name?: string; permissions?: string[] }): Promise<IRole> => {
    return apiFetch(`/organization/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteRole: async (roleId: string): Promise<void> => {
    return apiFetch(`/organization/roles/${roleId}`, {
      method: 'DELETE',
    });
  },

  // Users
  getUsers: async (): Promise<IUser[]> => {
    return apiFetch('/organization/users');
  },
  createUser: async (data: any): Promise<IUser> => {
    return apiFetch('/organization/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateUserRole: async (userId: string, orgRole: string): Promise<IUser> => {
    return apiFetch(`/organization/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ orgRole }),
    });
  },
  updateUserStatus: async (userId: string, status: 'active' | 'inactive'): Promise<IUser> => {
    return apiFetch(`/organization/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  deleteUser: async (userId: string): Promise<void> => {
    return apiFetch(`/organization/users/${userId}`, {
      method: 'DELETE',
    });
  },
};
