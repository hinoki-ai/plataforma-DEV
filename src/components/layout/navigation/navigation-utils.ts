import { NAVIGATION_CONFIGS } from "./role-configs";

// Keyboard shortcuts configuration - extracted for better organization
export const KEYBOARD_SHORTCUTS = {
  BASE: {
    Escape: "close-sidebar",
    "Alt+S": "/settings",
  },
  ADMIN: {
    "Alt+H": "/admin",
    "Alt+U": "/admin/usuarios",
    "Alt+P": "/profesor/planificaciones",
    "Alt+C": "/admin/calendario-escolar",
    "Alt+E": "/admin/equipo-multidisciplinario",
    "Alt+R": "/admin/reuniones",
    "Alt+V": "/admin/votaciones",
    "Alt+D": "/admin/documentos",
    "Alt+B": "/admin/debug-navigation",
  },
  PROFESOR: {
    "Alt+H": "/profesor",
    "Alt+P": "/profesor/planificaciones",
    "Alt+C": "/profesor/calendario-escolar",
    "Alt+R": "/profesor/reuniones",
    "Alt+T": "/profesor/horarios",
    "Alt+M": "/profesor/pme",
    "Alt+F": "/profesor/perfil",
  },
  PARENT: {
    "Alt+H": "/parent",
    "Alt+E": "/parent/estudiantes",
    "Alt+C": "/parent/calendario-escolar",
    "Alt+M": "/parent/comunicacion",
    "Alt+R": "/parent/reuniones",
    "Alt+D": "/parent/recursos",
  },
  MASTER: {
    "Alt+M": "/master",
    "Alt+G": "/master/god-mode",
    "Alt+O": "/master/global-oversight",
    "Alt+C": "/master/system-config",
    "Alt+S": "/master/system-monitor",
    "Alt+A": "/master/audit-master",
    "Alt+U": "/admin/usuarios",
    "Alt+P": "/profesor/planificaciones",
    "Alt+E": "/admin/calendario-escolar",
    "Alt+T": "/admin/equipo-multidisciplinario",
    "Alt+R": "/admin/reuniones",
    "Alt+V": "/admin/votaciones",
    "Alt+D": "/admin/documentos",
    "Alt+B": "/admin/debug-navigation",
  },
} as const;

// Get keyboard shortcuts for a specific role with context awareness for master users
export const getKeyboardShortcuts = (role?: string, pathname?: string) => {
  let roleShortcuts = role
    ? KEYBOARD_SHORTCUTS[role as keyof typeof KEYBOARD_SHORTCUTS] || {}
    : {};

  // If user is MASTER and navigating in specific role contexts, use that role's shortcuts
  if (role === "MASTER" && pathname) {
    if (pathname.startsWith("/admin/") || pathname === "/admin") {
      roleShortcuts = KEYBOARD_SHORTCUTS.ADMIN;
    } else if (pathname.startsWith("/profesor/") || pathname === "/profesor") {
      roleShortcuts = KEYBOARD_SHORTCUTS.PROFESOR;
    } else if (pathname.startsWith("/parent/") || pathname === "/parent") {
      roleShortcuts = KEYBOARD_SHORTCUTS.PARENT;
    }
  }

  return { ...KEYBOARD_SHORTCUTS.BASE, ...roleShortcuts };
};

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
export type KeyboardShortcutRole = keyof typeof KEYBOARD_SHORTCUTS;
