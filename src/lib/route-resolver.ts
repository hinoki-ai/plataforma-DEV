/**
 * Smart Route Resolution Utility
 * Handles intelligent routing based on authentication state and user role
 * Part of Stage 3: Route & Logic Consolidation
 */

import { UserRole } from '@prisma/client';
import { getDefaultRedirectPath } from '@/lib/role-utils';

export type ExtendedUserRole = UserRole;

export interface RouteResolution {
  shouldRedirect: boolean;
  redirectPath: string;
  reason: 'unauthenticated' | 'role-based' | 'none';
}

/**
 * Resolve route based on requested path and user session
 */
export function resolveRoute(
  requestedPath: string,
  session: { user: { role: ExtendedUserRole } } | null
): RouteResolution {
  // Handle calendario-escolar route
  if (requestedPath === '/calendario-escolar') {
    if (!session) {
      return {
        shouldRedirect: true,
        redirectPath:
          '/login?callbackUrl=' + encodeURIComponent('/calendario-escolar'),
        reason: 'unauthenticated',
      };
    }

    // Route authenticated users to their appropriate calendar
    const rolePath = getRoleBasedCalendarPath(session.user.role);
    return {
      shouldRedirect: true,
      redirectPath: rolePath,
      reason: 'role-based',
    };
  }

  // Handle other routes that need intelligent resolution
  if (requestedPath.startsWith('/equipo-multidisciplinario')) {
    return resolveTeamRoute(requestedPath, session);
  }

  // No redirection needed
  return {
    shouldRedirect: false,
    redirectPath: '',
    reason: 'none',
  };
}

/**
 * Get the appropriate calendar path based on user role
 */
function getRoleBasedCalendarPath(role: ExtendedUserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/calendario-escolar';
    case 'PROFESOR':
      return '/profesor/calendario-escolar';
    case 'PARENT':
      return '/parent/calendario-escolar';
    default:
      return '/calendario-escolar';
  }
}

/**
 * Resolve team/equipo routes intelligently
 */
function resolveTeamRoute(
  requestedPath: string,
  session: { user: { role: ExtendedUserRole } } | null
): RouteResolution {
  // Public team route - always accessible
  if (requestedPath === '/public/equipo-multidisciplinario') {
    return {
      shouldRedirect: false,
      redirectPath: '',
      reason: 'none',
    };
  }

  // If accessing generic equipo route, determine best path
  if (requestedPath === '/equipo-multidisciplinario') {
    if (!session) {
      // Unauthenticated users go to public view
      return {
        shouldRedirect: true,
        redirectPath: '/public/equipo-multidisciplinario',
        reason: 'unauthenticated',
      };
    }

    // Authenticated users - route based on role
    if (session.user.role === 'ADMIN') {
      return {
        shouldRedirect: true,
        redirectPath: '/admin/equipo-multidisciplinario',
        reason: 'role-based',
      };
    } else {
      return {
        shouldRedirect: true,
        redirectPath: '/public/equipo-multidisciplinario',
        reason: 'role-based',
      };
    }
  }

  return {
    shouldRedirect: false,
    redirectPath: '',
    reason: 'none',
  };
}

/**
 * Get appropriate dashboard path based on role
 */
export function getRoleDashboardPath(role: ExtendedUserRole): string {
  return getDefaultRedirectPath(role);
}

/**
 * Check if a route requires authentication
 */
export function requiresAuth(path: string): boolean {
  const authRequiredPaths = ['/admin', '/profesor', '/parent', '/settings'];

  return authRequiredPaths.some(authPath => path.startsWith(authPath));
}

/**
 * Check if user has access to specific route
 */
export function hasRouteAccess(
  path: string,
  userRole: ExtendedUserRole
): boolean {
  if (path.startsWith('/admin')) {
    return userRole === 'ADMIN';
  }

  if (path.startsWith('/profesor')) {
    return userRole === 'ADMIN' || userRole === 'PROFESOR';
  }

  if (path.startsWith('/parent')) {
    return (
      userRole === 'ADMIN' || userRole === 'PROFESOR' || userRole === 'PARENT'
    );
  }

  // Public routes
  return true;
}
