import { apiFetch } from '../utils/api';

export const authService = {
  login: async (email: string, password: string) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.user) {
      localStorage.setItem('vc_user', JSON.stringify(data.user));
    }

    return data;
  },

  logout: async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('vc_user');
  },

  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('vc_user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('vc_user');
  },

  getMe: async () => {
    try {
      const data = await apiFetch('/auth/me');
      if (data.user) {
        localStorage.setItem('vc_user', JSON.stringify(data.user));
      }
      return data.user;
    } catch {
      localStorage.removeItem('vc_user');
      return null;
    }
  },
};
