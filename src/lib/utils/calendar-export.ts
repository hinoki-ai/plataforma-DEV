/**
 * Calendar Export Utilities
 * Provides functionality to export calendar events in various formats
 */

import { format } from "date-fns";
import {
  chileanCalendarEvents,
  CalendarEvent,
  EventCategory,
} from "@/data/calendario/chilean-calendar-2025";

// iCalendar format constants
const ICAL_DATE_FORMAT = "yyyyMMdd";
const ICAL_DATETIME_FORMAT = "yyyyMMddTHHmmss";

/**
 * Escape special characters for iCalendar format
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}

/**
 * Generate iCalendar VEVENT for a single calendar event
 */
function generateICalEvent(event: CalendarEvent): string {
  const eventDate = new Date(event.date);
  const startDate = format(eventDate, ICAL_DATE_FORMAT);
  const endDate = format(
    new Date(eventDate.getTime() + 24 * 60 * 60 * 1000),
    ICAL_DATE_FORMAT,
  ); // Next day for all-day events

  // Generate unique UID
  const uid = `${event.id}@manitospintadas.cl`;

  // Create timestamp
  const now = new Date();
  const timestamp = format(now, ICAL_DATETIME_FORMAT) + "Z";

  // Category mapping for iCalendar CATEGORIES
  const categoryMap: Record<EventCategory, string> = {
    academic: "EDUCATION,ACADEMIC",
    holiday: "HOLIDAY,PERSONAL",
    special: "CELEBRATION,EDUCATION",
    parent: "MEETING,EDUCATION",
  };

  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${timestamp}`,
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${escapeICalText(event.title)}`,
    ...(event.description
      ? [`DESCRIPTION:${escapeICalText(event.description)}`]
      : []),
    `CATEGORIES:${categoryMap[event.category]}`,
    ...(event.level ? [`X-EDUCATION-LEVEL:${event.level}`] : []),
    "TRANSP:TRANSPARENT", // All-day events are typically transparent
    "STATUS:CONFIRMED",
    "CLASS:PUBLIC",
    "LOCATION:Escuela Especial de Lenguaje Manitos Pintadas\\, Chile",
    "ORGANIZER;CN=Manitos Pintadas:mailto:contacto@manitospintadas.cl",
    "END:VEVENT",
  ];

  return lines.join("\r\n");
}

/**
 * Generate complete iCalendar file content
 */
export function generateICalendar(
  events: CalendarEvent[] = chileanCalendarEvents,
  selectedCategories?: EventCategory[],
): string {
  // Filter events by selected categories if provided
  const filteredEvents = selectedCategories
    ? events.filter((event) => selectedCategories.includes(event.category))
    : events;

  const calendarName = "Calendario Escolar 2025 - Manitos Pintadas";
  const calendarDescription =
    "Calendario oficial de la Escuela Especial de Lenguaje Manitos Pintadas para el año escolar 2025. Incluye fechas académicas, feriados, eventos especiales y actividades para padres.";

  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Manitos Pintadas//Calendario Escolar 2025//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeICalText(calendarName)}`,
    `X-WR-CALDESC:${escapeICalText(calendarDescription)}`,
    "X-WR-TIMEZONE:America/Santiago",
    "BEGIN:VTIMEZONE",
    "TZID:America/Santiago",
    "BEGIN:STANDARD",
    "DTSTART:20250406T030000",
    "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=1SU",
    "TZNAME:CLST",
    "TZOFFSETFROM:-0300",
    "TZOFFSETTO:-0400",
    "END:STANDARD",
    "BEGIN:DAYLIGHT",
    "DTSTART:20250907T040000",
    "RRULE:FREQ=YEARLY;BYMONTH=9;BYDAY=1SU",
    "TZNAME:CLT",
    "TZOFFSETFROM:-0400",
    "TZOFFSETTO:-0300",
    "END:DAYLIGHT",
    "END:VTIMEZONE",
  ];

  const footer = ["END:VCALENDAR"];

  const eventStrings = filteredEvents.map(generateICalEvent);

  return [...header, ...eventStrings, ...footer].join("\r\n");
}

/**
 * Download iCalendar file
 */
export function downloadICalendar(
  selectedCategories?: EventCategory[],
  filename: string = "calendario-escolar-2025-manitos-pintadas.ics",
): void {
  // Ensure this only runs on the client
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const icalContent = generateICalendar(
    chileanCalendarEvents,
    selectedCategories,
  );

  const blob = new Blob([icalContent], {
    type: "text/calendar;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Generate calendar statistics
 */
export function generateCalendarStats(
  events: CalendarEvent[] = chileanCalendarEvents,
  selectedCategories?: EventCategory[],
): {
  totalEvents: number;
  categoryCounts: Record<EventCategory, number>;
  monthCounts: Record<string, number>;
  levelCounts: Record<string, number>;
} {
  const filteredEvents = selectedCategories
    ? events.filter((event) => selectedCategories.includes(event.category))
    : events;

  const categoryCounts: Record<EventCategory, number> = {
    academic: 0,
    holiday: 0,
    special: 0,
    parent: 0,
  };

  const monthCounts: Record<string, number> = {};
  const levelCounts: Record<string, number> = {
    NT1: 0,
    NT2: 0,
    both: 0,
    general: 0,
  };

  filteredEvents.forEach((event) => {
    // Count by category
    categoryCounts[event.category]++;

    // Count by month
    const eventDate = new Date(event.date);
    const monthKey = format(eventDate, "MMMM yyyy");
    monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;

    // Count by level
    const level = event.level || "general";
    levelCounts[level]++;
  });

  return {
    totalEvents: filteredEvents.length,
    categoryCounts,
    monthCounts,
    levelCounts,
  };
}

/**
 * Generate human-readable calendar summary
 */
export function generateCalendarSummary(
  selectedCategories?: EventCategory[],
): string {
  const stats = generateCalendarStats(
    chileanCalendarEvents,
    selectedCategories,
  );

  const categoryLabels: Record<EventCategory, string> = {
    academic: "eventos académicos",
    holiday: "feriados",
    special: "eventos especiales",
    parent: "actividades para padres",
  };

  const summary = [
    `Calendario Escolar 2025 - Escuela Especial de Lenguaje Manitos Pintadas`,
    ``,
    `Total de eventos: ${stats.totalEvents}`,
    ``,
    `Por categoría:`,
    ...Object.entries(stats.categoryCounts)
      .filter(([, count]) => count > 0)
      .map(
        ([category, count]) =>
          `• ${categoryLabels[category as EventCategory]}: ${count}`,
      ),
    ``,
    `Niveles educativos:`,
    `• NT1 (Pre-Kinder): ${stats.levelCounts.NT1} eventos específicos`,
    `• NT2 (Kinder): ${stats.levelCounts.NT2} eventos específicos`,
    `• Ambos niveles: ${stats.levelCounts.both} eventos`,
    `• Eventos generales: ${stats.levelCounts.general} eventos`,
    ``,
    `Este calendario incluye todas las fechas importantes del año escolar 2025,`,
    `incluyendo el inicio de clases (5 de marzo), vacaciones de invierno (20 de junio`,
    `al 7 de julio), fiestas patrias, y el término del año escolar (19 de diciembre).`,
    ``,
    `Para más información, visite: https://manitospintadas.cl`,
    `Contacto: contacto@manitospintadas.cl`,
  ];

  return summary.join("\n");
}
