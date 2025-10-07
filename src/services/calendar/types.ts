/**
 * Unified Calendar Types
 * Type-safe interfaces for all calendar operations
 */

import { Prisma } from '@/lib/prisma-compat-types';

// Core event categories that map to both static and database events
export type EventCategory =
  | 'ACADEMIC'
  | 'HOLIDAY'
  | 'SPECIAL'
  | 'PARENT'
  | 'ADMINISTRATIVE'
  | 'EXAM'
  | 'MEETING'
  | 'VACATION'
  | 'EVENT'
  | 'DEADLINE'
  | 'OTHER';

// Event priority levels
export type EventPriority = 'LOW' | 'MEDIUM' | 'HIGH';

// Educational levels for the school
export type EducationLevel = 'NT1' | 'NT2' | 'both' | 'all';

// Event source to distinguish between static and database events
export type EventSource = 'STATIC' | 'DATABASE';

// User roles for access control
export type UserRole = 'MASTER' | 'ADMIN' | 'PROFESOR' | 'PARENT' | 'PUBLIC';

// Recurrence patterns for repeating events
export type RecurrencePattern =
  | 'NONE'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'YEARLY'
  | 'CUSTOM';

// Calendar export formats
export type CalendarExportFormat = 'CSV' | 'ICAL' | 'JSON';

/**
 * Unified Calendar Event interface
 * This interface unifies both static Chilean calendar events and database events
 */
export interface UnifiedCalendarEvent {
  // Core event data
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;

  // Categorization
  category: EventCategory;
  priority: EventPriority;

  // Source and editability
  source: EventSource;

  // Optional fields
  location?: string;
  color?: string;
  isAllDay: boolean;

  // Author and attendees (for database events)
  authorId?: string;
  author?: {
    id: string;
    name: string | null;
    email: string;
  };
  attendees?: {
    id: string;
    name: string | null;
    email: string;
  }[];

  // Additional data
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];

  // Recurrence
  recurrence?: RecurrenceRule;

  // Metadata
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Recurrence rule interface
 */
export interface RecurrenceRule {
  pattern: RecurrencePattern;
  interval: number;
  daysOfWeek?: string; // Comma-separated day codes
  monthOfYear?: number;
  weekOfMonth?: number;
  endDate?: Date;
  occurrences?: number;
  exceptions?: string; // Comma-separated exception dates
}

/**
 * Calendar event template interface
 */
export interface CalendarEventTemplate {
  id: string;
  name: string;
  title: string;
  description?: string;
  category: EventCategory;
  level: EducationLevel;
  color?: string;
  duration: number; // in minutes
  isAllDay: boolean;
  recurrence?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Calendar query interface - matches calendar-service.ts implementation
 */
export interface CalendarQuery {
  categories?: EventCategory[];
  startDate?: Date;
  endDate?: Date;
  search?: string;
  priority?: EventPriority;
}

/**
 * Calendar statistics interface - matches calendar-service.ts implementation
 */
export interface CalendarStatistics {
  totalEvents: number;
  eventsByCategory: Record<EventCategory, number>;
  eventsByPriority: Record<EventPriority, number>;
  upcomingEvents: number;
}

/**
 * Calendar operation result
 */
export interface CalendarResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    total?: number;
    filtered?: number;
    cached?: boolean;
    queryTime?: number;
  };
}

/**
 * Calendar event creation/update data - matches calendar-service.ts implementation
 */
