/**
 * Meeting Actions (Mutations) - Convex Implementation
 */

import { getConvexClient } from '@/lib/convex';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

export async function createMeeting(data: {
  title: string;
  description?: string;
  studentName: string;
  studentGrade: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  scheduledDate: Date;
  scheduledTime: string;
  duration?: number;
  location?: string;
  type: 'PARENT_TEACHER' | 'FOLLOW_UP' | 'EMERGENCY' | 'IEP_REVIEW' | 'GRADE_CONFERENCE';
  assignedTo: string;
  reason?: string;
  parentRequested?: boolean;
  studentId?: string;
}) {
  try {
    const client = getConvexClient();
    
    const meetingId = await client.mutation(api.meetings.createMeeting, {
      ...data,
      scheduledDate: data.scheduledDate.getTime(),
      assignedTo: data.assignedTo as Id<"users">,
      studentId: data.studentId as Id<"students"> | undefined,
    });

    return { success: true, data: { id: meetingId } };
  } catch (error) {
    console.error('Failed to create meeting:', error);
    return { success: false, error: 'No se pudo crear la reunión' };
  }
}

export async function updateMeeting(id: string, data: {
  title?: string;
  description?: string;
  scheduledDate?: Date;
  scheduledTime?: string;
  duration?: number;
  location?: string;
  status?: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  notes?: string;
  outcome?: string;
  followUpRequired?: boolean;
}) {
  try {
    const client = getConvexClient();
    
    const updates: any = { ...data };
    if (data.scheduledDate) {
      updates.scheduledDate = data.scheduledDate.getTime();
    }

    await client.mutation(api.meetings.updateMeeting, {
      id: id as Id<"meetings">,
      ...updates,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to update meeting:', error);
    return { success: false, error: 'No se pudo actualizar la reunión' };
  }
}

export async function deleteMeeting(id: string) {
  try {
    const client = getConvexClient();
    await client.mutation(api.meetings.deleteMeeting, { id: id as Id<"meetings"> });
    return { success: true };
  } catch (error) {
    console.error('Failed to delete meeting:', error);
    return { success: false, error: 'No se pudo eliminar la reunión' };
  }
}

export async function cancelMeeting(id: string, reason?: string) {
  try {
    const client = getConvexClient();
    await client.mutation(api.meetings.cancelMeeting, {
      id: id as Id<"meetings">,
      reason,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to cancel meeting:', error);
    return { success: false, error: 'No se pudo cancelar la reunión' };
  }
}
