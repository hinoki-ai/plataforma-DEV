import { UserRole } from '@prisma/client';

export type ExtendedUserRole = UserRole;

// MASTER God Mode Permissions - Supreme Authority
export const MasterPermissions = {
  // System-Level Almighty Capabilities
  SYSTEM_GOD_MODE: 'system:godmode',                    // Ultimate system control
  GLOBAL_OVERSIGHT: 'system:global',                    // Cross-website oversight
  SYSTEM_CONFIGURATION: 'system:config',                // System configuration
  AUDIT_MASTER_ACCESS: 'audit:master',                  // Complete audit access
  USER_ROLE_OVERRIDE: 'users:override',                 // Override any role
  DATA_MASTER_EXPORT: 'data:master_export',             // Export all data
  BACKUP_MASTER_CONTROL: 'backup:master',               // Master backup control
  EMERGENCY_LOCKDOWN: 'emergency:lockdown',             // Emergency system lockdown
  SECURITY_MASTER_OVERRIDE: 'security:master_override', // Security overrides
  METRICS_GLOBAL_VIEW: 'metrics:global',                // Global metrics access
  CONFIG_MASTER_RESET: 'config:master_reset',           // Master configuration reset
} as const;

// School-Level Admin Permissions
export const Permissions = {
  SCHOOL_INFO_EDIT: 'school:edit',
  SCHOOL_INFO_VIEW: 'school:view',
  RESERVATIONS_MANAGE: 'reservations:manage',
  RESERVATIONS_VIEW: 'reservations:view',
  USERS_MANAGE: 'users:manage',
  USERS_VIEW: 'users:view',
  USERS_CREATE_PARENT: 'users:create_parent',
  USERS_CREATE_PROFESOR: 'users:create_profesor',
  USERS_CREATE_ADMIN: 'users:create_admin',
  PLANNING_DOCUMENTS_ALL: 'planning:all',
  PLANNING_DOCUMENTS_OWN: 'planning:own',
  FILES_UPLOAD: 'files:upload',
  FILES_DELETE: 'files:delete',
  PARENT_DASHBOARD_ACCESS: 'parent:dashboard',
  PROFESOR_DASHBOARD_ACCESS: 'profesor:dashboard',
  ADMIN_DASHBOARD_ACCESS: 'admin:dashboard',
  PUBLIC_PAGES_ACCESS: 'public:pages',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions] | (typeof MasterPermissions)[keyof typeof MasterPermissions];

// Type guard to check if role is a UserRole
export function isStandardUserRole(role: ExtendedUserRole): role is UserRole {
  return (
    role === 'MASTER' ||
    role === 'ADMIN' ||
    role === 'PROFESOR' ||
    role === 'PARENT' ||
    role === 'PUBLIC'
  );
}

