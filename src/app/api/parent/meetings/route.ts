import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAuthenticatedConvexClient } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const client = await getAuthenticatedConvexClient();

    // Check if user is a parent
    const user = await client.query(api.users.getUserByEmail, {
      email: session.user.email,
    });

    if (!user || user.role !== "PARENT" || !user.isActive) {
      return NextResponse.json(
        { error: "Acceso solo para padres registrados" },
        { status: 403 },
      );
    }

    // Get meetings for this parent
    const result = await client.query(api.meetings.getMeetingsByGuardian, {
      guardianEmail: session.user.email,
    });

    const meetings = result;

    // Transform to expected format
    const transformedMeetings = meetings.map((meeting: any) => ({
      id: meeting._id,
      title: meeting.title,
      description: meeting.description || "Sin descripción",
      date: new Date(meeting.scheduledDate).toISOString(),
      status: meeting.status.toLowerCase(),
      teacher: meeting.teacher?.name || "Profesor asignado",
      subject: meeting.studentGrade || "General",
      location: meeting.location,
      studentName: meeting.studentName,
      duration: meeting.duration,
      notes: meeting.notes,
      outcome: meeting.outcome,
      followUpRequired: meeting.followUpRequired,
    }));

    return NextResponse.json({ data: transformedMeetings });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const client = await getAuthenticatedConvexClient();

    // Check if user is a parent
    const user = await client.query(api.users.getUserByEmail, {
      email: session.user.email,
    });

    if (!user || user.role !== "PARENT" || !user.isActive) {
      return NextResponse.json(
        { error: "Acceso solo para padres registrados" },
        { status: 403 },
      );
    }

    const {
      teacherId,
      subject,
      message,
      preferredDate,
      preferredTime,
      studentName,
      studentGrade,
      guardianPhone,
    } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Debes indicar el motivo de la reunión" },
        { status: 400 },
      );
    }

    const effectivePreferredDate = preferredDate
      ? new Date(preferredDate).getTime()
      : Date.now() + 7 * 24 * 60 * 60 * 1000;

    const effectivePreferredTime = preferredTime || "10:00";

    const effectiveStudentGrade = studentGrade || subject || "General";

    const meetingRequest = await client.mutation(api.meetings.requestMeeting, {
      studentName: studentName || "Estudiante",
      studentGrade: effectiveStudentGrade,
      guardianName: session.user.name || user.name || "Padre/Madre",
      guardianEmail: session.user.email,
      guardianPhone: guardianPhone || user.phone || "",
      preferredDate: effectivePreferredDate,
      preferredTime: effectivePreferredTime,
      reason: message,
      type: "PARENT_TEACHER",
      teacherId: teacherId ? (teacherId as Id<"users">) : undefined,
    });

    return NextResponse.json({
      message: "Solicitud de reunión enviada correctamente",
      data: {
        id: meetingRequest,
        teacherId: teacherId ?? null,
        subject: effectiveStudentGrade,
        message,
        preferredDate: new Date(effectivePreferredDate).toISOString(),
        preferredTime: effectivePreferredTime,
        status: "scheduled",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating meeting request:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
