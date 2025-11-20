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
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.USER_MANAGEMENT,
    defaultOpen: false,
    items: [
      {
        title: "nav.users",
        href: "/admin/usuarios",
        icon: NavigationIcons.Profile,
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.LIBRO_CLASES,
    defaultOpen: false,
    items: [
      {
        title: "nav.dashboard",
        href: "/admin/libro-clases",
        icon: NavigationIcons.Analytics,
      },
      {
        title: "nav.calendar",
        href: "/admin/libro-clases/asistencia",
        icon: NavigationIcons.Calendar,
      },
      {
        title: "nav.calificaciones",
        href: "/admin/libro-clases/calificaciones",
        icon: NavigationIcons.Analytics,
        requiredFeature: "grading_system",
      },
      {
        title: "nav.documents",
        href: "/admin/libro-clases/observaciones",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.students",
        href: "/admin/libro-clases/estudiantes",
        icon: NavigationIcons.Profile,
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
        requiredFeature: "academic_planning",
      },
      {
        title: "nav.calendar",
        href: "/admin/calendario-escolar",
        icon: NavigationIcons.Calendar,
      },
      {
        title: "nav.schedule",
        href: "/admin/horarios",
        icon: NavigationIcons.Calendar,
      },
      {
        title: "nav.pme",
        href: "/admin/pme",
        icon: NavigationIcons.Analytics,
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.CONVIVENCIA,
    defaultOpen: false,
    items: [
      {
        title: "nav.protocolos_convivencia",
        href: "/admin/protocolos-convivencia",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.protocolos_convivencia.normas",
        href: "/admin/protocolos-convivencia/normas",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.protocolos_convivencia.disciplina",
        href: "/admin/protocolos-convivencia/disciplina",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.protocolos_convivencia.medidas",
        href: "/admin/protocolos-convivencia/medidas",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.protocolos_convivencia.reconocimientos",
        href: "/admin/protocolos-convivencia/reconocimientos",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.protocolos_convivencia.actas_apoderados",
        href: "/admin/protocolos-convivencia/actas-apoderados",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.protocolos_convivencia.actas_alumnos",
        href: "/admin/protocolos-convivencia/actas-alumnos",
        icon: NavigationIcons.Documents,
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
        requiredFeature: "parent_meetings",
      },
      {
        title: "nav.voting",
        href: "/admin/votaciones",
        icon: NavigationIcons.Vote,
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
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.SYSTEM,
    defaultOpen: false,
    items: [SHARED_NAVIGATION_ITEMS.DOCS, SHARED_NAVIGATION_ITEMS.SETTINGS],
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
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.LIBRO_CLASES,
    defaultOpen: false,
    items: [
      {
        title: "nav.dashboard",
        href: "/profesor/libro-clases",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.calendar",
        href: "/profesor/libro-clases/asistencia",
        icon: NavigationIcons.Calendar,
      },
      {
        title: "nav.class_content",
        href: "/profesor/libro-clases/contenidos",
        icon: NavigationIcons.Planning,
      },
      {
        title: "nav.calificaciones",
        href: "/profesor/libro-clases/calificaciones",
        icon: NavigationIcons.Analytics,
        requiredFeature: "grading_system",
      },
      {
        title: "nav.documents",
        href: "/profesor/libro-clases/observaciones",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.parent.meetings",
        href: "/profesor/libro-clases/reuniones",
        icon: NavigationIcons.Team,
        requiredFeature: "parent_meetings",
      },
    ],
  },
  {
    title: ROLE_SPECIFIC_SECTIONS.PROFESOR.academic,
    defaultOpen: false,
    items: [
      {
        title: "nav.planning",
        href: "/profesor/planificaciones",
        icon: NavigationIcons.Planning,
        requiredFeature: "academic_planning",
      },
      {
        title: "nav.calendar",
        href: "/profesor/calendario-escolar",
        icon: NavigationIcons.Calendar,
      },
      {
        title: "nav.schedule",
        href: "/profesor/horarios",
        icon: NavigationIcons.Calendar,
      },
      {
        title: "nav.pme",
        href: "/profesor/pme",
        icon: NavigationIcons.Analytics,
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.CONVIVENCIA,
    defaultOpen: false,
    items: [
      {
        title: "nav.protocolos_convivencia",
        href: "/profesor/protocolos-convivencia",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.protocolos_convivencia.normas",
        href: "/profesor/protocolos-convivencia/normas",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.protocolos_convivencia.disciplina",
        href: "/profesor/protocolos-convivencia/disciplina",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.protocolos_convivencia.medidas",
        href: "/profesor/protocolos-convivencia/medidas",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.protocolos_convivencia.reconocimientos",
        href: "/profesor/protocolos-convivencia/reconocimientos",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.protocolos_convivencia.actas_apoderados",
        href: "/profesor/protocolos-convivencia/actas-apoderados",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.protocolos_convivencia.actas_alumnos",
        href: "/profesor/protocolos-convivencia/actas-alumnos",
        icon: NavigationIcons.Documents,
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
        requiredFeature: "parent_meetings",
      },
      {
        title: "nav.voting",
        href: "/profesor/votaciones",
        icon: NavigationIcons.Vote,
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
      },
      SHARED_NAVIGATION_ITEMS.DOCS,
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
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.LIBRO_CLASES,
    defaultOpen: false,
    items: [
      {
        title: "nav.dashboard",
        href: "/parent/libro-clases",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.calendar",
        href: "/parent/libro-clases/asistencia",
        icon: NavigationIcons.Calendar,
      },
      {
        title: "nav.calificaciones",
        href: "/parent/libro-clases/calificaciones",
        icon: NavigationIcons.Analytics,
        requiredFeature: "grading_system",
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
    defaultOpen: false,
    items: [
      {
        title: "nav.students",
        href: "/parent/estudiantes",
        icon: NavigationIcons.Profile,
      },
      {
        title: "nav.calendar",
        href: "/parent/calendario-escolar",
        icon: NavigationIcons.Calendar,
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.CONVIVENCIA,
    defaultOpen: false,
    items: [
      {
        title: "nav.protocolos_convivencia",
        href: "/parent/protocolos-convivencia",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.protocolos_convivencia.normas",
        href: "/parent/protocolos-convivencia/normas",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.protocolos_convivencia.disciplina",
        href: "/parent/protocolos-convivencia/disciplina",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.protocolos_convivencia.medidas",
        href: "/parent/protocolos-convivencia/medidas",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.protocolos_convivencia.reconocimientos",
        href: "/parent/protocolos-convivencia/reconocimientos",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.protocolos_convivencia.actas_apoderados",
        href: "/parent/protocolos-convivencia/actas-apoderados",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.protocolos_convivencia.actas_alumnos",
        href: "/parent/protocolos-convivencia/actas-alumnos",
        icon: NavigationIcons.Documents,
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
      },
      {
        title: "nav.meetings",
        href: "/parent/reuniones",
        icon: NavigationIcons.Meeting,
      },
      {
        title: "nav.voting",
        href: "/parent/votaciones",
        icon: NavigationIcons.Vote,
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
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.PERSONAL,
    defaultOpen: false,
    items: [SHARED_NAVIGATION_ITEMS.DOCS, SHARED_NAVIGATION_ITEMS.SETTINGS],
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
      },
      {
        title: "nav.global_oversight",
        href: "/master/global-oversight",
        icon: NavigationIcons.Eye,
      },
      {
        title: "nav.system_stats",
        href: "/master/system-stats",
        icon: NavigationIcons.Chart,
      },
      {
        title: "nav.system_health",
        href: "/master/system-health",
        icon: NavigationIcons.ServerStack,
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.USER_MANAGEMENT,
    defaultOpen: false,
    items: [
      {
        title: "nav.institutions",
        href: "/master/institutions",
        icon: NavigationIcons.Home,
      },
      {
        title: "nav.users",
        href: "/master/user-management",
        icon: NavigationIcons.Profile,
      },
      {
        title: "nav.roles",
        href: "/master/role-management",
        icon: NavigationIcons.Team,
      },
      {
        title: "nav.user_analytics",
        href: "/master/user-analytics",
        icon: NavigationIcons.Analytics,
      },
    ],
  },
  {
    title: ROLE_SPECIFIC_SECTIONS.MASTER.system,
    defaultOpen: false,
    items: [
      {
        title: "nav.configuration",
        href: "/master/system-config",
        icon: NavigationIcons.Settings,
      },
      {
        title: "nav.security",
        href: "/master/security-center",
        icon: NavigationIcons.Shield,
      },
      {
        title: "nav.database",
        href: "/master/database-tools",
        icon: NavigationIcons.Archive,
      },
      {
        title: "nav.global_settings",
        href: "/master/global-settings",
        icon: NavigationIcons.Wrench,
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.DEBUG,
    defaultOpen: false,
    items: [
      {
        title: "nav.god_mode",
        href: "/master/god-mode",
        icon: NavigationIcons.Key,
      },
      {
        title: "nav.debug_console",
        href: "/master/debug-console",
        icon: NavigationIcons.Folder,
      },
      {
        title: "nav.audit_logs",
        href: "/master/audit-logs",
        icon: NavigationIcons.Bookmark,
      },
      {
        title: "nav.system_monitor",
        href: "/master/system-monitor",
        icon: NavigationIcons.ServerStack,
      },
      {
        title: "nav.performance",
        href: "/master/performance",
        icon: NavigationIcons.Analytics,
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.LIBRO_CLASES,
    defaultOpen: false,
    items: [
      {
        title: "nav.calendar",
        href: "/admin/libro-clases/asistencia",
        icon: NavigationIcons.Calendar,
      },
      {
        title: "nav.calificaciones",
        href: "/admin/libro-clases/calificaciones",
        icon: NavigationIcons.Academic,
        requiredFeature: "grading_system",
      },
      {
        title: "nav.documents",
        href: "/admin/libro-clases/observaciones",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.students",
        href: "/admin/libro-clases/estudiantes",
        icon: NavigationIcons.UserGroup,
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.CONVIVENCIA,
    defaultOpen: false,
    items: [
      {
        title: "nav.protocolos_convivencia",
        href: "/master/protocolos-convivencia",
        icon: NavigationIcons.Documents,
      },
      {
        title: "nav.protocolos_convivencia.normas",
        href: "/master/protocolos-convivencia/normas",
        icon: NavigationIcons.Shield,
      },
      {
        title: "nav.protocolos_convivencia.disciplina",
        href: "/master/protocolos-convivencia/disciplina",
        icon: NavigationIcons.Wrench,
      },
      {
        title: "nav.protocolos_convivencia.medidas",
        href: "/master/protocolos-convivencia/medidas",
        icon: NavigationIcons.Clock,
      },
      {
        title: "nav.protocolos_convivencia.reconocimientos",
        href: "/master/protocolos-convivencia/reconocimientos",
        icon: NavigationIcons.Star,
      },
      {
        title: "nav.protocolos_convivencia.actas_apoderados",
        href: "/master/protocolos-convivencia/actas-apoderados",
        icon: NavigationIcons.UserGroup, // Use UserGroup instead of Team
      },
      {
        title: "nav.protocolos_convivencia.actas_alumnos",
        href: "/master/protocolos-convivencia/actas-alumnos",
        icon: NavigationIcons.Building, // Use Building for school context
      },
    ],
  },
  {
    title: STANDARD_SECTION_ORDER.PERSONAL,
    defaultOpen: false,
    items: [SHARED_NAVIGATION_ITEMS.DOCS, SHARED_NAVIGATION_ITEMS.SETTINGS],
  },
];

// Export all role configurations
export const NAVIGATION_CONFIGS = {
  ADMIN: ADMIN_NAVIGATION,
  PROFESOR: PROFESOR_NAVIGATION,
  PARENT: PARENT_NAVIGATION,
  MASTER: MASTER_NAVIGATION,
} as const;
