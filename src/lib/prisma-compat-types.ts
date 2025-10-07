/**
 * Prisma Compatibility Types
 *
 * This file provides type exports that replace @prisma/client imports
 * after migration to Convex. These types maintain backward compatibility
 * with existing code while using Convex's type system.
 */

// ==================== USER ROLES ====================

export type UserRole = "MASTER" | "ADMIN" | "PROFESOR" | "PARENT" | "PUBLIC";

export type UserStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED";

// ==================== MEETING TYPES ====================

export type MeetingStatus = "PENDING" | "CONFIRMED" | "RESCHEDULED" | "CANCELLED" | "COMPLETED";

export type MeetingType = "PARENT_TEACHER" | "FOLLOW_UP" | "EMERGENCY" | "IEP_REVIEW" | "GRADE_CONFERENCE";

export type MeetingLocationType = "IN_PERSON" | "VIRTUAL" | "PHONE" | "HYBRID";

// ==================== CALENDAR TYPES ====================

export type EventCategory =
  | "ADMIN"
  | "PROFESOR"
  | "PARENT"
  | "SPECIAL"
  | "EVENT"
  | "HOLIDAY"
  | "MEETING"
  | "ACTIVITY"
  | "ACADEMIC"
  | "CULTURAL"
  | "SPORTS"
  | "VACATION"
  | "PLANNING";

export type EventPriority = "LOW" | "MEDIUM" | "HIGH";

// ==================== ACTIVITY TYPES ====================

export type ActivityType =
  | "HOMEWORK"
  | "PROJECT"
  | "EXAM"
  | "PRESENTATION"
  | "FIELDTRIP"
  | "WORKSHOP"
  | "SPORTS"
  | "CULTURAL"
  | "OTHER";

export type ActivityStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

// ==================== NOTIFICATION TYPES ====================

export type NotificationType =
  | "MEETING"
  | "ACTIVITY"
  | "ANNOUNCEMENT"
  | "ALERT"
  | "REMINDER"
  | "MESSAGE"
  | "SYSTEM";

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// ==================== VOTE TYPES ====================

export type VoteCategory =
  | "GENERAL"
  | "ACADEMIC"
  | "ADMINISTRATIVE"
  | "SOCIAL"
  | "FINANCIAL"
  | "INFRASTRUCTURE"
  | "CURRICULUM"
  | "EVENTS"
  | "POLICIES"
  | "OTHER";

// ==================== TEAM MEMBER TYPES ====================

export type TeamMemberRole =
  | "PSYCHOLOGIST"
  | "SPEECH_THERAPIST"
  | "OCCUPATIONAL_THERAPIST"
  | "SOCIAL_WORKER"
  | "SPECIAL_ED_TEACHER"
  | "COUNSELOR"
  | "OTHER";

// ==================== STUDENT TYPES ====================

export type StudentStatus = "ACTIVE" | "INACTIVE" | "GRADUATED" | "TRANSFERRED";

// ==================== TYPE INTERFACES ====================
// These mirror Prisma model types but are compatible with Convex

export interface User {
  id: string;
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  password?: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  parentRole?: string;
  status?: UserStatus;
  provider?: string;
  isOAuthUser: boolean;
  createdByAdmin?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanningDocument {
  id: string;
  title: string;
  content: string;
  subject: string;
  grade: string;
  authorId: string;
  attachments?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  scheduledDate: Date;
  scheduledTime?: string;
  duration: number;
  location?: string;
  meetingType: MeetingType;
  status: MeetingStatus;
  parentRequested: boolean;
  reason?: string;
  outcome?: string;
  notes?: string;
  followUpRequired: boolean;
  followUpNotes?: string;
  assignedTo?: string;
  studentId?: string;
  studentName?: string;
  studentGrade?: string;
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  attachments?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  description: string;
  specialties: any; // JSON array
  imageUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Legacy fields for backward compatibility
  role?: TeamMemberRole;
  specialization?: string;
  email?: string;
  phone?: string;
  bio?: string;
  availableHours?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  location?: string;
  category: EventCategory;
  priority: EventPriority;
  isRecurring: boolean;
  recurrenceRule?: string;
  color?: string;
  isActive: boolean;
  createdBy: string;
  level?: string;
  attendeeIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  type: ActivityType;
  status: ActivityStatus;
  dueDate?: Date;
  assignedBy: string;
  targetGrade?: string;
  targetLevel?: string;
  studentIds?: string[];
  attachments?: any;
  completionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  recipientId: string;
  senderId?: string;
  relatedId?: string;
  actionUrl?: string;
  createdAt: Date;
}

export interface Vote {
  id: string;
  title: string;
  description?: string;
  category: VoteCategory;
  endDate: Date;
  isActive: boolean;
  isPublic: boolean;
  allowMultipleVotes: boolean;
  maxVotesPerUser?: number;
  requireAuthentication: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== PRISMA CLIENT STUB ====================
// Stub to prevent errors in files that import PrismaClient

export class PrismaClient {
  constructor() {
    throw new Error(
      "PrismaClient is no longer used. Please use Convex client instead. Import from '@/lib/convex'"
    );
  }
}

export const Prisma = {
  // Add Prisma namespace stubs as needed
  // This is mainly for type compatibility
};