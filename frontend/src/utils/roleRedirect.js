import { ROLES } from './constants';

/** Where to send the user after login based on role */
export function getDashboardPath(role) {
  switch (role) {
    case ROLES.RESIDENT:
      return '/resident/dashboard';
    case ROLES.GUARD:
      return '/guard/dashboard';
    case ROLES.ADMIN:
      return '/admin/dashboard';
    default:
      return '/dashboard';
  }
}
