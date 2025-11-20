"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useSession } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import { UserRole } from "@/lib/prisma-compat-types";
import { getRoleAccess } from "@/lib/role-utils";
import { hasPermission, Permission } from "@/lib/authorization";

interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  category: string;
  description?: string;
  permissions?: Permission[];
  roles?: UserRole[];
  children?: NavigationItem[];
  isActive?: boolean;
  isVisible?: boolean;
}

interface NavigationState {
  items: NavigationItem[];
  activeItem: NavigationItem | null;
  breadcrumbs: NavigationItem[];
  quickActions: NavigationItem[];
  searchResults: NavigationItem[];
  isSearching: boolean;
}

interface NavigationContextType {
  state: NavigationState;
  actions: {
    navigate: (href: string) => void;
    search: (query: string) => void;
    clearSearch: () => void;
    toggleItem: (id: string) => void;
    getItemsByCategory: (category: string) => NavigationItem[];
    getVisibleItems: () => NavigationItem[];
    hasAccess: (item: NavigationItem) => boolean;
  };
  user: {
    role: UserRole | null;
    hasPermission: (permission: Permission) => boolean;
    hasAnyRole: (roles: UserRole[]) => boolean;
    roleAccess: ReturnType<typeof getRoleAccess> | null;
  };
}

const NavigationContext = createContext<NavigationContextType | null>(null);

