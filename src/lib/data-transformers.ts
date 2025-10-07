/**
 * Data Transformation Utilities
 * Standardizes data formatting patterns across the application
 * Part of Stage 3: Route & Logic Consolidation
 */

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { UserRole } from "@/lib/prisma-compat-types";

export type ExtendedUserRole = UserRole;

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  type: "academic" | "meeting" | "holiday" | "activity";
  isPublic: boolean;
  createdBy?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialties?: any;
  description?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface UserDisplayData {
  id: string;
  name: string;
  email: string;
  role: ExtendedUserRole;
  displayRole: string;
  avatar?: string;
  lastLogin?: Date;
  formattedLastLogin?: string;
  displayClass?: string;
}

/**
 * Format calendar events based on user role and context
 */
export function formatCalendarEvents(
  events: CalendarEvent[],
  userRole?: ExtendedUserRole,
  context: "public" | "dashboard" | "admin" = "dashboard",
): CalendarEvent[] {
  return events
    .filter((event) => {
      // Filter based on role and context
      if (context === "public") return event.isPublic;
      if (userRole === "MASTER" || userRole === "ADMIN") return true;
      if (userRole === "PROFESOR") return true;
      if (userRole === "PARENT") {
        return (
          event.isPublic ||
          event.type === "academic" ||
          event.type === "holiday"
        );
      }
      return (
        event.isPublic || event.type === "academic" || event.type === "holiday"
      );
    })
    .map((event) => ({
      ...event,
      // Format display date
      formattedDate: format(event.date, "dd 'de' MMMM, yyyy", { locale: es }),
      formattedTime: event.startTime
        ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""}`
        : undefined,
      // Context-specific styling
      displayClass: getEventDisplayClass(event.type, context),
      canEdit: canEditEvent(event, userRole),
    }));
}

/**
 * Format team members based on context
 */
export function formatTeamMembers(
  members: TeamMember[],
  context: "public" | "admin" | "card" = "public",
): (TeamMember & {
  displayName: string;
  displayRole: string;
  canEdit: boolean;
})[] {
  return members
    .filter((member) => member.isActive)
    .map((member) => ({
      ...member,
      // Parse specialties if they're stored as JSON string
      specialties:
        typeof member.specialties === "string"
          ? JSON.parse(member.specialties)
          : member.specialties,
      displayName: member.name,
      displayRole: formatTeamMemberRole(member.role),
      formattedJoinDate: format(member.createdAt, "MMMM yyyy", { locale: es }),
      canEdit: context === "admin",
      displayClass: getTeamMemberDisplayClass(context),
    }));
}

/**
 * Format user data for display
 */
export function formatUserData(
  user: {
    id: string;
    name?: string;
    email: string;
    role: ExtendedUserRole;
    lastLogin?: Date;
  },
  displayContext: "profile" | "list" | "badge" = "profile",
): UserDisplayData {
  return {
    id: user.id,
    name: user.name || "Usuario",
    email: user.email,
    role: user.role,
    displayRole: formatUserRole(user.role),
    lastLogin: user.lastLogin,
    formattedLastLogin: user.lastLogin
      ? format(user.lastLogin, "dd/MM/yyyy HH:mm", { locale: es })
      : undefined,
    displayClass: getUserDisplayClass(user.role, displayContext),
  };
}

/**
 * Format planning document data
 */
export function formatPlanningDocument(doc: any, userRole?: ExtendedUserRole) {
  return {
    ...doc,
    formattedDate: format(new Date(doc.createdAt), "dd/MM/yyyy", {
      locale: es,
    }),
    canEdit: canEditDocument(doc, userRole),
    statusBadge: getDocumentStatusBadge(doc.status),
    displayClass: getDocumentDisplayClass(doc.status),
  };
}

/**
 * Format meeting data
 */
export function formatMeetingData(meeting: any, userRole?: ExtendedUserRole) {
  return {
    ...meeting,
    formattedDate: format(
      new Date(meeting.scheduledDate),
      "dd 'de' MMMM, yyyy",
      { locale: es },
    ),
    formattedTime: meeting.scheduledTime || "Hora por definir",
    canManage: userRole === "ADMIN" || userRole === "PROFESOR",
    statusBadge: getMeetingStatusBadge(meeting.status),
    displayClass: getMeetingDisplayClass(meeting.status),
  };
}

// Helper functions

function getEventDisplayClass(type: string, context: string): string {
  const baseClasses =
    context === "public"
      ? "backdrop-blur-xl bg-gray-900/80 border border-gray-700/50"
      : "bg-background border border-border shadow-sm";

  const typeClasses = {
    academic: "border-l-4 border-l-blue-500",
    meeting: "border-l-4 border-l-green-500",
    holiday: "border-l-4 border-l-red-500",
    activity: "border-l-4 border-l-purple-500",
  };

  return `${baseClasses} ${typeClasses[type as keyof typeof typeClasses] || ""}`;
}

function getTeamMemberDisplayClass(context: string): string {
  return context === "public"
    ? "backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
    : "bg-background border border-border shadow-sm hover:shadow-md transition-shadow rounded-lg";
}

function getUserDisplayClass(role: ExtendedUserRole, context: string): string {
  const roleColors: { [key in ExtendedUserRole]: string } = {
    MASTER:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    ADMIN: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    PROFESOR:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    PARENT:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    PUBLIC: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  };

  return `${roleColors[role]} border-l-4`;
}

function formatTeamMemberRole(role: string): string {
  const roleMap: { [key: string]: string } = {
    director: "Director/a",
    psychologist: "Psicólogo/a",
    social_worker: "Trabajador/a Social",
    teacher: "Profesor/a",
    coordinator: "Coordinador/a",
    specialist: "Especialista",
  };

  return roleMap[role] || role;
}

function formatUserRole(role: ExtendedUserRole): string {
  const roleMap: { [key in ExtendedUserRole]: string } = {
    MASTER: "Master",
    ADMIN: "Administrador",
    PROFESOR: "Profesor",
    PARENT: "Padre/Apoderado",
    PUBLIC: "Público",
  };
  return roleMap[role] || role;
}

function canEditEvent(
  event: CalendarEvent,
  userRole?: ExtendedUserRole,
): boolean {
  if (!userRole) return false;
  if (userRole === "ADMIN") return true;
  if (userRole === "PROFESOR" && event.createdBy) return true;
  return false;
}

function canEditDocument(doc: any, userRole?: ExtendedUserRole): boolean {
  if (!userRole) return false;
  if (userRole === "ADMIN") return true;
  if (userRole === "PROFESOR" && doc.authorId) return true;
  return false;
}

function getDocumentStatusBadge(status: string): {
  text: string;
  variant: string;
} {
  const statusMap: { [key: string]: { text: string; variant: string } } = {
    draft: { text: "Borrador", variant: "secondary" },
    published: { text: "Publicado", variant: "default" },
    archived: { text: "Archivado", variant: "outline" },
  };

  return statusMap[status] || { text: status, variant: "default" };
}

function getDocumentDisplayClass(status: string): string {
  const statusClasses: { [key: string]: string } = {
    draft: "border-l-yellow-500",
    published: "border-l-green-500",
    archived: "border-l-gray-500",
  };

  return statusClasses[status] || "";
}

function getMeetingStatusBadge(status: string): {
  text: string;
  variant: string;
} {
  const statusMap: { [key: string]: { text: string; variant: string } } = {
    scheduled: { text: "Programada", variant: "default" },
    completed: { text: "Completada", variant: "secondary" },
    cancelled: { text: "Cancelada", variant: "destructive" },
    rescheduled: { text: "Reprogramada", variant: "outline" },
  };

  return statusMap[status] || { text: status, variant: "default" };
}

function getMeetingDisplayClass(status: string): string {
  const statusClasses: { [key: string]: string } = {
    scheduled: "border-l-blue-500",
    completed: "border-l-green-500",
    cancelled: "border-l-red-500",
    rescheduled: "border-l-orange-500",
  };

  return statusClasses[status] || "";
}
