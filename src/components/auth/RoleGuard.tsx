"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { UserRole } from "@/lib/prisma-compat-types";
import { hasPermission, Permission } from "@/lib/authorization";
import { getRoleAccess } from "@/lib/role-utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

interface RoleGuardProps {
  children: React.ReactNode;
  roles?: UserRole[];
  permissions?: Permission[];
  fallback?: React.ReactNode;
  showUnauthorized?: boolean;
  redirectTo?: string;
  requireAuth?: boolean;
}

export function RoleGuard({
  children,
  roles,
  permissions,
  fallback,
  showUnauthorized = true,
  redirectTo,
  requireAuth = true,
}: RoleGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  // Not authenticated
  if (requireAuth && !session?.user) {
    if (redirectTo) {
      router.push(redirectTo);
      return null;
    }

    if (showUnauthorized) {
      return (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Autenticación requerida</AlertTitle>
          <AlertDescription>
            Debes iniciar sesión para acceder a esta funcionalidad.
          </AlertDescription>
        </Alert>
      );
    }

    return fallback || null;
  }

  const userRole = session?.user?.role as UserRole;

  // Check role access
  if (roles && roles.length > 0) {
    if (!userRole || !roles.includes(userRole)) {
      if (redirectTo) {
        router.push(redirectTo);
        return null;
      }

      if (showUnauthorized) {
        return (
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
            <Shield className="h-4 w-4 text-red-600" />
            <AlertTitle>Acceso denegado</AlertTitle>
            <AlertDescription>
              No tienes los permisos necesarios para acceder a esta
              funcionalidad. Rol requerido: {roles.join(" o ")}
            </AlertDescription>
          </Alert>
        );
      }

      return fallback || null;
    }
  }

  // Check permissions
  if (permissions && permissions.length > 0) {
    const hasAllPermissions = permissions.every((permission) =>
      hasPermission(userRole, permission),
    );

    if (!hasAllPermissions) {
      if (redirectTo) {
        router.push(redirectTo);
        return null;
      }

      if (showUnauthorized) {
        return (
          <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
            <EyeOff className="h-4 w-4 text-orange-600" />
            <AlertTitle>Permisos insuficientes</AlertTitle>
            <AlertDescription>
              No tienes los permisos necesarios para esta acción.
            </AlertDescription>
          </Alert>
        );
      }

      return fallback || null;
    }
  }

  // All checks passed
  return <>{children}</>;
}

interface ConditionalRenderProps {
  children: React.ReactNode;
  condition: boolean;
  fallback?: React.ReactNode;
}

export function ConditionalRender({
  children,
  condition,
  fallback = null,
}: ConditionalRenderProps) {
  return <>{condition ? children : fallback}</>;
}

interface RoleBasedComponentProps<T = any> {
  master?: T;
  admin?: T;
  profesor?: T;
  parent?: T;
  public?: T;
  fallback?: T;
}

export function RoleBasedComponent<T = React.ReactNode>({
  master,
  admin,
  profesor,
  parent,
  public: publicComponent,
  fallback,
}: RoleBasedComponentProps<T>) {
  const { data: session } = useSession();
  const userRole = session?.user?.role as UserRole;

  switch (userRole) {
    case "MASTER":
      return <>{master ?? fallback}</>;
    case "ADMIN":
      return <>{admin ?? fallback}</>;
    case "PROFESOR":
      return <>{profesor ?? fallback}</>;
    case "PARENT":
      return <>{parent ?? fallback}</>;
    case "PUBLIC":
      return <>{publicComponent ?? fallback}</>;
    default:
      return <>{fallback}</>;
  }
}

interface PermissionBasedComponentProps {
  children: React.ReactNode;
  permission: Permission;
  fallback?: React.ReactNode;
  showUnauthorized?: boolean;
}

export function PermissionBasedComponent({
  children,
  permission,
  fallback,
  showUnauthorized = false,
}: PermissionBasedComponentProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.role as UserRole;

  if (!userRole) {
    return fallback || null;
  }

  const hasPermissionForAction = hasPermission(userRole, permission);

  if (!hasPermissionForAction) {
    if (showUnauthorized) {
      return (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
          <EyeOff className="h-4 w-4 text-orange-600" />
          <AlertTitle>Permisos insuficientes</AlertTitle>
          <AlertDescription>
            No tienes los permisos necesarios para esta acción.
          </AlertDescription>
        </Alert>
      );
    }

    return fallback || null;
  }

  return <>{children}</>;
}

