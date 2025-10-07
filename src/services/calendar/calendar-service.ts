/**
 * Calendar Service
 * Server-side calendar operations using Convex backend
 */

import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import type { CalendarQuery, CalendarStats } from './types';

/**
 * Get calendar statistics
 */
export async function getCalendarStatistics(query?: CalendarQuery): Promise<CalendarStats> {
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

    events.forEach((event) => {
      // Count by category
      const category = event.category;
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

      // Count by priority
      const priority = event.priority;
      stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;

      // Count upcoming events
      if (event.startDate >= now) {
        stats.upcoming++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting calendar statistics:', error);
    throw error;
  }
}

/**
 * Export calendar events (placeholder - actual implementation in actions)
 */
export function exportCalendarEvents() {
  throw new Error('Use calendar actions for exporting events');
}
