/**
 * Calendar Event Queries - Convex Implementation
 */

import { getConvexClient } from '@/lib/convex';
import { api } from '../../../convex/_generated/api';

export async function getCalendarEvents(filters: {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  isActive?: boolean;
} = {}) {
  try {
    const client = getConvexClient();
    
    const events = await client.query(api.calendar.getCalendarEvents, {
      startDate: filters.startDate?.getTime(),
      endDate: filters.endDate?.getTime(),
      category: filters.category as any,
      isActive: filters.isActive,
    });

    return { success: true, data: events };
  } catch (error) {
    console.error('Failed to fetch calendar events:', error);
    return { success: false, error: 'No se pudieron cargar los eventos', data: [] };
  }
}

export async function getUpcomingEvents(limit?: number) {
  try {
    const client = getConvexClient();
    const events = await client.query(api.calendar.getUpcomingEvents, { limit });
    return { success: true, data: events };
  } catch (error) {
    console.error('Failed to fetch upcoming events:', error);
    return { success: false, error: 'No se pudieron cargar los eventos', data: [] };
  }
}
