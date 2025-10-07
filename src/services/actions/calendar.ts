/**
 * Calendar Event Actions (Mutations) - Convex Implementation
 */

import { getConvexClient } from '@/lib/convex';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

export async function createCalendarEvent(data: {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  category: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
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
      category: data.category as any,
      createdBy: data.createdBy as Id<"users">,
      attendeeIds: data.attendeeIds?.map(id => id as Id<"users">),
    });

    return { success: true, data: { id: eventId } };
  } catch (error) {
    console.error('Failed to create calendar event:', error);
    return { success: false, error: 'No se pudo crear el evento' };
  }
}

export async function updateCalendarEvent(id: string, data: {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  category?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  level?: string;
  isAllDay?: boolean;
  color?: string;
  location?: string;
  isActive?: boolean;
  updatedBy: string;
}) {
  try {
    const client = getConvexClient();
    
    const updates: any = { ...data };
    if (data.startDate) updates.startDate = data.startDate.getTime();
    if (data.endDate) updates.endDate = data.endDate.getTime();
    
    await client.mutation(api.calendar.updateCalendarEvent, {
      id: id as Id<"calendarEvents">,
      ...updates,
      updatedBy: data.updatedBy as Id<"users">,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to update calendar event:', error);
    return { success: false, error: 'No se pudo actualizar el evento' };
  }
}

export async function deleteCalendarEvent(id: string) {
  try {
    const client = getConvexClient();
    await client.mutation(api.calendar.deleteCalendarEvent, {
      id: id as Id<"calendarEvents">,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to delete calendar event:', error);
    return { success: false, error: 'No se pudo eliminar el evento' };
  }
}

export async function exportCalendarEventsInFormat(format: 'json' | 'csv' | 'ics', dateRange?: { start: Date; end: Date }) {
  try {
    const client = getConvexClient();

    // Get events from Convex
    const events = await client.query(api.calendar.getCalendarEvents, {
      startDate: dateRange?.start?.getTime(),
      endDate: dateRange?.end?.getTime(),
    });

    if (!events || events.length === 0) {
      return { success: false, error: 'No events found to export' };
    }

    let exportedData: string;

    switch (format) {
      case 'json':
        exportedData = JSON.stringify(events, null, 2);
        break;

      case 'csv':
        // CSV header
        const csvHeaders = ['ID', 'Title', 'Description', 'Start Date', 'End Date', 'Category', 'Priority', 'Location', 'Is All Day'];
        const csvRows = events.map(event => [
          event.id,
          event.title,
          event.description || '',
          new Date(event.startDate).toISOString(),
          new Date(event.endDate).toISOString(),
          event.category,
          event.priority || '',
          event.location || '',
          event.isAllDay ? 'Yes' : 'No'
        ]);
        exportedData = [csvHeaders, ...csvRows].map(row =>
          row.map(field => `"${field}"`).join(',')
        ).join('\n');
        break;

      case 'ics':
        // Basic iCal format
        const icsEvents = events.map(event => {
          const startDate = new Date(event.startDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
          const endDate = new Date(event.endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

          return `BEGIN:VEVENT
UID:${event.id}@manitospintadas.cl
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
CATEGORIES:${event.category}
END:VEVENT`;
        });

        exportedData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Manitos Pintadas//Calendar Export//ES
${icsEvents.join('\n')}
END:VCALENDAR`;
        break;

      default:
        return { success: false, error: 'Unsupported export format' };
    }

    return {
      success: true,
      data: {
        content: exportedData,
        format,
        filename: `calendar-events.${format}`,
        mimeType: format === 'json' ? 'application/json' :
                 format === 'csv' ? 'text/csv' :
                 'text/calendar'
      }
    };

  } catch (error) {
    console.error('Failed to export calendar events:', error);
    return { success: false, error: 'No se pudieron exportar los eventos' };
  }
}
