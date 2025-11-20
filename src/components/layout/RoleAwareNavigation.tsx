"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Shield,
  GraduationCap,
  Users,
  Eye,
  Home,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { getRoleDisplayName } from "@/lib/role-utils";
import { UserRole } from "@/lib/prisma-compat-types";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/NotificationBell";

interface RoleAwareNavigationProps {
  className?: string;
  showRoleIndicator?: boolean;
  showQuickActions?: boolean;
  compact?: boolean;
}

// Role-specific navigation themes and colors
const roleThemes = {
  MASTER: {
    icon: Crown,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    badge:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  ADMIN: {
    icon: Shield,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  PROFESOR: {
    icon: GraduationCap,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
    badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  PARENT: {
    icon: Users,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    badge:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  PUBLIC: {
    icon: Eye,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-950/20",
    borderColor: "border-gray-200 dark:border-gray-800",
    badge: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  },
} as const;

export function RoleIndicator({
  role,
  showBadge = true,
  size = "default",
  className,
}: {
  role: UserRole;
  showBadge?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const theme = roleThemes[role];
  const Icon = theme.icon;

  const sizeClasses = {
    sm: "h-3 w-3",
    default: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full border",
          theme.bgColor,
          theme.borderColor,
          size === "sm" ? "p-1" : size === "lg" ? "p-2" : "p-1.5",
        )}
      >
        <Icon className={cn(theme.color, sizeClasses[size])} />
      </div>

      {showBadge && (
        <Badge
          variant="secondary"
          className={cn(
            theme.badge,
            "text-xs font-medium",
            size === "sm" && "text-[10px] px-1.5 py-0.5",
          )}
        >
          {getRoleDisplayName(role)}
        </Badge>
      )}
    </div>
  );
}

export function RoleAwareNavigation({
  className,
  showRoleIndicator = true,
  showQuickActions = true,
  compact = false,
}: RoleAwareNavigationProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const currentRole = session?.user?.role as UserRole;
  const user = session?.user;

  const navigationContext: any = useMemo(() => {
    if (!currentRole) return null;

    const isAdminRoute = pathname.startsWith("/admin");
    const isProfesorRoute = pathname.startsWith("/profesor");
    const isParentRoute = pathname.startsWith("/parent");
    const isPublicRoute = !isAdminRoute && !isProfesorRoute && !isParentRoute;

    const theme = roleThemes[currentRole];

    // Role-specific quick actions
    const quickActions = [];

    if (currentRole === "MASTER") {
      quickActions.push(
        { icon: Settings, label: "Settings", href: "/settings" },
        { icon: User, label: "Profile", href: "/profile" },
      );
    } else if (currentRole === "ADMIN") {
      quickActions.push(
        { icon: Home, label: "Dashboard", href: "/admin" },
        { icon: Settings, label: "Configuración", href: "/settings" },
      );
    } else if (currentRole === "PROFESOR") {
      quickActions.push(
        { icon: Home, label: "Dashboard", href: "/profesor" },
        { icon: Settings, label: "Configuración", href: "/settings" },
      );
    } else if (currentRole === "PARENT") {
      quickActions.push(
        { icon: Home, label: "Dashboard", href: "/parent" },
        { icon: Settings, label: "Configuración", href: "/settings" },
      );
    }

    return {
      currentRole,
      theme,
      isAdminRoute,
      isProfesorRoute,
      isParentRoute,
      isPublicRoute,
      quickActions,
      user,
    };
  }, [currentRole, pathname, user]);

  if (!navigationContext) return null;

  const {
    currentRole: navCurrentRole,
    theme,
    isAdminRoute,
    isProfesorRoute,
    isParentRoute,
    isPublicRoute,
    quickActions,
    user: navUser,
  } = navigationContext;

  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* Role Indicator */}
      {showRoleIndicator && (
        <RoleIndicator
          role={navCurrentRole}
          size={compact ? "sm" : "default"}
        />
      )}

      {/* Role Context Info */}
      {!compact && (
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {navCurrentRole === "MASTER" ? "Role:" : "Rol:"}
            </span>
            <span className="font-medium">
              {getRoleDisplayName(navCurrentRole)}
            </span>
          </div>

          {/* Route Context */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {navCurrentRole === "MASTER" ? "Area:" : "Área:"}
            </span>
            <Badge variant="outline" className="text-xs">
              {isAdminRoute && "Administración"}
              {isProfesorRoute && "Docente"}
              {isParentRoute && "Familiar"}
              {isPublicRoute && "Público"}
              {navCurrentRole === "MASTER" && pathname.startsWith("/master") && "Master Control"}
            </Badge>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {showQuickActions && quickActions.length > 0 && (
        <div className="flex items-center gap-1">
          {quickActions.map((action: any, index: number) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2 text-xs",
                compact && "h-7 px-1.5 text-[10px]",
              )}
              asChild
            >
              <Link href={action.href} className="flex items-center gap-1">
                <action.icon className="h-3 w-3" />
                {!compact && <span>{action.label}</span>}
              </Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export function RoleAwareBreadcrumb({
  className,
  showHome = true,
}: {
  className?: string;
  showHome?: boolean;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const breadcrumbCurrentRole = session?.user?.role as UserRole;

  const breadcrumbItems = useMemo(() => {
    if (!breadcrumbCurrentRole) return [];

    const items = [];

    // Add home based on role
    if (showHome) {
      const homeItem = {
        label: breadcrumbCurrentRole === "MASTER" ? "Home" : "Inicio",
        href:
          breadcrumbCurrentRole === "ADMIN"
            ? "/admin"
            : breadcrumbCurrentRole === "PROFESOR"
              ? "/profesor"
              : breadcrumbCurrentRole === "PARENT"
                ? "/parent"
                : "/",
        icon: Home,
      };
      items.push(homeItem);
    }

    // Parse current path
    const pathSegments = pathname.split("/").filter(Boolean);

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Skip the role prefix (admin, profesor, parent)
      if (index === 0 && ["admin", "profesor", "parent"].includes(segment)) {
        return;
      }

      // Create breadcrumb item
      const label = segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      items.push({
        label,
        href: currentPath,
      });
    });

    return items;
  }, [pathname, breadcrumbCurrentRole, showHome]);

  if (breadcrumbItems.length === 0) return null;

  return (
    <nav
      className={cn("flex items-center space-x-2 text-sm", className)}
      aria-label="Breadcrumb"
    >
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && (
            <span className="text-muted-foreground" aria-hidden="true">
              /
            </span>
          )}
          {item.href === pathname ? (
            <span className="font-medium text-foreground" aria-current="page">
              {item.icon && <item.icon className="inline h-4 w-4 mr-1" />}
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
            >
              {item.icon && <item.icon className="inline h-4 w-4 mr-1" />}
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export function RoleAwareHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  const { data: session } = useSession();
  const headerCurrentRole = session?.user?.role as UserRole;

  return (
    <div className={cn("flex items-center justify-between py-6", className)}>
      <div className="flex items-center gap-4">
        {headerCurrentRole && (
          <RoleIndicator role={headerCurrentRole} showBadge={false} size="lg" />
        )}

        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />
        {actions && <>{actions}</>}
      </div>
    </div>
  );
}

// Export role themes for use in other components
export { roleThemes };
