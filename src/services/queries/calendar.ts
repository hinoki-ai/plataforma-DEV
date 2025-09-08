/**
 * Calendar Query Service - Enhanced with Unified Service
 * Type-safe query operations for calendar data using unified service
 */

import { cache } from 'react';
import { getServerSession } from '@/lib/server-auth';
import { prisma } from '@/lib/db';
import {
  calendarService,
  getCalendarEvents as getUnifiedEvents,
} from '../calendar/calendar-service';
import { CalendarQuery, UnifiedCalendarEvent } from '../calendar/types';

// Enhanced calendar events with unified service and caching
export const getCalendarEvents = cache(
  async (
    query: CalendarQuery = {}
  ): Promise<{
    success: boolean;
    data?: UnifiedCalendarEvent[];
    error?: string;
  }> => {
    try {
      const events = await getUnifiedEvents(query);
      return { success: true, data: events };
    } catch (error) {
      console.error('Error getting calendar events:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
);

// Enhanced date range query with unified service
export const getCalendarEventsByDateRange = cache(
  async (
    startDate: Date,
    endDate: Date
  ): Promise<{
    success: boolean;
    data?: UnifiedCalendarEvent[];
    error?: string;
  }> => {
    try {
      const events = await getUnifiedEvents({ startDate, endDate });
      return { success: true, data: events };
    } catch (error) {
      console.error('Error getting calendar events by date range:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
);

// Enhanced category query with unified service
export const getCalendarEventsByCategory = cache(
  async (
    category: string
  ): Promise<{
    success: boolean;
    data?: UnifiedCalendarEvent[];
    error?: string;
  }> => {
    try {
      const events = await getUnifiedEvents({ categories: [category as any] });
      return { success: true, data: events };
    } catch (error) {
      console.error('Error getting calendar events by category:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
);

// Enhanced upcoming events with unified service
export const getUpcomingEvents = cache(
  async (
    limit: number = 10
  ): Promise<{
    success: boolean;
    data?: UnifiedCalendarEvent[];
    error?: string;
  }> => {
    try {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + 30);

      const events = await getUnifiedEvents({
        startDate: now,
        endDate: futureDate,
      });
      const upcomingEvents = events
        .filter(event => new Date(event.startDate) > now)
        .slice(0, limit);

      return { success: true, data: upcomingEvents };
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
);

// Enhanced today's events with unified service
export const getTodaysEvents = cache(
  async (): Promise<{
    success: boolean;
    data?: UnifiedCalendarEvent[];
    error?: string;
  }> => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const events = await getUnifiedEvents({
        startDate: today,
        endDate: tomorrow,
      });
      return { success: true, data: events };
    } catch (error) {
      console.error("Error getting today's events:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
);

// Enhanced monthly events with unified service
export const getCalendarEventsByMonth = cache(
  async (
    year: number,
    month: number
  ): Promise<{
    success: boolean;
    data?: UnifiedCalendarEvent[];
    error?: string;
  }> => {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const events = await getUnifiedEvents({ startDate, endDate });
      return { success: true, data: events };
    } catch (error) {
      console.error('Error getting calendar events by month:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
);

// Enhanced single event retrieval
export const getCalendarEventById = cache(
  async (
    id: string
  ): Promise<{
    success: boolean;
    data?: UnifiedCalendarEvent;
    error?: string;
  }> => {
    try {
      const events = await getUnifiedEvents();
      const event = events.find(e => e.id === id);

      if (!event) {
        return { success: false, error: 'Evento no encontrado' };
      }

      return { success: true, data: event };
    } catch (error) {
      console.error('Error getting calendar event by ID:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
);

// Enhanced statistics with unified service
export const getCalendarStatistics = cache(
  async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const stats = await calendarService.getStatistics();
      return { success: true, data: stats };
    } catch (error) {
      console.error('Error getting calendar statistics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
);

// Additional enhanced queries for better functionality
export const getCurrentMonthEvents = cache(
  async (): Promise<UnifiedCalendarEvent[]> => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return getUnifiedEvents({ startDate, endDate });
  }
);

export const searchCalendarEvents = cache(
  async (
    searchTerm: string,
    limit: number = 20
  ): Promise<UnifiedCalendarEvent[]> => {
    const events = await getUnifiedEvents({ search: searchTerm });
    return events.slice(0, limit);
  }
);

export const getCalendarEventsGroupedByDate = cache(
  async (
    query: CalendarQuery = {}
  ): Promise<Record<string, UnifiedCalendarEvent[]>> => {
    const events = await getUnifiedEvents(query);
    const grouped: Record<string, UnifiedCalendarEvent[]> = {};

    events.forEach(event => {
      const dateKey = new Date(event.startDate).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  }
);
