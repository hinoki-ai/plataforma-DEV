import { CalendarQuery, UnifiedCalendarEvent } from './types';

/**
 * Client-side calendar service for making API calls
 */
export class CalendarClientService {
  private static instance: CalendarClientService;

  private constructor() {}

  static getInstance(): CalendarClientService {
    if (!CalendarClientService.instance) {
      CalendarClientService.instance = new CalendarClientService();
    }
    return CalendarClientService.instance;
  }

  /**
   * Get calendar events via API
   */
  async getEvents(query: CalendarQuery = {}): Promise<{
    success: boolean;
    data?: UnifiedCalendarEvent[];
    error?: string;
  }> {
    try {
      const params = new URLSearchParams();

      if (query.startDate) {
        params.append('startDate', query.startDate.toISOString());
      }
      if (query.endDate) {
        params.append('endDate', query.endDate.toISOString());
      }
      if (query.categories) {
        params.append('categories', query.categories.join(','));
      }
      if (query.priority) {
        params.append('priority', query.priority);
      }
      if (query.search) {
        params.append('search', query.search);
      }

      const response = await fetch(`/api/calendar/events?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Get calendar statistics via API
   */
  async getStatistics(query: CalendarQuery = {}): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const params = new URLSearchParams();

      if (query.startDate) {
        params.append('startDate', query.startDate.toISOString());
      }
      if (query.endDate) {
        params.append('endDate', query.endDate.toISOString());
      }
      if (query.categories) {
        params.append('categories', query.categories.join(','));
      }
      if (query.priority) {
        params.append('priority', query.priority);
      }
      if (query.search) {
        params.append('search', query.search);
      }

      const response = await fetch(
        `/api/calendar/statistics?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching calendar statistics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Get current month events
   */
  async getCurrentMonthEvents(): Promise<{
    success: boolean;
    data?: UnifiedCalendarEvent[];
    error?: string;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.getEvents({
      startDate: startOfMonth,
      endDate: endOfMonth,
    });
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(count: number = 10): Promise<{
    success: boolean;
    data?: UnifiedCalendarEvent[];
    error?: string;
  }> {
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 30); // Next 30 days

    return this.getEvents({
      startDate: now,
      endDate: endDate,
    });
  }

  /**
   * Get events grouped by date
   */
  async getEventsGroupedByDate(query: CalendarQuery = {}): Promise<{
    success: boolean;
    data?: Record<string, UnifiedCalendarEvent[]>;
    error?: string;
  }> {
    const result = await this.getEvents(query);

    if (!result.success || !result.data) {
      return {
        success: false,
        data: undefined,
        error: result.error || 'No se pudieron cargar los eventos',
      };
    }

    const grouped: Record<string, UnifiedCalendarEvent[]> = {};

    result.data.forEach(event => {
      // Ensure startDate is a Date object
      const startDate = new Date(event.startDate);
      const dateKey = startDate.toISOString().split('T')[0];

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      // Ensure all date fields are Date objects for consistency
      const processedEvent = {
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        createdAt: event.createdAt ? new Date(event.createdAt) : undefined,
        updatedAt: event.updatedAt ? new Date(event.updatedAt) : undefined,
      };

      grouped[dateKey].push(processedEvent);
    });

    return {
      success: true,
      data: grouped,
      error: undefined,
    };
  }
}

// Export singleton instance
export const calendarClientService = CalendarClientService.getInstance();

// Convenience functions
export const getCalendarEventsClient = (query?: CalendarQuery) =>
  calendarClientService.getEvents(query);

export const getCalendarStatisticsClient = (query?: CalendarQuery) =>
  calendarClientService.getStatistics(query);

export const getCurrentMonthEventsClient = () =>
  calendarClientService.getCurrentMonthEvents();

export const getUpcomingEventsClient = (count?: number) =>
  calendarClientService.getUpcomingEvents(count);

export const getCalendarEventsGroupedByDateClient = (query?: CalendarQuery) =>
  calendarClientService.getEventsGroupedByDate(query);
