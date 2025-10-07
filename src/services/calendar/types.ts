/**
 * Calendar Types - Compatibility Layer
 * Provides backward-compatible types for calendar components after Convex migration
 */

import type { EventCategory, EventPriority } from '@/lib/prisma-compat-types';

// Re-export types from prisma-compat-types for backward compatibility
export type { EventCategory, EventPriority };

// Calendar Event Type
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  category: EventCategory;
  priority?: EventPriority;
  level?: string;
  isRecurring?: boolean;
  isAllDay?: boolean;
  color?: string;
  location?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Calendar Query Filters
export interface CalendarQuery {
  startDate?: Date;
  endDate?: Date;
  categories?: EventCategory[];
  search?: string;
  level?: string;
  priority?: EventPriority;
}

// Calendar Export Types
export type CalendarExportFormat = 'json' | 'csv' | 'ics' | 'JSON' | 'CSV' | 'ICAL';

export interface CalendarExportData {
  content: string;
  format: CalendarExportFormat;
  filename: string;
  mimeType: string;
}

// Unified Calendar Event (for backward compatibility)
export type UnifiedCalendarEvent = CalendarEvent;

// Recurring Event Pattern
export type RecurringPattern = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface RecurringEventData {
  pattern: RecurringPattern;
  interval: number;
  occurrences: number;
  daysOfWeek?: string[];
}

// Calendar Statistics
export interface CalendarStats {
  total: number;
  upcoming: number;
  byCategory: Partial<Record<EventCategory, number>>;
  byPriority: Partial<Record<EventPriority, number>>;
}

// Calendar Filter Options
export interface CalendarFilters {
  category?: EventCategory;
  priority?: EventPriority;
  level?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}
