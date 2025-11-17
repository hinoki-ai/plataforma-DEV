/**
 * Smart Route Resolution Utility
 * Handles intelligent routing based on authentication state and user role
 * Part of Stage 3: Route & Logic Consolidation
 */

import { UserRole } from "@/lib/prisma-compat-types";
import { getDefaultRedirectPath } from "@/lib/role-utils";

export type ExtendedUserRole = UserRole;

export interface RouteResolution {
  shouldRedirect: boolean;
  redirectPath: string;
  reason: "unauthenticated" | "role-based" | "none";
}

/**
 * Resolve route based on requested path and user session
 */
export function resolveRoute(
  requestedPath: string,
  session: { user: { role: ExtendedUserRole } } | null,
): RouteResolution {
  // No special route handling needed - all routes are institution-specific
  // and handled by middleware
  return {
    shouldRedirect: false,
    redirectPath: "",
    reason: "none",
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
  const authRequiredPaths = ["/admin", "/profesor", "/parent", "/settings"];

  return authRequiredPaths.some((authPath) => path.startsWith(authPath));
}

/**
 * Check if user has access to specific route
 * MASTER has access to all routes - Supreme Authority
 */
export function hasRouteAccess(
  path: string,
  userRole: ExtendedUserRole,
): boolean {
  // MASTER has access to everything
  if (userRole === "MASTER") {
    return true;
  }

  // Master-only routes
  if (path.startsWith("/master")) {
    return false;
  }

  // Admin routes
  if (path.startsWith("/admin")) {
    return userRole === "ADMIN";
  }

  // Profesor routes
  if (path.startsWith("/profesor")) {
    return userRole === "ADMIN" || userRole === "PROFESOR";
  }

  // Parent routes
  if (path.startsWith("/parent")) {
    return (
      userRole === "ADMIN" || userRole === "PROFESOR" || userRole === "PARENT"
    );
  }

  // Public routes
  return true;
}
