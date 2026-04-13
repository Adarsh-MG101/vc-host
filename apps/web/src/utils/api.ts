const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

export const handleAuthError = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('vc_user');
    localStorage.removeItem('vc_user');
    
    // Check if we are currently on a superadmin route or login page
    const isCurrentlySuper = window.location.pathname.includes('super');
    
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        // If they were a superadmin OR are currently on a superadmin page, keep them in superadmin context
        if (parsed.role === 'superadmin' || isCurrentlySuper) {
          window.location.href = '/superadmin/super-login';
        } else {
          window.location.href = '/';
        }
      } catch (e) {
        window.location.href = isCurrentlySuper ? '/superadmin/super-login' : '/';
      }
    } else {
      // No user data found, fallback to context-aware redirect
      window.location.href = isCurrentlySuper ? '/superadmin/super-login' : '/';
    }
  }
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const isFormData = options.body instanceof FormData;
  
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  } as Record<string, string>;

  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
    credentials: options.credentials || 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 && endpoint !== '/auth/login') {
      handleAuthError();
      return new Promise(() => {}); // Freeze execution while redirecting
    }
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};
