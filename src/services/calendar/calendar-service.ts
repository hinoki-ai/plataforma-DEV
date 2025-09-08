/**
 * Unified Calendar Service
 * Single source of truth for all calendar operations
 * Merges static Chilean calendar data with database events
 */

import { prisma } from '@/lib/db';
import { getServerSession } from '@/lib/server-auth';
import { getRoleFilter } from '@/lib/role-utils';
import {
  UnifiedCalendarEvent,
  CalendarEventInput,
  CalendarQuery,
  EventCategory,
  EventPriority,
  RecurrenceRule,
  CalendarExportFormat,
} from './types';
import { chileanHolidays } from '@/data/chilean-holidays';
import { academicCalendar } from '@/data/academic-calendar';
import { cache } from 'react';

/**
 * Unified Calendar Service Class
 * Provides type-safe, role-aware calendar operations
 */
export class CalendarService {
  private static instance: CalendarService;

  static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  /**
   * Get unified calendar events combining static and database data
   * Uses React cache for performance optimization
   */
  getEvents = cache(
    async (query: CalendarQuery = {}): Promise<UnifiedCalendarEvent[]> => {
      const session = await getServerSession();
      const { startDate, endDate, categories, priority, search } = query;

      // Get static events (Chilean holidays + academic calendar)
      const staticEvents = this.getStaticEvents(startDate, endDate, categories);

      // Get database events with role-based filtering
      const dbEvents = await this.getDatabaseEvents(session, query);

      // Merge and sort by date
      const allEvents = [...staticEvents, ...dbEvents].sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      // Apply search filter if provided
      if (search) {
        return allEvents.filter(
          event =>
            event.title.toLowerCase().includes(search.toLowerCase()) ||
            event.description?.toLowerCase().includes(search.toLowerCase())
        );
      }

      return allEvents;
    }
  );

  /**
   * Get static calendar events (holidays + academic calendar)
   * Optimized with date range filtering
   */
  private getStaticEvents(
    startDate?: Date,
    endDate?: Date,
    categories?: EventCategory[]
  ): UnifiedCalendarEvent[] {
    const events: UnifiedCalendarEvent[] = [];

    // Add Chilean holidays
    if (!categories || categories.includes('HOLIDAY')) {
      chileanHolidays.forEach(holiday => {
        const eventDate = new Date(holiday.date);
        if (this.isDateInRange(eventDate, startDate, endDate)) {
          events.push({
            id: `holiday-${holiday.id}`,
            title: holiday.name,
            description: holiday.description,
            startDate: eventDate,
            endDate: eventDate,
            category: 'HOLIDAY',
            priority: 'MEDIUM',
            isAllDay: true,
            source: 'STATIC',
            metadata: {
              isNationalHoliday: holiday.isNational,
              region: holiday.region,
            },
          });
        }
      });
    }

    // Add academic calendar events
    if (!categories || categories.includes('ACADEMIC')) {
      academicCalendar.forEach(event => {
        const eventStartDate = new Date(event.startDate);
        const eventEndDate = new Date(event.endDate);

        if (
          this.isDateInRange(eventStartDate, startDate, endDate) ||
          this.isDateInRange(eventEndDate, startDate, endDate)
        ) {
          events.push({
            id: `academic-${event.id}`,
            title: event.title,
            description: event.description,
            startDate: eventStartDate,
            endDate: eventEndDate,
            category: 'ACADEMIC',
            priority: event.priority as EventPriority,
            isAllDay: event.isAllDay || false,
            source: 'STATIC',
            metadata: {
              academicPeriod: event.period,
              gradeLevel: event.gradeLevel,
            },
          });
        }
      });
    }

    return events;
  }

