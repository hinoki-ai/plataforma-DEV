/**
 * Calendar Service Hooks - Client-side only
 * Uses Convex React hooks for authenticated client-side queries
 */

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type {
  CalendarQuery,
  CalendarEvent,
  UnifiedCalendarEvent,
} from "./types";

/**
 * Hook to get calendar events
 */
export function useCalendarEvents(filters: {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  isActive?: boolean;
} = {}) {
  const events = useQuery(api.calendar.getCalendarEvents, {
    startDate: filters.startDate?.getTime(),
    endDate: filters.endDate?.getTime(),
    category: filters.category as any,
    isActive: filters.isActive,
  });

  return {
    events: events ?? [],
    isLoading: events === undefined,
  };
}

/**
 * Hook to get upcoming events
 */
export function useUpcomingEvents(limit?: number) {
  const events = useQuery(api.calendar.getUpcomingEvents, { limit });
  return {
    events: events ?? [],
    isLoading: events === undefined,
  };
}

/**
 * Hook to get calendar event by ID
 */
export function useCalendarEventById(id: Id<"calendarEvents"> | null) {
  const event = useQuery(
    api.calendar.getCalendarEventById,
    id ? { id } : "skip"
  );
  return {
    event: event ?? null,
    isLoading: event === undefined && id !== null,
  };
}

/**
 * Hook to get current month events
 */
export function useCurrentMonthEvents() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return useCalendarEvents({
    startDate: startOfMonth,
    endDate: endOfMonth,
  });
}

/**
 * Hook for calendar mutations
 */
export function useCalendarMutations() {
  const createEvent = useMutation(api.calendar.createCalendarEvent);
  const updateEvent = useMutation(api.calendar.updateCalendarEvent);
  const deleteEvent = useMutation(api.calendar.deleteCalendarEvent);

  return {
    createEvent: async (data: {
      title: string;
      description?: string;
      startDate: Date;
      endDate: Date;
      category: string;
      priority?: "LOW" | "MEDIUM" | "HIGH";
      level?: string;
      isRecurring?: boolean;
      isAllDay?: boolean;
      color?: string;
      location?: string;
      createdBy: Id<"users">;
      attendeeIds?: Id<"users">[];
    }) => {
      return createEvent({
        ...data,
        startDate: data.startDate.getTime(),
        endDate: data.endDate.getTime(),
        category: data.category as any,
        createdBy: data.createdBy,
        attendeeIds: data.attendeeIds,
      });
    },
    updateEvent: async (
      id: Id<"calendarEvents">,
      data: {
        title?: string;
        description?: string;
        startDate?: Date;
        endDate?: Date;
        category?: string;
        priority?: "LOW" | "MEDIUM" | "HIGH";
        level?: string;
        isAllDay?: boolean;
        color?: string;
        location?: string;
        isActive?: boolean;
        updatedBy?: Id<"users">;
      }
    ) => {
      const updates: Record<string, unknown> = { ...data };
      if (data.startDate) updates.startDate = data.startDate.getTime();
      if (data.endDate) updates.endDate = data.endDate.getTime();
      return updateEvent({
        id,
        ...updates,
        updatedBy: data.updatedBy,
      });
    },
    deleteEvent: async (id: Id<"calendarEvents">) => {
      return deleteEvent({ id });
    },
  };
}

/**
 * Helper to compute calendar statistics from events
 */
export function useCalendarStatistics(events?: CalendarEvent[]) {
  if (!events) {
    return {
      total: 0,
      upcoming: 0,
      byCategory: {},
      byPriority: {},
    };
  }

  const now = Date.now();
  const stats = {
    total: events.length,
    upcoming: 0,
    byCategory: {} as Record<string, number>,
    byPriority: {} as Record<string, number>,
  };

  events.forEach((event) => {
    // Count by category
    if (event.category) {
      stats.byCategory[event.category] =
        (stats.byCategory[event.category] || 0) + 1;
    }

    // Count by priority
    if (event.priority) {
      stats.byPriority[event.priority] =
        (stats.byPriority[event.priority] || 0) + 1;
    }

    // Count upcoming events
    const eventStartTime =
      event.startDate instanceof Date
        ? event.startDate.getTime()
        : event.startDate;
    if (eventStartTime >= now) {
      stats.upcoming++;
    }
  });

  return stats;
}

