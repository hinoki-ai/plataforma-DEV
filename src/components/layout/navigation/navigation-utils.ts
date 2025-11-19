import { NAVIGATION_CONFIGS } from "./role-configs";
import { ExtendedUserRole } from "@/lib/authorization";
import { hasMasterGodModeAccess } from "@/lib/role-utils";
import {
  EducationalInstitutionType,
  shouldShowFeature,
  EducationalConfig,
} from "@/lib/educational-system";

// Get navigation groups for a specific role with context awareness for master users
export const getNavigationGroupsForRole = (
  role?: string,
  pathname?: string,
  institutionType?: EducationalInstitutionType,
  config?: EducationalConfig,
) => {
  if (!role) return [];

  const userRole = role as ExtendedUserRole;
  const isMaster = hasMasterGodModeAccess(userRole);

  type NavigationGroup = (typeof NAVIGATION_CONFIGS.ADMIN)[number];
  let rawGroups: NavigationGroup[] = [];

  // If user is MASTER and navigating in specific role contexts, show that role's navigation
  if (isMaster && pathname) {
    if (pathname.startsWith("/admin/") || pathname === "/admin") {
      rawGroups = [...NAVIGATION_CONFIGS.ADMIN];
    } else if (pathname.startsWith("/profesor/") || pathname === "/profesor") {
      rawGroups = [...NAVIGATION_CONFIGS.PROFESOR];
    } else if (pathname.startsWith("/parent/") || pathname === "/parent") {
      rawGroups = [...NAVIGATION_CONFIGS.PARENT];
    } else if (pathname.startsWith("/master/") || pathname === "/master") {
      rawGroups = [...NAVIGATION_CONFIGS.MASTER];
    } else {
      const roleNav =
        NAVIGATION_CONFIGS[userRole as keyof typeof NAVIGATION_CONFIGS];
      rawGroups = roleNav ? [...roleNav] : [];
    }
  } else {
    // Default behavior: return navigation for the user's actual role
    const roleNav =
      NAVIGATION_CONFIGS[userRole as keyof typeof NAVIGATION_CONFIGS];
    rawGroups = roleNav ? [...roleNav] : [];
  }

  // If no institution type context, return unfiltered (or filtered by defaults if we assumed type)
  if (!institutionType) return rawGroups;

  // Filter items based on features
  return rawGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item: any) => {
        if (item.requiredFeature) {
          return shouldShowFeature(
            item.requiredFeature,
            institutionType,
            config,
          );
        }
        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);
};

// Type definitions for better TypeScript support
export type NavigationRole = keyof typeof NAVIGATION_CONFIGS;
