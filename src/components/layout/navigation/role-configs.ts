import {
  STANDARD_SECTION_ORDER,
  ROLE_SPECIFIC_SECTIONS,
  SHARED_NAVIGATION_ITEMS,
} from "./navigation-constants";

// Import actual icon components
import { NavigationIcons } from "@/components/icons/hero-icons";

// ADMIN Navigation Configuration
export const ADMIN_NAVIGATION = [
  {
    title: STANDARD_SECTION_ORDER.PRIMARY,
    defaultOpen: true,
    items: [
      {
        title: "Panel Administrativo",
        href: "/admin",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+H",
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.USER_MANAGEMENT,
    defaultOpen: true,
    items: [
      {
        title: "Usuarios",
        href: "/admin/usuarios",
        icon: NavigationIcons.Profile,
        shortcut: "Alt+U",
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.LIBRO_CLASES,
    defaultOpen: true,
    items: [
      {
        title: "Resumen General",
        href: "/admin/libro-clases",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+L",
      },
      {
        title: "Asistencia",
        href: "/admin/libro-clases/asistencia",
        icon: NavigationIcons.Calendar,
        shortcut: "Alt+A",
      },
      {
        title: "Calificaciones",
        href: "/admin/libro-clases/calificaciones",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+N",
      },
      {
        title: "Observaciones",
        href: "/admin/libro-clases/observaciones",
        icon: NavigationIcons.Documents,
        shortcut: "Alt+O",
      },
      {
        title: "Gestión de Estudiantes",
        href: "/admin/libro-clases/estudiantes",
        icon: NavigationIcons.Profile,
        shortcut: "Alt+G",
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.ACADEMIC,
    defaultOpen: false,
    items: [
      {
        title: "Planificaciones",
        href: "/profesor/planificaciones",
        icon: NavigationIcons.Planning,
        shortcut: "Alt+P",
      },
      {
        title: "Calendario Escolar",
        href: "/admin/calendario-escolar",
        icon: NavigationIcons.Calendar,
        shortcut: "Alt+C",
      },
      {
        title: "PME Mejoramiento",
        href: "/admin/pme",
        icon: NavigationIcons.Analytics,
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.COMMUNICATION,
    defaultOpen: false,
    items: [
      {
        title: "Reuniones",
        href: "/admin/reuniones",
        icon: NavigationIcons.Meeting,
        shortcut: "Alt+R",
      },
      {
        title: "Votaciones",
        href: "/admin/votaciones",
        icon: NavigationIcons.Vote,
        shortcut: "Alt+V",
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.RESOURCES,
    defaultOpen: false,
    items: [
      {
        title: "Documentos",
        href: "/admin/documentos",
        icon: NavigationIcons.Documents,
        shortcut: "Alt+D",
      },
      {
        title: "Horarios",
        href: "/admin/horarios",
        icon: NavigationIcons.Calendar,
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.SYSTEM,
    defaultOpen: false,
    items: [SHARED_NAVIGATION_ITEMS.SETTINGS],
  },
  {
    title: STANDARD_SECTION_ORDER.DEBUG,
    defaultOpen: false,
    items: [
      {
        title: "Enhanced Debug Panel",
        href: "/admin/debug-navigation",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+B",
      },
    ],
  },
];

// PROFESOR Navigation Configuration
export const PROFESOR_NAVIGATION = [
  {
    title: STANDARD_SECTION_ORDER.PRIMARY,
    defaultOpen: true,
    items: [
      {
        title: "Inicio",
        href: "/profesor",
        icon: NavigationIcons.Home,
        shortcut: "Alt+H",
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.LIBRO_CLASES,
    defaultOpen: true,
    items: [
      {
        title: "Resumen General",
        href: "/profesor/libro-clases",
        icon: NavigationIcons.Documents,
        shortcut: "Alt+L",
      },
      {
        title: "Asistencia",
        href: "/profesor/libro-clases/asistencia",
        icon: NavigationIcons.Calendar,
        shortcut: "Alt+A",
      },
      {
        title: "Contenidos y Planificación",
        href: "/profesor/libro-clases/contenidos",
        icon: NavigationIcons.Planning,
      },
      {
        title: "Calificaciones",
        href: "/profesor/libro-clases/calificaciones",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+N",
      },
      {
        title: "Observaciones",
        href: "/profesor/libro-clases/observaciones",
        icon: NavigationIcons.Documents,
        shortcut: "Alt+O",
      },
      {
        title: "Reuniones con Apoderados",
        href: "/profesor/libro-clases/reuniones",
        icon: NavigationIcons.Team,
      },
    ],
  },
  {
    title: ROLE_SPECIFIC_SECTIONS.PROFESOR.academic,
    defaultOpen: true,
    items: [
      {
        title: "Planificaciones",
        href: "/profesor/planificaciones",
        icon: NavigationIcons.Planning,
        shortcut: "Alt+P",
      },
      {
        title: "Calendario Escolar",
        href: "/profesor/calendario-escolar",
        icon: NavigationIcons.Calendar,
        shortcut: "Alt+C",
      },
      {
        title: "PME Mejoramiento",
        href: "/profesor/pme",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+M",
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.COMMUNICATION,
    defaultOpen: false,
    items: [
      {
        title: "Reuniones Apoderados",
        href: "/profesor/reuniones",
        icon: NavigationIcons.Team,
        shortcut: "Alt+R",
      },
    ],
  },
  {
    title: ROLE_SPECIFIC_SECTIONS.PROFESOR.info,
    defaultOpen: false,
    items: [
      {
        title: "Horarios",
        href: "/profesor/horarios",
        icon: NavigationIcons.Calendar,
        shortcut: "Alt+T",
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.PERSONAL,
    defaultOpen: false,
    items: [
      {
        title: "Perfil",
        href: "/profesor/perfil",
        icon: NavigationIcons.Profile,
        shortcut: "Alt+F",
      },
      SHARED_NAVIGATION_ITEMS.SETTINGS,
    ],
  },
];

// PARENT Navigation Configuration
export const PARENT_NAVIGATION = [
  {
    title: STANDARD_SECTION_ORDER.PRIMARY,
    defaultOpen: true,
    items: [
      {
        title: "Inicio",
        href: "/parent",
        icon: NavigationIcons.Home,
        shortcut: "Alt+H",
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.LIBRO_CLASES,
    defaultOpen: true,
    items: [
      {
        title: "Resumen General",
        href: "/parent/libro-clases",
        icon: NavigationIcons.Documents,
        shortcut: "Alt+L",
      },
      {
        title: "Asistencia",
        href: "/parent/libro-clases/asistencia",
        icon: NavigationIcons.Calendar,
        shortcut: "Alt+A",
      },
      {
        title: "Calificaciones",
        href: "/parent/libro-clases/calificaciones",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+N",
      },
      {
        title: "Observaciones",
        href: "/parent/libro-clases/observaciones",
        icon: NavigationIcons.Documents,
      },
      {
        title: "Reuniones",
        href: "/parent/libro-clases/reuniones",
        icon: NavigationIcons.Team,
      },
    ],
  },
  {
    title: ROLE_SPECIFIC_SECTIONS.PARENT.academic,
    defaultOpen: true,
    items: [
      {
        title: "Información de Estudiantes",
        href: "/parent/estudiantes",
        icon: NavigationIcons.Profile,
        shortcut: "Alt+E",
      },
      {
        title: "Calendario Escolar",
        href: "/parent/calendario-escolar",
        icon: NavigationIcons.Calendar,
        shortcut: "Alt+C",
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.COMMUNICATION,
    defaultOpen: false,
    items: [
      {
        title: "Mensajes",
        href: "/parent/comunicacion",
        icon: NavigationIcons.Notifications,
        shortcut: "Alt+M",
      },
      {
        title: "Reuniones",
        href: "/parent/reuniones",
        icon: NavigationIcons.Meeting,
        shortcut: "Alt+R",
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.RESOURCES,
    defaultOpen: false,
    items: [
      {
        title: ROLE_SPECIFIC_SECTIONS.PARENT.resources,
        href: "/parent/recursos",
        icon: NavigationIcons.Documents,
        shortcut: "Alt+D",
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.PERSONAL,
    defaultOpen: false,
    items: [SHARED_NAVIGATION_ITEMS.SETTINGS],
  },
];

// MASTER Navigation Configuration
export const MASTER_NAVIGATION = [
  {
    title: ROLE_SPECIFIC_SECTIONS.MASTER.primary,
    defaultOpen: true,
    items: [
      {
        title: "Master Dashboard",
        href: "/master",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+M",
      },
    ],
  },
  {
    title: ROLE_SPECIFIC_SECTIONS.MASTER.system,
    defaultOpen: true,
    items: [
      {
        title: "God Mode",
        href: "/master/god-mode",
        icon: NavigationIcons.ServerStack,
        shortcut: "Alt+G",
      },
      {
        title: "Global Oversight",
        href: "/master/global-oversight",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+O",
      },
      {
        title: "System Config",
        href: "/master/system-config",
        icon: NavigationIcons.Settings,
        shortcut: "Alt+C",
      },
      {
        title: "System Monitor",
        href: "/master/system-monitor",
        icon: NavigationIcons.ServerStack,
        shortcut: "Alt+S",
      },
      {
        title: "Audit Master",
        href: "/master/audit-master",
        icon: NavigationIcons.Documents,
        shortcut: "Alt+A",
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.USER_MANAGEMENT,
    defaultOpen: true,
    items: [
      {
        title: "Usuarios",
        href: "/admin/usuarios",
        icon: NavigationIcons.Profile,
        shortcut: "Alt+U",
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.LIBRO_CLASES,
    defaultOpen: true,
    items: [
      {
        title: "Resumen Libro de Clases",
        href: "/admin/libro-clases",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+L",
      },
      {
        title: "Asistencia",
        href: "/admin/libro-clases/asistencia",
        icon: NavigationIcons.Calendar,
        shortcut: "Alt+A",
      },
      {
        title: "Calificaciones",
        href: "/admin/libro-clases/calificaciones",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+N",
      },
      {
        title: "Observaciones",
        href: "/admin/libro-clases/observaciones",
        icon: NavigationIcons.Documents,
        shortcut: "Alt+O",
      },
      {
        title: "Gestión de Estudiantes",
        href: "/admin/libro-clases/estudiantes",
        icon: NavigationIcons.Profile,
        shortcut: "Alt+G",
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.ACADEMIC,
    defaultOpen: false,
    items: [
      {
        title: "Planificaciones",
        href: "/profesor/planificaciones",
        icon: NavigationIcons.Planning,
        shortcut: "Alt+P",
      },
      {
        title: "Calendario Escolar",
        href: "/admin/calendario-escolar",
        icon: NavigationIcons.Calendar,
        shortcut: "Alt+E",
      },
      {
        title: "PME Mejoramiento",
        href: "/admin/pme",
        icon: NavigationIcons.Analytics,
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.COMMUNICATION,
    defaultOpen: false,
    items: [
      {
        title: "Reuniones",
        href: "/admin/reuniones",
        icon: NavigationIcons.Meeting,
        shortcut: "Alt+R",
      },
      {
        title: "Votaciones",
        href: "/admin/votaciones",
        icon: NavigationIcons.Vote,
        shortcut: "Alt+V",
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.RESOURCES,
    defaultOpen: false,
    items: [
      {
        title: "Documentos",
        href: "/admin/documentos",
        icon: NavigationIcons.Documents,
        shortcut: "Alt+D",
      },
      {
        title: "Horarios",
        href: "/admin/horarios",
        icon: NavigationIcons.Calendar,
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.SYSTEM,
    defaultOpen: false,
    items: [SHARED_NAVIGATION_ITEMS.SETTINGS],
  },
  {
    title: STANDARD_SECTION_ORDER.DEBUG,
    defaultOpen: false,
    items: [
      {
        title: "Enhanced Debug Panel",
        href: "/admin/debug-navigation",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+B",
      },
    ],
  },
];

// Export all role configurations
export const NAVIGATION_CONFIGS = {
  ADMIN: ADMIN_NAVIGATION,
  PROFESOR: PROFESOR_NAVIGATION,
  PARENT: PARENT_NAVIGATION,
  MASTER: MASTER_NAVIGATION,
} as const;
