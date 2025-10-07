// Import actual icon components
import { NavigationIcons, ThemeIcons } from "@/components/icons/hero-icons";

// Navigation constants and shared items across all roles
export const SHARED_NAVIGATION_ITEMS = {
  SETTINGS: {
    title: "Configuración",
    href: "/settings",
    icon: NavigationIcons.Settings,
    shortcut: "Alt+S",
  },
  PROFILE: {
    title: "Perfil",
    href: "/profile",
    icon: NavigationIcons.Profile,
    shortcut: "Alt+P",
  },
  LOGOUT: {
    title: "Cerrar Sesión",
    href: "#logout",
    icon: ThemeIcons.Logout,
    action: "logout",
  },
} as const;

// Standardized section ordering and naming
export const STANDARD_SECTION_ORDER = {
  PRIMARY: "Principal",
  USER_MANAGEMENT: "Gestión de Usuarios",
  ACADEMIC: "Gestión Académica",
  COMMUNICATION: "Comunicación",
  RESOURCES: "Recursos",
  PERSONAL: "Personal",
  SYSTEM: "Sistema",
  DEBUG: "Debug & Development",
} as const;

// Role-specific section names
export const ROLE_SPECIFIC_SECTIONS = {
  MASTER: {
    primary: "🏛️ SUPREME MASTER",
    system: "Sistema Supremo",
  },
  PROFESOR: {
    academic: "Trabajo Académico",
    info: "Información",
  },
  PARENT: {
    academic: "Información Estudiantil",
    resources: "Recursos Educativos",
  },
} as const;