  /**
   * Get database events with role-based filtering
   */
  private async getDatabaseEvents(
    session: { user?: { id: string; role: string } } | null,
    query: CalendarQuery
  ): Promise<UnifiedCalendarEvent[]> {
    const roleFilter = getRoleFilter(session?.user?.role);
    const { startDate, endDate, categories, priority } = query;

    const whereClause: Record<string, any> = {
      ...roleFilter,
      ...(startDate && {
        startDate: { gte: startDate },
      }),
      ...(endDate && {
        endDate: { lte: endDate },
      }),
      ...(categories && {
        category: { in: categories },
      }),
      ...(priority && {
        priority: priority,
      }),
    };

    try {
      const dbEvents = await prisma.calendarEvent.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          attendees: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          recurrenceRule: true,
        },
        orderBy: { startDate: 'asc' },
      });

      return dbEvents.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description || undefined,
        startDate: event.startDate,
        endDate: event.endDate,
        category: event.category,
        priority: event.priority,
        isAllDay: event.isAllDay,
        location: event.location || undefined,
        color: event.color || undefined,
        source: 'DATABASE' as const,
        authorId: event.createdBy,
        author: event.author
          ? {
              id: event.author.id,
              name: event.author.name,
              email: event.author.email,
            }
          : undefined,
        attendees:
          event.attendees?.map((attendee: any) => ({
            id: attendee.id,
            name: attendee.name,
            email: attendee.email,
          })) || [],
        attachments: event.attachments
          ? JSON.parse(event.attachments)
          : undefined,
        recurrence: event.recurrenceRule
          ? {
              pattern: event.recurrenceRule.pattern,
              interval: event.recurrenceRule.interval,
              daysOfWeek: event.recurrenceRule.daysOfWeek,
              monthOfYear: event.recurrenceRule.monthOfYear || undefined,
              weekOfMonth: event.recurrenceRule.weekOfMonth || undefined,
              endDate: event.recurrenceRule.endDate || undefined,
              occurrences: event.recurrenceRule.occurrences || undefined,
              exceptions: event.recurrenceRule.exceptions,
            }
          : undefined,
        metadata: event.metadata ? JSON.parse(event.metadata) : undefined,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      }));
    } catch (error) {
      console.error('Error fetching database events:', error);
      return [];
    }
  }

  /**
   * Create a new calendar event
   */
  async createEvent(data: CalendarEventInput): Promise<UnifiedCalendarEvent> {
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error('Authentication required');
    }

    try {
      const event = await prisma.calendarEvent.create({
        data: {
          title: data.title,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate,
          category: data.category,
          priority: data.priority || 'MEDIUM',
          isAllDay: data.isAllDay || false,
          location: data.location,
          createdBy: session.user.id,
          updatedBy: session.user.id,
          attachments: data.attachments
            ? JSON.stringify(data.attachments)
            : null,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Handle recurrence rule if provided
      if (data.recurrence) {
        await prisma.recurrenceRule.create({
          data: {
            calendarEventId: event.id,
            pattern: data.recurrence.pattern,
            interval: data.recurrence.interval,
            daysOfWeek: data.recurrence.daysOfWeek || '',
            monthOfYear: data.recurrence.monthOfYear,
            weekOfMonth: data.recurrence.weekOfMonth,
            endDate: data.recurrence.endDate,
            occurrences: data.recurrence.occurrences,
            exceptions: data.recurrence.exceptions || '',
          },
        });
      }

      // Handle attendees if provided
      if (data.attendeeIds && data.attendeeIds.length > 0) {
        await prisma.calendarEvent.update({
          where: { id: event.id },
          data: {
            attendees: {
              connect: data.attendeeIds.map(id => ({ id })),
            },
          },
        });
      }

      return this.mapDatabaseEventToUnified(event);
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(
    id: string,
    data: Partial<CalendarEventInput>
  ): Promise<UnifiedCalendarEvent> {
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error('Authentication required');
    }

    try {
      const event = await prisma.calendarEvent.update({
        where: {
          id,
          ...getRoleFilter(session.user.role),
        },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.description && { description: data.description }),
          ...(data.startDate && { startDate: data.startDate }),
          ...(data.endDate && { endDate: data.endDate }),
          ...(data.category && { category: data.category }),
          ...(data.priority && { priority: data.priority }),
          ...(data.isAllDay !== undefined && { isAllDay: data.isAllDay }),
          ...(data.location && { location: data.location }),
          ...(data.attachments && {
            attachments: JSON.stringify(data.attachments),
          }),
          ...(data.metadata && { metadata: JSON.stringify(data.metadata) }),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          attendees: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          recurrenceRule: true,
        },
      });

      return this.mapDatabaseEventToUnified(event);
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw new Error('Failed to update calendar event');
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(id: string): Promise<void> {
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error('Authentication required');
    }

    try {
      await prisma.calendarEvent.delete({
        where: {
          id,
          ...getRoleFilter(session.user.role),
        },
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw new Error('Failed to delete calendar event');
    }
  }

  /**
   * Export calendar events to various formats
   */
  async exportEvents(
    query: CalendarQuery,
    format: CalendarExportFormat
  ): Promise<string> {
    const events = await this.getEvents(query);

    switch (format) {
      case 'ICAL':
        return this.exportToICal(events);
      case 'CSV':
        return this.exportToCSV(events);
      case 'JSON':
        return JSON.stringify(events, null, 2);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Get calendar statistics
   */
  async getStatistics(query: CalendarQuery = {}): Promise<{
    totalEvents: number;
    eventsByCategory: Record<EventCategory, number>;
    eventsByPriority: Record<EventPriority, number>;
    upcomingEvents: number;
  }> {
    const events = await this.getEvents(query);
    const now = new Date();

    const stats = {
      totalEvents: events.length,
      eventsByCategory: {} as Record<EventCategory, number>,
      eventsByPriority: {} as Record<EventPriority, number>,
      upcomingEvents: events.filter(e => new Date(e.startDate) > now).length,
    };

    // Count by category
    events.forEach(event => {
      stats.eventsByCategory[event.category] =
        (stats.eventsByCategory[event.category] || 0) + 1;
      stats.eventsByPriority[event.priority] =
        (stats.eventsByPriority[event.priority] || 0) + 1;
    });

    return stats;
  }

  // Utility methods
  private isDateInRange(date: Date, startDate?: Date, endDate?: Date): boolean {
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    return true;
  }

  private mapDatabaseEventToUnified(event: any): UnifiedCalendarEvent {
    return {
      id: event.id,
      title: event.title,
      description: event.description || undefined,
      startDate: event.startDate,
      endDate: event.endDate,
      category: event.category as EventCategory,
      priority: event.priority as EventPriority,
      isAllDay: event.isAllDay,
      location: event.location,
      source: 'DATABASE',
      authorId: event.createdBy,
      author: event.author,
      attendees: event.attendees,
      attachments: event.attachments
        ? JSON.parse(event.attachments)
        : undefined,
      recurrence: event.recurrenceRule
        ? {
            pattern: event.recurrenceRule.pattern,
            interval: event.recurrenceRule.interval,
            daysOfWeek: event.recurrenceRule.daysOfWeek,
            monthOfYear: event.recurrenceRule.monthOfYear,
            weekOfMonth: event.recurrenceRule.weekOfMonth,
            endDate: event.recurrenceRule.endDate,
            occurrences: event.recurrenceRule.occurrences,
            exceptions: event.recurrenceRule.exceptions,
          }
        : undefined,
      metadata: event.metadata ? JSON.parse(event.metadata) : undefined,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  private exportToICal(events: UnifiedCalendarEvent[]): string {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Manitos Pintadas//Calendar//ES',
      'CALSCALE:GREGORIAN',
    ];

    events.forEach(event => {
      lines.push(
        'BEGIN:VEVENT',
        `UID:${event.id}@manitospintadas.cl`,
        `DTSTART:${this.formatDateForICal(event.startDate)}`,
        `DTEND:${this.formatDateForICal(event.endDate)}`,
        `SUMMARY:${event.title}`,
        ...(event.description ? [`DESCRIPTION:${event.description}`] : []),
        ...(event.location ? [`LOCATION:${event.location}`] : []),
        `CATEGORIES:${event.category}`,
        `PRIORITY:${this.mapPriorityToICal(event.priority)}`,
        'END:VEVENT'
      );
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  private exportToCSV(events: UnifiedCalendarEvent[]): string {
    const headers = [
      'Título',
      'Descripción',
      'Fecha Inicio',
      'Fecha Fin',
      'Categoría',
      'Prioridad',
      'Todo el día',
      'Ubicación',
      'Autor',
    ];

    const rows = events.map(event => [
      event.title,
      event.description || '',
      event.startDate.toISOString(),
      event.endDate.toISOString(),
      event.category,
      event.priority,
      event.isAllDay ? 'Sí' : 'No',
      event.location || '',
      event.author?.name || '',
    ]);

    return [headers, ...rows]
      .map(row =>
        row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');
  }

  private formatDateForICal(date: Date): string {
    return date
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
  }

  private mapPriorityToICal(priority: EventPriority): string {
    const priorityMap = {
      LOW: '9',
      MEDIUM: '5',
      HIGH: '1',
    };
    return priorityMap[priority] || '5';
  }
}

// Export singleton instance
export const calendarService = CalendarService.getInstance();

// Convenience functions for common operations
export const getCalendarEvents = (query?: CalendarQuery) =>
  calendarService.getEvents(query);

export const createCalendarEvent = (data: CalendarEventInput) =>
  calendarService.createEvent(data);

export const updateCalendarEvent = (
  id: string,
  data: Partial<CalendarEventInput>
) => calendarService.updateEvent(id, data);

export const deleteCalendarEvent = (id: string) =>
  calendarService.deleteEvent(id);

export const exportCalendarEvents = (
  query: CalendarQuery,
  format: CalendarExportFormat
) => calendarService.exportEvents(query, format);

export const getCalendarStatistics = (query?: CalendarQuery) =>
  calendarService.getStatistics(query);
