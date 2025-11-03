/**
 * Calendar Service - Consolidated
 * Unified calendar operations combining queries, mutations, and statistics
 */

import { getConvexClient } from "@/lib/convex";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type {
  CalendarQuery,
  CalendarStats,
  UnifiedCalendarEvent,
  EventCategory,
  EventPriority,
} from "./types";

// ==================== QUERIES ====================

/**
 * Get calendar events
 * NOTE: For client-side usage, use the useCalendarEvents hook from calendar-hooks.ts instead
 * This function is for server-side API routes only
 */
export async function getCalendarEvents(
  filters: {
    startDate?: Date;
    endDate?: Date;
    category?: string;
    isActive?: boolean;
  } = {},
) {
  try {
    const client = getConvexClient();

    const events = await client.query(api.calendar.getCalendarEvents, {
      startDate: filters.startDate?.getTime(),
      endDate: filters.endDate?.getTime(),
      category: filters.category as any,
      isActive: filters.isActive,
    });

    return { success: true, data: events };
  } catch (error: any) {
    console.error("Failed to fetch calendar events:", error);
    const errorMessage = error?.message || "No se pudieron cargar los eventos";
    return {
      success: false,
      error: errorMessage,
      data: [],
    };
  }
}

/**
 * Get upcoming events
 * NOTE: For client-side usage, use the useUpcomingEvents hook from calendar-hooks.ts instead
 * This function is for server-side API routes only
 */
export async function getUpcomingEvents(limit?: number) {
  try {
    const client = getConvexClient();
    const events = await client.query(api.calendar.getUpcomingEvents, {
      limit,
    });
    return { success: true, data: events };
  } catch (error: any) {
    console.error("Failed to fetch upcoming events:", error);
    const errorMessage = error?.message || "No se pudieron cargar los eventos";
    return {
      success: false,
      error: errorMessage,
      data: [],
    };
  }
}

// ==================== MUTATIONS ====================

/**
 * Create calendar event
 */
export async function createCalendarEvent(data: {
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
  createdBy: string;
  attendeeIds?: string[];
}) {
  try {
    const client = getConvexClient();

    const eventId = await client.mutation(api.calendar.createCalendarEvent, {
      ...data,
      startDate: data.startDate.getTime(),
      endDate: data.endDate.getTime(),
      category: data.category as never,
      createdBy: data.createdBy as Id<"users">,
      attendeeIds: data.attendeeIds?.map((id) => id as Id<"users">),
    });

    return { success: true, data: { id: eventId } };
  } catch (error) {
    console.error("Failed to create calendar event:", error);
    return { success: false, error: "No se pudo crear el evento" };
  }
}

/**
 * Update calendar event
 */
