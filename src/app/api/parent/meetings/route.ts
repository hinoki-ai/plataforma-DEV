import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const client = getConvexClient();

    // Check if user is a parent
    const user = await client.query(api.users.getUserByEmail, {
      email: session.user.email,
    });

    if (!user || user.role !== 'PARENT' || !user.isActive) {
      return NextResponse.json(
        { error: 'Acceso solo para padres registrados' },
        { status: 403 }
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
      description: meeting.description || 'Sin descripción',
      date: new Date(meeting.scheduledDate).toISOString(),
      status: meeting.status.toLowerCase(),
      teacher: meeting.teacherName || 'Profesor asignado',
      subject: meeting.studentGrade || 'General',
      location: meeting.location,
      studentName: meeting.studentName,
      duration: meeting.duration,
      notes: meeting.notes,
      outcome: meeting.outcome,
      followUpRequired: meeting.followUpRequired,
    }));

    return NextResponse.json({ data: transformedMeetings });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const client = getConvexClient();

    // Check if user is a parent
    const user = await client.query(api.users.getUserByEmail, {
      email: session.user.email,
    });

    if (!user || user.role !== 'PARENT' || !user.isActive) {
      return NextResponse.json(
        { error: 'Acceso solo para padres registrados' },
        { status: 403 }
      );
    }

    const { teacherId, subject, message, preferredDate, studentName } = await request.json();

    if (!teacherId || !subject || !message) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Get teacher information
    const teacher = await client.query(api.users.getUserById, {
      userId: teacherId,
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Profesor no encontrado' }, { status: 404 });
    }

    // Create meeting request
    const meetingRequest = await client.mutation(api.meetings.createMeeting, {
      title: `Solicitud de reunión: ${subject}`,
      description: message,
      studentName: studentName || 'Estudiante',
      studentGrade: subject,
      guardianName: session.user.name || 'Padre/Madre',
      guardianEmail: session.user.email,
      guardianPhone: '',
      scheduledDate: preferredDate ? new Date(preferredDate).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1000,
      scheduledTime: '10:00',
      duration: 30,
      location: 'Sala de Reuniones',
      type: 'PARENT_TEACHER',
      assignedTo: teacherId,
      reason: `Solicitud de reunión: ${message}`,
      parentRequested: true,
    });

    return NextResponse.json({
      message: 'Solicitud de reunión enviada correctamente',
      data: {
        id: meetingRequest,
        teacherId,
        subject,
        message,
        preferredDate,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating meeting request:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}