// Base navigation configuration
const baseNavigationItems: Record<UserRole, NavigationItem[]> = {
  MASTER: [
    {
      id: "master-dashboard",
      title: "Panel Maestro",
      href: "/admin",
      category: "principal",
      description: "Vista completa del sistema",
      permissions: ["admin:dashboard"],
    },
    {
      id: "role-switcher",
      title: "Cambiar Rol",
      href: "#role-switch",
      category: "herramientas",
      description: "Cambiar entre roles para testing",
      roles: ["MASTER"],
    },
    {
      id: "role-examples",
      title: "Ejemplos de Roles",
      href: "/admin/role-examples",
      category: "desarrollo",
      description: "Demostración de componentes basados en roles",
      roles: ["MASTER"],
    },
    {
      id: "system-settings",
      title: "Configuración del Sistema",
      href: "/settings",
      category: "sistema",
      description: "Configuración avanzada",
      permissions: ["admin:dashboard"],
    },
    {
      id: "user-management",
      title: "Gestión de Usuarios",
      href: "/admin/usuarios",
      category: "administracion",
      description: "Administrar usuarios del sistema",
      permissions: ["users:manage"],
    },
    {
      id: "audit-logs",
      title: "Registros de Auditoría",
      href: "/admin/audit",
      category: "seguridad",
      description: "Ver logs de auditoría",
      permissions: ["admin:dashboard"],
    },
  ],
  ADMIN: [
    {
      id: "admin-dashboard",
      title: "Panel Administrativo",
      href: "/admin",
      category: "principal",
      description: "Centro de control administrativo",
      permissions: ["admin:dashboard"],
    },
    {
      id: "user-management",
      title: "Usuarios",
      href: "/admin/usuarios",
      category: "administracion",
      description: "Gestionar usuarios",
      permissions: ["users:manage"],
    },
    {
      id: "school-calendar",
      title: "Calendario Escolar",
      href: "/admin/calendario-escolar",
      category: "academico",
      description: "Gestionar calendario académico",
      permissions: ["admin:dashboard"],
    },
    {
      id: "team",
      title: "Equipo Multidisciplinario",
      href: "/admin/equipo-multidisciplinario",
      category: "equipo",
      description: "Gestionar equipo profesional",
      permissions: ["admin:dashboard"],
    },
    {
      id: "meetings",
      title: "Reuniones",
      href: "/admin/reuniones",
      category: "comunicacion",
      description: "Gestionar reuniones",
      permissions: ["admin:dashboard"],
    },
    {
      id: "voting",
      title: "Votaciones",
      href: "/admin/votaciones",
      category: "gestion",
      description: "Sistema de votaciones",
      permissions: ["admin:dashboard"],
    },
    {
      id: "documents",
      title: "Documentos",
      href: "/admin/documentos",
      category: "recursos",
      description: "Gestionar documentos",
      permissions: ["admin:dashboard"],
    },
  ],
  PROFESOR: [
    {
      id: "profesor-dashboard",
      title: "Panel Docente",
      href: "/profesor",
      category: "principal",
      description: "Centro de control docente",
      permissions: ["profesor:dashboard"],
    },
    {
      id: "planning",
      title: "Planificaciones",
      href: "/profesor/planificaciones",
      category: "academico",
      description: "Planificar lecciones",
      permissions: ["planning:own"],
    },
    {
      id: "calendar",
      title: "Calendario",
      href: "/profesor/calendario-escolar",
      category: "academico",
      description: "Ver calendario académico",
      permissions: ["profesor:dashboard"],
    },
    {
      id: "pme",
      title: "PME",
      href: "/profesor/pme",
      category: "academico",
      description: "Proyecto Educativo",
      permissions: ["profesor:dashboard"],
    },
    {
      id: "meetings",
      title: "Reuniones",
      href: "/profesor/reuniones",
      category: "comunicacion",
      description: "Gestionar reuniones con padres",
      permissions: ["profesor:dashboard"],
    },
    {
      id: "schedule",
      title: "Horarios",
      href: "/profesor/horarios",
      category: "academico",
      description: "Ver horarios",
      permissions: ["profesor:dashboard"],
    },
    {
      id: "profile",
      title: "Perfil",
      href: "/profesor/perfil",
      category: "personal",
      description: "Gestionar perfil",
      permissions: ["profesor:dashboard"],
    },
  ],
  PARENT: [
    {
      id: "parent-dashboard",
      title: "🏠 Panel Familiar",
      href: "/parent",
      category: "principal",
      description: "Centro de control familiar",
      permissions: ["parent:dashboard"],
    },
    {
      id: "calendar",
      title: "📅 Calendario Escolar",
      href: "/parent/calendario-escolar",
      category: "calendario",
      description: "Eventos, reuniones y actividades",
      permissions: ["parent:dashboard"],
    },
    {
      id: "communication",
      title: "💬 Comunicación",
      href: "/parent/comunicacion",
      category: "comunicacion",
      description: "Mensajes y notificaciones",
      permissions: ["parent:dashboard"],
    },
    {
      id: "votaciones",
      title: "🗳️ Votaciones Escolares",
      href: "/parent/votaciones",
      category: "votaciones",
      description: "Participa en decisiones escolares",
      permissions: ["parent:dashboard"],
    },
    {
      id: "students",
      title: "👨‍🎓 Estudiantes",
      href: "/parent/estudiantes",
      category: "informacion",
      description: "Información de estudiantes",
      permissions: ["parent:dashboard"],
    },
    {
      id: "meetings",
      title: "📋 Reuniones",
      href: "/parent/reuniones",
      category: "comunicacion",
      description: "Agendar reuniones",
      permissions: ["parent:dashboard"],
    },
    {
      id: "resources",
      title: "📚 Recursos",
      href: "/parent/recursos",
      category: "recursos",
      description: "Materiales educativos",
      permissions: ["parent:dashboard"],
    },
  ],
  PUBLIC: [
    {
      id: "home",
      title: "Inicio",
      href: "/",
      category: "principal",
      description: "Página principal",
    },
    {
      id: "about",
      title: "CFMG Center of Fathers, Mothers and Guardians",
      href: "/cpma",
      category: "informacion",
      description: "Sobre el centro",
    },
    {
      id: "photos-videos",
      title: "Fotos y Videos",
      href: "/fotos-videos",
      category: "galeria",
      description: "Galería multimedia",
    },
    {
      id: "team",
      title: "Equipo Multidisciplinario",
      href: "/equipo-multidisciplinario",
      category: "equipo",
      description: "Conocer al equipo",
    },
  ],
};

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const userRole = session?.user?.role as UserRole;
  const roleAccess = userRole ? getRoleAccess(userRole) : null;

  // Generate navigation items based on role
  const navigationItems = useMemo(() => {
    if (!userRole) return [];

    const baseItems = baseNavigationItems[userRole] || [];
    const userPermissions = (permission: Permission) =>
      hasPermission(userRole, permission);
    const userHasRole = (role: UserRole) => userRole === role;

    return baseItems
      .map((item) => ({
        ...item,
        isVisible:
          !item.permissions ||
          (item.permissions.every(userPermissions) &&
            (!item.roles || item.roles.every(userHasRole))),
        isActive:
          pathname === item.href || pathname.startsWith(item.href + "/"),
      }))
      .filter((item) => item.isVisible);
  }, [userRole, pathname]);

  // Generate breadcrumbs
  const breadcrumbs = useMemo(() => {
    const items: NavigationItem[] = [];

    // Add home based on role
    if (userRole) {
      const homeItem = navigationItems.find(
        (item) => item.category === "principal",
      );
      if (homeItem) items.push(homeItem);
    }

    // Parse current path
    const pathSegments = pathname.split("/").filter(Boolean);
    let currentPath = "";

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Skip role prefix
      if (
        index === 0 &&
        ["admin", "profesor", "parent", "public"].includes(segment)
      ) {
        return;
      }

      // Find matching navigation item
      const matchingItem = navigationItems.find(
        (item) => item.href === currentPath || item.href === `/${segment}`,
      );

      if (matchingItem) {
        items.push({
          ...matchingItem,
          isActive: pathname === matchingItem.href,
        });
      }
    });

    return items;
  }, [pathname, navigationItems, userRole]);

  // Generate quick actions
  const quickActions = useMemo(() => {
    return navigationItems
      .filter(
        (item) => item.category === "principal" || item.category === "personal",
      )
      .slice(0, 3);
  }, [navigationItems]);

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return navigationItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query),
    );
  }, [navigationItems, searchQuery]);

  // Active item
  const activeItem = useMemo(() => {
    return navigationItems.find((item) => item.isActive) || null;
  }, [navigationItems]);

  const state: NavigationState = {
    items: navigationItems,
    activeItem,
    breadcrumbs,
    quickActions,
    searchResults,
    isSearching: searchQuery.length > 0,
  };

  const actions = {
    navigate: (href: string) => {
      router.push(href);
    },
    search: (query: string) => {
      setSearchQuery(query);
    },
    clearSearch: () => {
      setSearchQuery("");
    },
    toggleItem: (id: string) => {
      setExpandedItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    },
    getItemsByCategory: (category: string) => {
      return navigationItems.filter((item) => item.category === category);
    },
    getVisibleItems: () => {
      return navigationItems.filter((item) => item.isVisible);
    },
    hasAccess: (item: NavigationItem) => {
      if (!userRole) return false;

      const hasRequiredPermissions =
        !item.permissions ||
        item.permissions.every((permission) =>
          hasPermission(userRole, permission),
        );

      const hasRequiredRoles =
        !item.roles || item.roles.every((role) => role === userRole);

      return hasRequiredPermissions && hasRequiredRoles;
    },
  };

  const user = {
    role: userRole || null,
    hasPermission: (permission: Permission) =>
      hasPermission(userRole, permission),
    hasAnyRole: (roles: UserRole[]) =>
      userRole ? roles.includes(userRole) : false,
    roleAccess,
  };

  return (
    <NavigationContext.Provider value={{ state, actions, user }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}

export { baseNavigationItems };
export type { NavigationItem, NavigationState, NavigationContextType };