// MASTER God Mode Hierarchy - Supreme Authority over all systems
const rolePermissions: Record<ExtendedUserRole, Permission[]> = {
  // MASTER: Almighty God Mode - Supreme Authority
  MASTER: [
    // All MasterPermissions - God Mode capabilities
    MasterPermissions.SYSTEM_GOD_MODE,
    MasterPermissions.GLOBAL_OVERSIGHT,
    MasterPermissions.SYSTEM_CONFIGURATION,
    MasterPermissions.AUDIT_MASTER_ACCESS,
    MasterPermissions.USER_ROLE_OVERRIDE,
    MasterPermissions.DATA_MASTER_EXPORT,
    MasterPermissions.BACKUP_MASTER_CONTROL,
    MasterPermissions.EMERGENCY_LOCKDOWN,
    MasterPermissions.SECURITY_MASTER_OVERRIDE,
    MasterPermissions.METRICS_GLOBAL_VIEW,
    MasterPermissions.CONFIG_MASTER_RESET,
    // All ADMIN permissions (school-level)
    Permissions.SCHOOL_INFO_EDIT,
    Permissions.SCHOOL_INFO_VIEW,
    Permissions.RESERVATIONS_MANAGE,
    Permissions.RESERVATIONS_VIEW,
    Permissions.USERS_MANAGE,
    Permissions.USERS_VIEW,
    Permissions.PLANNING_DOCUMENTS_ALL,
    Permissions.PLANNING_DOCUMENTS_OWN,
    Permissions.FILES_UPLOAD,
    Permissions.FILES_DELETE,
    Permissions.ADMIN_DASHBOARD_ACCESS,
    Permissions.PROFESOR_DASHBOARD_ACCESS,
    Permissions.PARENT_DASHBOARD_ACCESS,
    Permissions.PUBLIC_PAGES_ACCESS,
  ],
  // ADMIN: School-Level Administrator (Local to this school)
  ADMIN: [
    // School-specific admin capabilities only
    Permissions.SCHOOL_INFO_EDIT,
    Permissions.SCHOOL_INFO_VIEW,
    Permissions.RESERVATIONS_MANAGE,
    Permissions.RESERVATIONS_VIEW,
    Permissions.USERS_MANAGE,
    Permissions.USERS_VIEW,
    Permissions.USERS_CREATE_PARENT,
    Permissions.USERS_CREATE_PROFESOR,
    Permissions.USERS_CREATE_ADMIN,
    Permissions.PLANNING_DOCUMENTS_ALL,
    Permissions.PLANNING_DOCUMENTS_OWN,
    Permissions.FILES_UPLOAD,
    Permissions.FILES_DELETE,
    Permissions.ADMIN_DASHBOARD_ACCESS,
    Permissions.PROFESOR_DASHBOARD_ACCESS,
    Permissions.PARENT_DASHBOARD_ACCESS,
    Permissions.PUBLIC_PAGES_ACCESS,
  ],
  // PROFESOR: Teacher Role (Limited to educational content)
  PROFESOR: [
    Permissions.SCHOOL_INFO_VIEW,
    Permissions.RESERVATIONS_VIEW,
    Permissions.USERS_CREATE_PARENT,
    Permissions.PLANNING_DOCUMENTS_OWN,
    Permissions.PROFESOR_DASHBOARD_ACCESS,
    Permissions.PARENT_DASHBOARD_ACCESS,
    Permissions.PUBLIC_PAGES_ACCESS,
  ],
  // PARENT: Parent Role (Basic access)
  PARENT: [
    Permissions.PARENT_DASHBOARD_ACCESS,
    Permissions.PUBLIC_PAGES_ACCESS,
  ],
  // PUBLIC: Anonymous visitors (Minimal access)
  PUBLIC: [Permissions.PUBLIC_PAGES_ACCESS],
};

export function hasPermission(
  userRole: ExtendedUserRole,
  permission: Permission
): boolean {
  return rolePermissions[userRole]?.includes(permission) || false;
}

export function requirePermission(
  userRole: ExtendedUserRole,
  permission: Permission,
  customMessage?: string
): void {
  if (!hasPermission(userRole, permission)) {
    const message =
      customMessage || `No tienes permisos para realizar esta acción`;
    throw new Error(message);
  }
}

// MASTER God Mode Detection
export function hasMasterGodMode(userRole: ExtendedUserRole): boolean {
  return userRole === 'MASTER';
}

// MASTER Almighty Access Check
export function hasMasterAuthority(userRole: ExtendedUserRole): boolean {
  return userRole === 'MASTER';
}

// Enhanced document editing with MASTER supremacy
export function canEditPlanningDocument(
  userRole: ExtendedUserRole,
  documentAuthorId: string,
  currentUserId: string
): boolean {
  // MASTER has almighty authority - can edit anything
  if (hasMasterAuthority(userRole)) return true;
  // ADMIN can edit all documents in their school
  if (userRole === 'ADMIN') return true;
  // PROFESOR can only edit their own documents
  if (userRole === 'PROFESOR') return documentAuthorId === currentUserId;
  return false;
}

export function canDeletePlanningDocument(
  userRole: ExtendedUserRole,
  documentAuthorId: string,
  currentUserId: string
): boolean {
  return canEditPlanningDocument(userRole, documentAuthorId, currentUserId);
}

// User Creation Permissions
export function canCreateUser(
  userRole: ExtendedUserRole,
  targetRole: ExtendedUserRole
): boolean {
  if (!isStandardUserRole(targetRole)) {
    return false;
  }

  switch (targetRole) {
    case 'ADMIN':
      return hasPermission(userRole, Permissions.USERS_CREATE_ADMIN);
    case 'PROFESOR':
      return hasPermission(userRole, Permissions.USERS_CREATE_PROFESOR);
    case 'PARENT':
      return hasPermission(userRole, Permissions.USERS_CREATE_PARENT);
    default:
      return false;
  }
}

export function canCreateParentUser(userRole: ExtendedUserRole): boolean {
  return hasPermission(userRole, Permissions.USERS_CREATE_PARENT);
}

export function canCreateProfesorUser(userRole: ExtendedUserRole): boolean {
  return hasPermission(userRole, Permissions.USERS_CREATE_PROFESOR);
}

export function canCreateAdminUser(userRole: ExtendedUserRole): boolean {
  return hasPermission(userRole, Permissions.USERS_CREATE_ADMIN);
}
