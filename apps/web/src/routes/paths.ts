/**
 * Standardized route paths for the web application.
 * Using a central registry prevents hardcoding and ensures
 * consistent navigation across all components.
 */

export const ROUTES = {
  // Public / Auth
  HOME: '/',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Organization Portal
  ORGANIZATION: {
    ROOT: '/organization',
    DASHBOARD: '/organization/dashboard',
    TEMPLATES: '/organization/templates',
    CERTIFICATES: '/organization/certificates',
    ROLES: '/organization/roles',
    ACTIVITY: '/organization/activity',
    PROFILE: '/organization/profile',
  },

  // Superadmin Portal
  SUPERADMIN: {
    ROOT: '/superadmin',
    LOGIN: '/superadmin/super-login',
    DASHBOARD: '/superadmin/overview',
    ORGANIZATIONS: '/superadmin/organizations',
    ACTIVITY: '/superadmin/activity',
    SETTINGS: '/superadmin/settings',
  }
} as const;

export type RouteValue = typeof ROUTES[keyof typeof ROUTES];
