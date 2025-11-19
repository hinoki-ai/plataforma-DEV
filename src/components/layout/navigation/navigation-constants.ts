// Import actual icon components
import { NavigationIcons, ThemeIcons } from "@/components/icons/hero-icons";

// Navigation constants and shared items across all roles
export const SHARED_NAVIGATION_ITEMS = {
  DOCS: {
    title: "nav.docs",
    href: "/docs",
    icon: NavigationIcons.Documents,
  },
  SETTINGS: {
    title: "nav.configuration",
    href: "/settings",
    icon: NavigationIcons.Settings,
  },
  PROFILE: {
    title: "nav.profile",
    href: "/profile",
    icon: NavigationIcons.Profile,
  },
  LOGOUT: {
    title: "nav.logout",
    href: "#logout",
    icon: ThemeIcons.Logout,
    action: "logout",
  },
} as const;

// Standardized section ordering and naming - now using translation keys
export const STANDARD_SECTION_ORDER = {
  PRIMARY: "nav.main.categories.principal",
  USER_MANAGEMENT: "nav.main.categories.management",
  ACADEMIC: "nav.main.categories.academic",
  LIBRO_CLASES: "nav.main.categories.libro_clases",
  CONVIVENCIA: "nav.main.categories.convivencia",
  COMMUNICATION: "nav.main.categories.communication",
  RESOURCES: "nav.main.categories.resources",
  PERSONAL: "nav.main.categories.personal",
  SYSTEM: "nav.main.categories.system",
  DEBUG: "nav.main.categories.debug",
} as const;

// Role-specific section names - now using translation keys
export const ROLE_SPECIFIC_SECTIONS = {
  MASTER: {
    primary: "nav.main.categories.principal",
    system: "nav.main.categories.system",
  },
  PROFESOR: {
    academic: "nav.main.categories.academic",
    info: "nav.main.categories.information",
  },
  PARENT: {
    academic: "nav.main.categories.academic",
    resources: "nav.main.categories.resources",
  },
} as const;