export async function updateCalendarEvent(
  id: string,
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
    updatedBy: string;
  },
) {
  try {
    const client = getConvexClient();

    const updates: Record<string, unknown> = { ...data };
    if (data.startDate) updates.startDate = data.startDate.getTime();
    if (data.endDate) updates.endDate = data.endDate.getTime();

    await client.mutation(api.calendar.updateCalendarEvent, {
      id: id as Id<"calendarEvents">,
      ...updates,
      updatedBy: data.updatedBy as Id<"users">,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update calendar event:", error);
    return { success: false, error: "No se pudo actualizar el evento" };
  }
}

/**
 * Delete calendar event
 */
export async function deleteCalendarEvent(id: string) {
  try {
    const client = getConvexClient();
    await client.mutation(api.calendar.deleteCalendarEvent, {
      id: id as Id<"calendarEvents">,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to delete calendar event:", error);
    return { success: false, error: "No se pudo eliminar el evento" };
  }
}

// ==================== STATISTICS ====================

/**
 * Get calendar statistics
 */
export async function getCalendarStatistics(
  query?: CalendarQuery,
): Promise<CalendarStats> {
  try {
    const client = getConvexClient();

    // Fetch all calendar events
    const events = await client.query(api.calendar.getCalendarEvents, {
      startDate: query?.startDate?.getTime(),
      endDate: query?.endDate?.getTime(),
    });

    // Calculate statistics
    const now = Date.now();
    const stats: CalendarStats = {
      total: events.length,
      upcoming: 0,
      byCategory: {},
      byPriority: {},
    };

    events.forEach(
      (event: {
        category: EventCategory;
        priority?: EventPriority;
        startDate: number;
      }) => {
        // Count by category
        const category = event.category as EventCategory;
        if (category) {
          stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
        }

        // Count by priority
        const priority = event.priority as EventPriority | undefined;
        if (priority) {
          stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
        }

        // Count upcoming events
        if (event.startDate >= now) {
          stats.upcoming++;
        }
      },
    );

    return stats;
  } catch (error: any) {
    console.error("Error getting calendar statistics:", error);
    // Return empty stats instead of throwing to prevent crashes
    return {
      total: 0,
      upcoming: 0,
      byCategory: {},
      byPriority: {},
    };
  }
}

// ==================== EXPORT FUNCTIONS ====================

/**
 * Export calendar events in various formats
 */
export async function exportCalendarEventsInFormat(
  format: "json" | "csv" | "ics",
  dateRange?: { start: Date; end: Date },
) {
  try {
    const result = await getCalendarEvents({
      startDate: dateRange?.start,
      endDate: dateRange?.end,
    });

    if (!result.success || !result.data || result.data.length === 0) {
      return { success: false, error: "No events found to export" };
    }

    const events = result.data;

    let exportedData: string;

    switch (format) {
      case "json":
        exportedData = JSON.stringify(events, null, 2);
        break;

      case "csv":
        // CSV header
        const csvHeaders = [
          "ID",
          "Title",
          "Description",
          "Start Date",
          "End Date",
          "Category",
          "Priority",
          "Location",
          "Is All Day",
        ];
        const csvRows = events.map((event: any) => [
          event._id,
          event.title,
          event.description || "",
          new Date(event.startDate).toISOString(),
          new Date(event.endDate).toISOString(),
          event.category,
          event.priority || "",
          event.location || "",
          event.isAllDay ? "Yes" : "No",
        ]);
        exportedData = [csvHeaders, ...csvRows]
          .map((row) => row.map((field: any) => `"${field}"`).join(","))
          .join("\n");
        break;

      case "ics":
        // Basic iCal format
        const icsEvents = events.map((event: any) => {
          const startDate =
            new Date(event.startDate)
              .toISOString()
              .replace(/[-:]/g, "")
              .split(".")[0] + "Z";
          const endDate =
            new Date(event.endDate)
              .toISOString()
              .replace(/[-:]/g, "")
              .split(".")[0] + "Z";

          return `BEGIN:VEVENT
UID:${event._id}@plataforma-astral.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ""}
LOCATION:${event.location || ""}
CATEGORIES:${event.category}
END:VEVENT`;
        });

        exportedData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Plataforma Astral//Calendar Export//ES
${icsEvents.join("\n")}
END:VCALENDAR`;
        break;

      default:
        return { success: false, error: "Unsupported export format" };
    }

    return {
      success: true,
      data: {
        content: exportedData,
        format,
        filename: `calendar-events.${format}`,
        mimeType:
          format === "json"
            ? "application/json"
            : format === "csv"
              ? "text/csv"
              : "text/calendar",
      },
    };
  } catch (error) {
    console.error("Failed to export calendar events:", error);
    return { success: false, error: "No se pudieron exportar los eventos" };
  }
}

// ==================== BULK OPERATIONS ====================

/**
 * Bulk create calendar events
 */
export async function bulkCreateCalendarEvents(
  events: Array<{
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
    createdBy: string;
  }>,
) {
  try {
    const results = await Promise.allSettled(
      events.map((event) => createCalendarEvent(event)),
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return {
      success: true,
      data: {
        total: events.length,
        successful,
        failed,
        message: `${successful} eventos creados, ${failed} fallaron`,
      },
    };
  } catch (error) {
    console.error("Failed to bulk create events:", error);
    return {
      success: false,
      error: "No se pudieron crear los eventos en lote",
    };
  }
}

/**
 * Mass update calendar events
 */
export async function massUpdateCalendarEvents(
  eventIds: string[],
  updates: {
    category?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    isActive?: boolean;
    updatedBy: string;
  },
) {
  try {
    const results = await Promise.allSettled(
      eventIds.map((id) => updateCalendarEvent(id, updates)),
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return {
      success: true,
      data: {
        total: eventIds.length,
        successful,
        failed,
        message: `${successful} eventos actualizados, ${failed} fallaron`,
      },
    };
  } catch (error) {
    console.error("Failed to mass update events:", error);
    return {
      success: false,
      error: "No se pudieron actualizar los eventos en lote",
    };
  }
}

/**
 * Mass delete calendar events
 */
export async function massDeleteCalendarEvents(eventIds: string[]) {
  try {
    const results = await Promise.allSettled(
      eventIds.map((id) => deleteCalendarEvent(id)),
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return {
      success: true,
      data: {
        total: eventIds.length,
        successful,
        failed,
        message: `${successful} eventos eliminados, ${failed} fallaron`,
      },
    };
  } catch (error) {
    console.error("Failed to mass delete events:", error);
    return {
      success: false,
      error: "No se pudieron eliminar los eventos en lote",
    };
  }
}

/**
 * Import calendar events from CSV
 */
export async function importCalendarEventsFromCSV(
  csvContent: string,
  createdBy: string,
) {
  try {
    // Parse CSV - simple implementation
    const lines = csvContent.trim().split("\n");
    if (lines.length < 2) {
      return { success: false, error: "CSV file is empty or invalid" };
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const events: Array<{
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
      createdBy: string;
    }> = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
      const event: {
        title?: string;
        description?: string;
        startDate?: Date;
        endDate?: Date;
        category?: string;
        priority?: "LOW" | "MEDIUM" | "HIGH";
        level?: string;
        isRecurring?: boolean;
        isAllDay?: boolean;
        color?: string;
        location?: string;
        createdBy: string;
      } = { createdBy };

      headers.forEach((header, index) => {
        if (values[index]) {
          switch (header.toLowerCase()) {
            case "title":
              event.title = values[index];
              break;
            case "description":
              event.description = values[index];
              break;
            case "start date":
            case "startdate":
              event.startDate = new Date(values[index]);
              break;
            case "end date":
            case "enddate":
              event.endDate = new Date(values[index]);
              break;
            case "category":
              event.category = values[index];
              break;
            case "priority":
              const priorityValue = values[index].toUpperCase();
              if (
                priorityValue === "LOW" ||
                priorityValue === "MEDIUM" ||
                priorityValue === "HIGH"
              ) {
                event.priority = priorityValue;
              }
              break;
            case "location":
              event.location = values[index];
              break;
            case "level":
              event.level = values[index];
              break;
            case "is all day":
            case "isallday":
              event.isAllDay =
                values[index].toLowerCase() === "yes" || values[index] === "1";
              break;
          }
        }
      });

      if (event.title && event.startDate && event.endDate && event.category) {
        events.push({
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          category: event.category,
          priority: event.priority,
          level: event.level,
          isRecurring: event.isRecurring,
          isAllDay: event.isAllDay,
          color: event.color,
          location: event.location,
          createdBy: event.createdBy,
        });
      }
    }

    if (events.length === 0) {
      return { success: false, error: "No valid events found in CSV" };
    }

    return bulkCreateCalendarEvents(events);
  } catch (error) {
    console.error("Failed to import CSV:", error);
    return {
      success: false,
      error: "No se pudieron importar los eventos desde CSV",
    };
  }
}

// ==================== CONVENIENCE EXPORTS ====================

export async function exportCalendarEventsToCSV(dateRange?: {
  start: Date;
  end: Date;
}) {
  return exportCalendarEventsInFormat("csv", dateRange);
}

export async function exportCalendarEventsToICS(dateRange?: {
  start: Date;
  end: Date;
}) {
  return exportCalendarEventsInFormat("ics", dateRange);
}

/**
 * Get current month events
 */
export async function getCurrentMonthEvents() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return getCalendarEvents({
    startDate: startOfMonth,
    endDate: endOfMonth,
  });
}

/**
 * Get events grouped by date
 */
export async function getCalendarEventsGroupedByDate(
  query: CalendarQuery = {},
) {
  const result = await getCalendarEvents(query);

  if (!result.success || !result.data) {
    return {
      success: false,
      data: undefined,
      error: result.error || "No se pudieron cargar los eventos",
    };
  }

  const grouped: Record<string, UnifiedCalendarEvent[]> = {};

  result.data.forEach((event: any) => {
    // Ensure startDate is a Date object
    const startDate = new Date(event.startDate);
    const dateKey = startDate.toISOString().split("T")[0];

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }

    // Ensure all date fields are Date objects for consistency
    const processedEvent: UnifiedCalendarEvent = {
      ...event,
      id: event._id,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      createdAt: event.createdAt ? new Date(event.createdAt) : new Date(),
      updatedAt: event.updatedAt ? new Date(event.updatedAt) : new Date(),
    };

    grouped[dateKey].push(processedEvent);
  });

  return {
    success: true,
    data: grouped,
    error: undefined,
  };
}
