/**
 * Calendar export utilities for generating ICS files
 * Quick win for Google Calendar integration
 */

interface CalendarEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  organizer?: string;
  attendees?: string[];
}

/**
 * Generate ICS file content
 */
function generateICS(event: CalendarEvent): string {
  const formatDate = (date: Date) => {
    return (
      date.toISOString().replace(/[-:]/g, "").slice(0, 8) +
      "T" +
      date.toISOString().replace(/[-:]/g, "").slice(11, 17)
    );
  };

  const uid = `${Date.now()}@plataforma-astral.com`;
  const now = new Date();
  const created = formatDate(now);
  const start = formatDate(event.startDate);
  const end = formatDate(event.endDate);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Plataforma Institucional Astral//Sistema de Gestión//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${created}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    ...(event.location ? [`LOCATION:${event.location}`] : []),
    ...(event.organizer ? [`ORGANIZER:${event.organizer}`] : []),
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Download ICS file
 */
export function downloadICS(
  event: CalendarEvent,
  filename: string = "event.ics",
) {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate reservation meeting event
 */
export function generateReservationEvent(reservation: any) {
  const startDate = new Date(reservation.preferredDate);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

  return {
    title: `Reunión - ${reservation.studentName}`,
    description: `Reunión programada con ${reservation.guardianName} para ${reservation.studentName}. Tipo: ${reservation.meetingType}. Contacto: ${reservation.guardianEmail} - ${reservation.guardianPhone}`,
    startDate,
    endDate,
    location: "Institución Educativa",
    organizer: "plataforma.aramac.dev",
  };
}

/**
 * Generate meeting event
 */
export function generateMeetingEvent(meeting: any) {
  const startDate = new Date(`${meeting.date}T${meeting.time}`);
  const endDate = new Date(startDate.getTime() + 90 * 60 * 1000); // 1.5 hour duration

  return {
    title: meeting.title,
    description:
      meeting.description || "Reunión del Centro de Padres y Consejo Escolar",
    startDate,
    endDate,
    location:
      meeting.location || "Institución Educativa",
    organizer: "plataforma.aramac.dev",
  };
}

/**
 * Quick add to Google Calendar URL
 */
export function getGoogleCalendarUrl(event: CalendarEvent): string {
  const formatDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, "").slice(0, 8);
  const formatTime = (date: Date) =>
    date.toISOString().replace(/[-:]/g, "").slice(11, 17);

  const start = `${formatDate(event.startDate)}T${formatTime(event.startDate)}`;
  const end = `${formatDate(event.endDate)}T${formatTime(event.endDate)}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description,
    ...(event.location && { location: event.location }),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * WhatsApp calendar share link
 */
export function getWhatsAppCalendarUrl(event: CalendarEvent): string {
  const formatDate = (date: Date) => date.toLocaleDateString("es-CL");
  const formatTime = (date: Date) =>
    date.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });

  const message = `📅 ${event.title}\n\n📍 ${event.location || "Institución Educativa"}\n📅 ${formatDate(event.startDate)}\n⏰ ${formatTime(event.startDate)}\n\n${event.description}`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Quick export buttons for common use cases
 */
export const calendarButtons = {
  reservation: (reservation: any) => [
    {
      label: "Agregar a Google Calendar",
      url: getGoogleCalendarUrl(generateReservationEvent(reservation)),
      icon: "📅",
    },
    {
      label: "Descargar .ics",
      action: () =>
        downloadICS(
          generateReservationEvent(reservation),
          "reunion-plataforma-astral.ics",
        ),
      icon: "📥",
    },
    {
      label: "Compartir por WhatsApp",
      url: getWhatsAppCalendarUrl(generateReservationEvent(reservation)),
      icon: "💬",
    },
  ],

  meeting: (meeting: any) => [
    {
      label: "Agregar a Google Calendar",
      url: getGoogleCalendarUrl(generateMeetingEvent(meeting)),
      icon: "📅",
    },
    {
      label: "Descargar .ics",
      action: () =>
        downloadICS(generateMeetingEvent(meeting), "reunion-centro-padres.ics"),
      icon: "📥",
    },
  ],
};
