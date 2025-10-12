/**
 * Role-based filtering utilities for database queries
 */

import { ExtendedUserRole } from "@/lib/authorization";

export interface RoleAccess {
  canAccessAdmin: boolean;
  canAccessProfesor: boolean;
  canAccessParent: boolean;
  canAccessPublic: boolean;
}

// MASTER God Mode Access Hierarchy
export function getRoleAccess(role?: ExtendedUserRole | string): RoleAccess {
  const userRole = role as ExtendedUserRole;

  const access = {
    // MASTER has access to everything - Supreme Authority
    canAccessAdmin: userRole === "MASTER" || userRole === "ADMIN",
    canAccessProfesor:
      userRole === "MASTER" || userRole === "ADMIN" || userRole === "PROFESOR",
    canAccessParent:
      userRole === "MASTER" ||
      userRole === "ADMIN" ||
      userRole === "PROFESOR" ||
      userRole === "PARENT",
    canAccessPublic: true, // Everyone can access public pages
  };

  return access;
}

// MASTER Almighty Access Control
export function hasMasterGodModeAccess(
  role?: ExtendedUserRole | string,
): boolean {
  return role === "MASTER";
}

// MASTER Global Oversight Check
export function canMasterOverride(role?: ExtendedUserRole | string): boolean {
  return role === "MASTER";
}

export function canAccessProfesor(role?: ExtendedUserRole | string): boolean {
  const access = getRoleAccess(role);
  return access.canAccessProfesor;
}

export function canAccessAdmin(role?: ExtendedUserRole | string): boolean {
  const access = getRoleAccess(role);
  return access.canAccessAdmin;
}

export function canAccessSection(
  userRole: ExtendedUserRole,
  section: "admin" | "profesor" | "parent" | "public",
): boolean {
  const access = getRoleAccess(userRole);

  switch (section) {
    case "admin":
      return access.canAccessAdmin;
    case "profesor":
      return access.canAccessProfesor;
    case "parent":
      return access.canAccessParent;
    case "public":
      return access.canAccessPublic;
    default:
      return false;
  }
}

export function getAccessibleSections(userRole: ExtendedUserRole): string[] {
  const access = getRoleAccess(userRole);
  const sections: string[] = [];

  if (access.canAccessAdmin) sections.push("admin");
  if (access.canAccessProfesor) sections.push("profesor");
  if (access.canAccessParent) sections.push("parent");
  if (access.canAccessPublic) sections.push("public");

  return sections;
}

/**
 * MASTER Almighty Record Control - Supreme Authority
 */
export function canEditRecord(
  userRole: ExtendedUserRole,
  recordAuthorId: string,
  currentUserId: string,
): boolean {
  // MASTER has almighty authority - can edit ANY record
  if (hasMasterGodModeAccess(userRole)) return true;
  // ADMIN can edit all records in their school
  if (userRole === "ADMIN") return true;
  // PROFESOR can only edit their own records
  if (userRole === "PROFESOR") return recordAuthorId === currentUserId;
  return false;
}

/**
 * MASTER Almighty Delete Control - Supreme Authority
 */
export function canDeleteRecord(
  userRole: ExtendedUserRole,
  recordAuthorId: string,
  currentUserId: string,
): boolean {
  // MASTER has almighty authority - can delete ANY record
  if (hasMasterGodModeAccess(userRole)) return true;
  // ADMIN can delete all records in their school
  if (userRole === "ADMIN") return true;
  // PROFESOR can only delete their own records
  if (userRole === "PROFESOR") return recordAuthorId === currentUserId;
  return false;
}

/**
 * Get author filter for queries that need to respect ownership
 */
// MASTER Almighty Filter Override - Supreme Authority
export function getAuthorFilter(
  role: ExtendedUserRole,
  userId: string,
): Record<string, any> {
  const baseFilter = getRoleFilter(role);

  switch (role) {
    case "MASTER":
      // MASTER has almighty access - sees EVERYTHING
      return {}; // No restrictions whatsoever

    case "ADMIN":
      // ADMIN sees all records in their school
      return baseFilter;

    case "PROFESOR":
      // Professors can only see their own records + public records
      return {
        ...baseFilter,
        OR: [
          { createdBy: userId },
          { isPublic: true }, // If there's a public flag
        ],
      };

    default:
      // Public users see only public records
      return {
        ...baseFilter,
        isPublic: true,
      };
  }
}

export function getDefaultRedirectPath(role: ExtendedUserRole): string {
  switch (role) {
    case "MASTER":
      return "/master";
    case "ADMIN":
      return "/admin";
    case "PROFESOR":
      return "/profesor";
    case "PARENT":
      return "/parent";
    case "PUBLIC":
      return "/";
    default:
      return "/";
  }
}

// MASTER Almighty Role Filter - Supreme Authority
export function getRoleFilter(
  role?: ExtendedUserRole | string,
): Record<string, any> {
  const userRole = role as ExtendedUserRole;

  switch (userRole) {
    case "MASTER":
      return {}; // MASTER has ZERO restrictions - Almighty access
    case "ADMIN":
      return {}; // ADMIN has school-level access
    case "PROFESOR":
      return {}; // Professors can see all school content
    case "PARENT":
      return {}; // Parents can see all
    default:
      return {}; // Public users can see all team members (they're public by nature)
  }
}

// MASTER Almighty Display Names - Supreme Authority
export function getRoleDisplayName(role: ExtendedUserRole): string {
  switch (role) {
    case "MASTER":
      return "🏛️ SUPREMO MASTER"; // God Mode indicator
    case "ADMIN":
      return "Administrador";
    case "PROFESOR":
      return "Profesor";
    case "PARENT":
      return "Padre/Apoderado";
    case "PUBLIC":
      return "Público";
    default:
      return role;
  }
}
