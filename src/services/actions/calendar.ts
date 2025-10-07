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