export interface CalendarEventInput {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  category: EventCategory;
  priority?: EventPriority;
  isAllDay?: boolean;
  isRecurring?: boolean;
  location?: string;
  attendeeIds?: string[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  recurrence?: RecurrenceRule;
  metadata?: Record<string, any>;
}

/**
 * Calendar event bulk operations
 */
export interface BulkCalendarOperation {
  type: 'create' | 'update' | 'delete' | 'duplicate';
  eventIds?: string[];
  data?: Partial<CalendarEventInput>;
  events?: CalendarEventInput[];
}

// Remove CalendarExportOptions - replaced by CalendarExportFormat

// Calendar import options remain the same
export interface CalendarImportOptions {
  format: 'csv' | 'ics' | 'json';
  data: string | File;
  validateOnly?: boolean;
  overwriteExisting?: boolean;
  defaultCategory?: EventCategory;
  defaultLevel?: EducationLevel;
}

/**
 * Calendar conflict detection
 */
export interface CalendarConflict {
  type: 'overlap' | 'duplicate' | 'resource' | 'schedule';
  severity: 'low' | 'medium' | 'high' | 'critical';
  eventId: string;
  conflictingEventId: string;
  message: string;
  suggestions?: string[];
}

/**
 * Calendar notification settings
 */
export interface CalendarNotification {
  eventId: string;
  type: 'email' | 'push' | 'sms';
  timing: 'immediate' | '15min' | '1hour' | '1day' | '1week';
  enabled: boolean;
  recipients?: string[];
}

/**
 * Type-safe Prisma includes for calendar events
 */
export const CalendarEventIncludes = {
  minimal: {
    user: {
      select: {
        name: true,
        email: true,
      },
    },
  },
  full: {
    recurrenceRule: true,
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    },
  },
} as const;

/**
 * Type for database calendar events with includes
 */
export type DatabaseCalendarEventWithUser = Prisma.CalendarEventGetPayload<{
  include: typeof CalendarEventIncludes.full;
}>;

// Remove ChileanCalendarEvent - now using separate data files

/**
 * Category mapping between static and database formats
 */
export const CategoryMapping: Record<string, EventCategory> = {
  academic: 'ACADEMIC',
  holiday: 'HOLIDAY',
  special: 'SPECIAL',
  parent: 'PARENT',
  administrative: 'ADMINISTRATIVE',
  exam: 'EXAM',
  meeting: 'MEETING',
  vacation: 'VACATION',
  event: 'EVENT',
  deadline: 'DEADLINE',
  other: 'OTHER',
} as const;

/**
 * Reverse category mapping for export
 */
export const ReverseCategoryMapping: Record<EventCategory, string> = {
  ACADEMIC: 'academic',
  HOLIDAY: 'holiday',
  SPECIAL: 'special',
  PARENT: 'parent',
  ADMINISTRATIVE: 'administrative',
  EXAM: 'exam',
  MEETING: 'meeting',
  VACATION: 'vacation',
  EVENT: 'event',
  DEADLINE: 'deadline',
  OTHER: 'other',
} as const;

/**
 * Category display labels
 */
export const CategoryLabels: Record<EventCategory, string> = {
  ACADEMIC: 'Académico',
  HOLIDAY: 'Feriado',
  SPECIAL: 'Evento Especial',
  PARENT: 'Actividad Padres',
  ADMINISTRATIVE: 'Administrativo',
  EXAM: 'Examen',
  MEETING: 'Reunión',
  VACATION: 'Vacaciones',
  EVENT: 'Eventos',
  DEADLINE: 'Fechas Límite',
  OTHER: 'Otros',
} as const;

/**
 * Category colors for UI
 */
export const CategoryColors: Record<
  EventCategory,
  {
    bg: string;
    text: string;
    border: string;
    accent: string;
  }
> = {
  ACADEMIC: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    accent: 'bg-blue-500',
  },
  HOLIDAY: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
    accent: 'bg-red-500',
  },
  SPECIAL: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    accent: 'bg-purple-500',
  },
  PARENT: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
    accent: 'bg-green-500',
  },
  ADMINISTRATIVE: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
    accent: 'bg-orange-500',
  },
  EXAM: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800',
    accent: 'bg-yellow-500',
  },
  MEETING: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
    accent: 'bg-indigo-500',
  },
  VACATION: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-800',
    accent: 'bg-cyan-500',
  },
  EVENT: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    accent: 'bg-emerald-500',
  },
  DEADLINE: {
    bg: 'bg-pink-50 dark:bg-pink-950/30',
    text: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-200 dark:border-pink-800',
    accent: 'bg-pink-500',
  },
  OTHER: {
    bg: 'bg-gray-50 dark:bg-gray-950/30',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-800',
    accent: 'bg-gray-500',
  },
} as const;
