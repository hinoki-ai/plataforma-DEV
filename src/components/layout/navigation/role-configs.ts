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
        title: "nav.admin.panel",
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
        title: "nav.users",
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
        title: "nav.dashboard",
        href: "/admin/libro-clases",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+L",
      },
      {
        title: "nav.calendar",
        href: "/admin/libro-clases/asistencia",
        icon: NavigationIcons.Calendar,
        shortcut: "Alt+A",
      },
      {
        title: "nav.planning",
        href: "/admin/libro-clases/calificaciones",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+N",
      },
      {
        title: "nav.documents",
        href: "/admin/libro-clases/observaciones",
        icon: NavigationIcons.Documents,
        shortcut: "Alt+O",
      },
      {
        title: "nav.students",
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
        title: "nav.planning",
        href: "/profesor/planificaciones",
        icon: NavigationIcons.Planning,
        shortcut: "Alt+P",
      },
      {
        title: "nav.calendar",
        href: "/admin/calendario-escolar",
        icon: NavigationIcons.Calendar,
        shortcut: "Alt+C",
      },
      {
        title: "nav.pme",
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
        title: "nav.meetings",
        href: "/admin/reuniones",
        icon: NavigationIcons.Meeting,
        shortcut: "Alt+R",
      },
      {
        title: "nav.voting",
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
        title: "nav.documents",
        href: "/admin/documentos",
        icon: NavigationIcons.Documents,
        shortcut: "Alt+D",
      },
      {
        title: "nav.schedule",
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
        title: "nav.main.categories.debug",
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
        title: "nav.home",
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
        title: "nav.dashboard",
        href: "/profesor/libro-clases",
        icon: NavigationIcons.Documents,
        shortcut: "Alt+L",
      },
      {
        title: "nav.calendar",
        href: "/profesor/libro-clases/asistencia",
        icon: NavigationIcons.Calendar,
        shortcut: "Alt+A",
      },
      {
        title: "nav.planning",
        href: "/profesor/libro-clases/contenidos",
        icon: NavigationIcons.Planning,
      },
      {
        title: "nav.planning",
        href: "/profesor/libro-clases/calificaciones",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+N",
      },
      {
        title: "nav.documents",
        href: "/profesor/libro-clases/observaciones",
        icon: NavigationIcons.Documents,
        shortcut: "Alt+O",
      },
      {
        title: "nav.parent.meetings",
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
        title: "nav.planning",
        href: "/profesor/planificaciones",
        icon: NavigationIcons.Planning,
        shortcut: "Alt+P",
      },
      {
        title: "nav.calendar",
        href: "/profesor/calendario-escolar",
        icon: NavigationIcons.Calendar,
        shortcut: "Alt+C",
      },
      {
        title: "nav.pme",
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
        title: "nav.parent.meetings",
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
        title: "nav.schedule",
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
        title: "nav.profile",
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
        title: "nav.home",
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
        title: "nav.dashboard",
        href: "/parent/libro-clases",
        icon: NavigationIcons.Documents,
        shortcut: "Alt+L",
      },
      {
        title: "nav.calendar",
        href: "/parent/libro-clases/asistencia",
        icon: NavigationIcons.Calendar,
        shortcut: "Alt+A",
      },
      {
        title: "nav.planning",
        href: "/parent/libro-clases/calificaciones",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+N",
      },
      {
        title: "nav.documents",
        href: "/parent/libro-clases/observaciones",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.meetings",
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
        title: "nav.students",
        href: "/parent/estudiantes",
        icon: NavigationIcons.Profile,
        shortcut: "Alt+E",
      },
      {
        title: "nav.calendar",
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
        title: "nav.communication",
        href: "/parent/comunicacion",
        icon: NavigationIcons.Notifications,
        shortcut: "Alt+M",
      },
      {
        title: "nav.meetings",
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
        title: "nav.resources",
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
        title: "nav.dashboard",
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
        title: "nav.main.categories.debug",
        href: "/master/god-mode",
        icon: NavigationIcons.ServerStack,
        shortcut: "Alt+G",
      },
      {
        title: "nav.main.categories.debug",
        href: "/master/global-oversight",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+O",
      },
      {
        title: "nav.configuration",
        href: "/master/system-config",
        icon: NavigationIcons.Settings,
        shortcut: "Alt+C",
      },
      {
        title: "nav.main.categories.debug",
        href: "/master/system-monitor",
        icon: NavigationIcons.ServerStack,
        shortcut: "Alt+S",
      },
      {
        title: "nav.main.categories.debug",
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
        title: "nav.users",
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
        title: "nav.dashboard",
        href: "/admin/libro-clases",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+L",
      },
      {
        title: "nav.calendar",
        href: "/admin/libro-clases/asistencia",
        icon: NavigationIcons.Calendar,
        shortcut: "Alt+A",
      },
      {
        title: "nav.planning",
        href: "/admin/libro-clases/calificaciones",
        icon: NavigationIcons.Analytics,
        shortcut: "Alt+N",
      },
      {
        title: "nav.documents",
        href: "/admin/libro-clases/observaciones",
        icon: NavigationIcons.Documents,
        shortcut: "Alt+O",
      },
      {
        title: "nav.students",
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
        title: "nav.planning",
        href: "/profesor/planificaciones",
        icon: NavigationIcons.Planning,
        shortcut: "Alt+P",
      },
      {
        title: "nav.calendar",
        href: "/admin/calendario-escolar",
        icon: NavigationIcons.Calendar,
        shortcut: "Alt+E",
      },
      {
        title: "nav.pme",
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
        title: "nav.meetings",
        href: "/admin/reuniones",
        icon: NavigationIcons.Meeting,
        shortcut: "Alt+R",
      },
      {
        title: "nav.voting",
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
        title: "nav.documents",
        href: "/admin/documentos",
        icon: NavigationIcons.Documents,
        shortcut: "Alt+D",
      },
      {
        title: "nav.schedule",
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
        title: "nav.main.categories.debug",
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
