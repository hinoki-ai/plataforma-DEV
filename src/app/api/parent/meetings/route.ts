import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if user is a parent
    const user = await db.user.findFirst({
      where: {
        email: session.user.email,
        role: 'PARENT',
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Acceso solo para padres registrados' },
        { status: 403 }
      );
    }

    // Get real meetings for this parent from the database
    const meetings = await db.meeting.findMany({
      where: {
        guardianEmail: session.user.email,
        guardianPhone: '',
      },
      include: {
        teacher: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { scheduledDate: 'desc' },
    });

    // Transform to expected format
    const transformedMeetings = meetings.map(meeting => ({
      id: meeting.id,
      title: meeting.title,
      description: meeting.description || 'Sin descripción',
      date: meeting.scheduledDate.toISOString(),
      status: meeting.status.toLowerCase(),
      teacher: meeting.teacher?.name || 'Profesor asignado',
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

    // Check if user is a parent
    const user = await db.user.findFirst({
      where: {
        email: session.user.email,
        role: 'PARENT',
        isActive: true,
      },
    });

    if (!user) {
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
    const teacher = await db.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Profesor no encontrado' }, { status: 404 });
    }

    // Create meeting request in database
    const meetingRequest = await db.meeting.create({
      data: {
        title: `Solicitud de reunión: ${subject}`,
        description: message,
        studentName: studentName || 'Estudiante',
        studentGrade: subject,
        guardianName: session.user.name || 'Padre/Madre',
        guardianEmail: session.user.email,
        guardianPhone: '',
        scheduledDate: preferredDate ? new Date(preferredDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
        scheduledTime: '10:00', // Default time
        duration: 30,
        location: 'Sala de Reuniones',
        status: 'SCHEDULED',
        type: 'PARENT_TEACHER',
        assignedTo: teacherId,
        notes: `Solicitud de reunión: ${message}`,
        source: 'PARENT_REQUESTED',
        parentRequested: true,
      },
    });

    return NextResponse.json({
      message: 'Solicitud de reunión enviada correctamente',
      data: {
        id: meetingRequest.id,
        teacherId,
        subject,
        message,
        preferredDate,
        status: 'scheduled',
        createdAt: meetingRequest.createdAt.toISOString(),
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