"use server";

import { exportCalendarEventsInFormat } from "@/services/calendar/calendar-service";

/**
 * Server action wrapper for exporting calendar events
 * This allows client components to call the export function without
 * importing server-only code directly
 */
export async function exportCalendarEventsAction(
  format: "json" | "csv" | "ics",
  dateRange?: { start: Date; end: Date },
) {
  return exportCalendarEventsInFormat(format, dateRange);
}