interface FeatureToggleProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureToggle({
  feature,
  children,
  fallback = null,
}: FeatureToggleProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.role as UserRole;

  // MASTER Almighty Feature Access - Supreme Authority
  const featureAccess: Record<string, UserRole[]> = {
    // MASTER-Only God Mode Features
    "role-switching": ["MASTER"],
    "system-god-mode": ["MASTER"],
    "global-oversight": ["MASTER"],
    "system-configuration": ["MASTER"],
    "audit-master-access": ["MASTER"],
    "user-role-override": ["MASTER"],
    "data-master-export": ["MASTER"],
    "backup-master-control": ["MASTER"],
    "emergency-lockdown": ["MASTER"],
    "security-master-override": ["MASTER"],
    "metrics-global-view": ["MASTER"],
    "config-master-reset": ["MASTER"],

    // MASTER + ADMIN Features
    "advanced-analytics": ["MASTER", "ADMIN"],
    "user-management": ["MASTER", "ADMIN"],
    "bulk-operations": ["MASTER", "ADMIN"],
    "voting-system": ["MASTER", "ADMIN"],

    // Educational Features
    "planning-templates": ["MASTER", "ADMIN", "PROFESOR"],
    "meeting-scheduling": ["MASTER", "ADMIN", "PROFESOR"],
    "document-uploads": ["MASTER", "ADMIN", "PROFESOR"],

    // Communication Features
    "parent-communication": ["MASTER", "ADMIN", "PROFESOR", "PARENT"],
    "public-content": ["MASTER", "ADMIN", "PROFESOR", "PARENT", "PUBLIC"],
  };

  const allowedRoles = featureAccess[feature];
  const hasAccess = userRole && allowedRoles?.includes(userRole);

  return <>{hasAccess ? children : fallback}</>;
}

export function RoleBasedButton({
  children,
  roles,
  permissions,
  ...buttonProps
}: {
  children: React.ReactNode;
  roles?: UserRole[];
  permissions?: Permission[];
} & React.ComponentProps<typeof Button>) {
  const { data: session } = useSession();
  const userRole = session?.user?.role as UserRole;

  // Check role access
  if (roles && roles.length > 0) {
    if (!userRole || !roles.includes(userRole)) {
      return null;
    }
  }

  // Check permissions
  if (permissions && permissions.length > 0) {
    const hasAllPermissions = permissions.every((permission) =>
      hasPermission(userRole, permission),
    );

    if (!hasAllPermissions) {
      return null;
    }
  }

  return <Button {...buttonProps}>{children}</Button>;
}

// MASTER Almighty Role Access Hook - Supreme Authority
export function useRoleAccess() {
  const { data: session } = useSession();
  const userRole = session?.user?.role as UserRole;

  return {
    userRole,
    // Basic role checks
    isMaster: userRole === "MASTER",
    isAdmin: userRole === "ADMIN",
    isProfesor: userRole === "PROFESOR",
    isParent: userRole === "PARENT",
    isPublic: userRole === "PUBLIC",

    // MASTER God Mode capabilities
    hasMasterGodMode: userRole === "MASTER",
    hasMasterAuthority: userRole === "MASTER",
    hasMasterGlobalOversight: userRole === "MASTER",
    hasMasterSystemControl: userRole === "MASTER",

    // Permission checks
    hasPermission: (permission: Permission) =>
      hasPermission(userRole, permission),
    hasAnyRole: (roles: UserRole[]) => userRole && roles.includes(userRole),
    hasAllRoles: (roles: UserRole[]) =>
      roles.every((role) => role === userRole),
    roleAccess: userRole ? getRoleAccess(userRole) : null,

    // MASTER-specific feature checks
    canSwitchRoles: userRole === "MASTER",
    canAccessGodMode: userRole === "MASTER",
    canOverrideRoles: userRole === "MASTER",
    canEmergencyLockdown: userRole === "MASTER",
    canMasterExport: userRole === "MASTER",
  };
}
