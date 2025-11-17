import { NAVIGATION_CONFIGS } from "./role-configs";
import { ExtendedUserRole } from "@/lib/authorization";
import { hasMasterGodModeAccess } from "@/lib/role-utils";

// Get navigation groups for a specific role with context awareness for master users
export const getNavigationGroupsForRole = (
  role?: string,
  pathname?: string,
) => {
  if (!role) return [];

  const userRole = role as ExtendedUserRole;
  const isMaster = hasMasterGodModeAccess(userRole);

  // If user is MASTER and navigating in specific role contexts, show that role's navigation
  if (isMaster && pathname) {
    if (pathname.startsWith("/admin/") || pathname === "/admin") {
      return NAVIGATION_CONFIGS.ADMIN;
    }
    if (pathname.startsWith("/profesor/") || pathname === "/profesor") {
      return NAVIGATION_CONFIGS.PROFESOR;
    }
    if (pathname.startsWith("/parent/") || pathname === "/parent") {
      return NAVIGATION_CONFIGS.PARENT;
    }
    if (pathname.startsWith("/master/") || pathname === "/master") {
      return NAVIGATION_CONFIGS.MASTER;
    }
  }

  // Default behavior: return navigation for the user's actual role
  // Navigation configs are already role-separated, so no additional filtering needed
  return NAVIGATION_CONFIGS[userRole as keyof typeof NAVIGATION_CONFIGS] || [];
};

// Type definitions for better TypeScript support
export type NavigationRole = keyof typeof NAVIGATION_CONFIGS;
