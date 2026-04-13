import { apiFetch } from '../utils/api';

export const profileService = {
  updateProfile: async (name: string) => {
    return apiFetch('/organization/profile', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiFetch('/organization/profile/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};
