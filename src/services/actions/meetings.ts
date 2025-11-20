"use server";

/**
 * Meeting Actions (Mutations) - Convex Implementation
 */

import { getAuthenticatedConvexClient } from "@/lib/convex-server";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

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
  type:
    | "PARENT_TEACHER"
    | "FOLLOW_UP"
    | "EMERGENCY"
    | "IEP_REVIEW"
    | "GRADE_CONFERENCE";
  assignedTo: string;
  reason?: string;
  parentRequested?: boolean;
  studentId?: string;
}) {
  try {
    const client = await getAuthenticatedConvexClient();

    const meetingId = await client.mutation(api.meetings.createMeeting, {
      ...data,
      scheduledDate: data.scheduledDate.getTime(),
      assignedTo: data.assignedTo as Id<"users">,
      studentId: data.studentId as Id<"students"> | undefined,
    });

    return { success: true, data: { id: meetingId } };
  } catch (error) {
    return { success: false, error: "No se pudo crear la reunión" };
  }
}

export async function updateMeeting(
  id: string,
  data: {
    title?: string;
    description?: string;
    scheduledDate?: Date;
    scheduledTime?: string;
    duration?: number;
    location?: string;
    status?:
      | "SCHEDULED"
      | "CONFIRMED"
      | "IN_PROGRESS"
      | "COMPLETED"
      | "CANCELLED"
      | "RESCHEDULED";
    notes?: string;
    outcome?: string;
    followUpRequired?: boolean;
  },
) {
  try {
    const client = await getAuthenticatedConvexClient();

    const updates: Record<string, unknown> = { ...data };
    if (data.scheduledDate) {
      updates.scheduledDate = data.scheduledDate.getTime();
    }

    await client.mutation(api.meetings.updateMeeting, {
      id: id as Id<"meetings">,
      ...updates,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo actualizar la reunión" };
  }
}

export async function deleteMeeting(id: string) {
  try {
    const client = await getAuthenticatedConvexClient();
    await client.mutation(api.meetings.deleteMeeting, {
      id: id as Id<"meetings">,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo eliminar la reunión" };
  }
}

export async function cancelMeeting(id: string, reason?: string) {
  try {
    const client = await getAuthenticatedConvexClient();
    await client.mutation(api.meetings.cancelMeeting, {
      id: id as Id<"meetings">,
      reason,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo cancelar la reunión" };
  }
}

// Query functions for components
export async function getMeetingsAction() {
  try {
    const client = await getAuthenticatedConvexClient();
    const meetings = await client.query(api.meetings.getMeetings, {});
    return { success: true, data: meetings };
  } catch (error) {
    return { success: false, error: "No se pudieron obtener las reuniones" };
  }
}

export async function getMeetingsByTeacherAction(teacherId: string) {
  try {
    // Validate teacherId before making the query
    if (!teacherId || teacherId.trim() === "") {
      return {
        success: false,
        error: "ID de profesor es requerido",
      };
    }

    const client = await getAuthenticatedConvexClient();
    const meetings = await client.query(api.meetings.getMeetingsByTeacher, {
      teacherId: teacherId as Id<"users">,
    });
    return { success: true, data: meetings };
  } catch (error) {
    return {
      success: false,
      error: "No se pudieron obtener las reuniones del profesor",
    };
  }
}

export async function getMeetingsByParentAction(parentId: string) {
  try {
    const client = await getAuthenticatedConvexClient();
    const meetings = await client.query(api.meetings.getMeetingsByParent, {
      parentId: parentId as Id<"users">,
    });
    return { success: true, data: meetings };
  } catch (error) {
    return {
      success: false,
      error: "No se pudieron obtener las reuniones del padre",
    };
  }
}

export async function getMeetingStatsAction() {
  try {
    const client = await getAuthenticatedConvexClient();
    const stats = await client.query(api.meetings.getMeetingStats, {});
    return { success: true, data: stats };
  } catch (error) {
    return {
      success: false,
      error: "No se pudieron obtener las estadísticas de reuniones",
    };
  }
}

export async function getParentMeetingRequestsAction() {
  try {
    const client = await getAuthenticatedConvexClient();
    const requests = await client.query(
      api.meetings.getParentMeetingRequests,
      {},
    );
    return { success: true, data: requests };
  } catch (error) {
    return {
      success: false,
      error: "No se pudieron obtener las solicitudes de reuniones",
    };
  }
}

export async function getUpcomingMeetingsAction() {
  try {
    const client = await getAuthenticatedConvexClient();
    const meetings = await client.query(api.meetings.getUpcomingMeetings, {});
    return { success: true, data: meetings };
  } catch (error) {
    return {
      success: false,
      error: "No se pudieron obtener las reuniones próximas",
    };
  }
}

export async function requestMeeting(data: {
  studentName: string;
  studentGrade: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  preferredDate: Date;
  preferredTime: string;
  reason: string;
  type:
    | "PARENT_TEACHER"
    | "FOLLOW_UP"
    | "EMERGENCY"
    | "IEP_REVIEW"
    | "GRADE_CONFERENCE";
  teacherId?: string;
}) {
  try {
    const client = await getAuthenticatedConvexClient();

    const meetingId = await client.mutation(api.meetings.requestMeeting, {
      ...data,
      preferredDate: data.preferredDate.getTime(),
      teacherId: data.teacherId as Id<"users"> | undefined,
    });

    return { success: true, data: { id: meetingId } };
  } catch (error) {
    return { success: false, error: "No se pudo solicitar la reunión" };
  }
}

export async function updateMeetingStatus(
  id: string,
  status:
    | "SCHEDULED"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "RESCHEDULED",
  notes?: string,
) {
  try {
    const client = await getAuthenticatedConvexClient();
    await client.mutation(api.meetings.updateMeeting, {
      id: id as Id<"meetings">,
      status,
      notes,
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "No se pudo actualizar el estado de la reunión",
    };
  }
}
