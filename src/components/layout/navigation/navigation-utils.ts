import { NAVIGATION_CONFIGS } from "./role-configs";

// Get navigation groups for a specific role with context awareness for master users
export const getNavigationGroupsForRole = (
  role?: string,
  pathname?: string,
) => {
  if (!role) return [];

  // If user is MASTER and navigating in specific role contexts, show that role's navigation
  if (role === "MASTER" && pathname) {
    if (pathname.startsWith("/admin/") || pathname === "/admin") {
      return NAVIGATION_CONFIGS.ADMIN;
    }
    if (pathname.startsWith("/profesor/") || pathname === "/profesor") {
      return NAVIGATION_CONFIGS.PROFESOR;
    }
    if (pathname.startsWith("/parent/") || pathname === "/parent") {
      return NAVIGATION_CONFIGS.PARENT;
    }
  }

  // Default behavior: return navigation for the user's actual role
  return NAVIGATION_CONFIGS[role as keyof typeof NAVIGATION_CONFIGS] || [];
};

// Type definitions for better TypeScript support
export type NavigationRole = keyof typeof NAVIGATION_CONFIGS;
