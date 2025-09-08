'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath, revalidateTag } from 'next/cache';
import { MeetingStatus, MeetingType } from '@prisma/client';
import { z } from 'zod';
import { AuthenticationError, AuthorizationError } from '@/lib/error-handler';
import { rateLimiter } from '@/lib/rate-limiter';

// Centralized cache invalidation for meetings
function invalidateMeetingsCache() {
  revalidateTag('meetings');
  // Only revalidate paths when necessary to reduce conflicts
  revalidatePath('/profesor/reuniones');
  revalidatePath('/admin/reuniones');
}

const meetingSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  studentName: z.string().min(2, 'El nombre del estudiante es requerido'),
  studentGrade: z.string().min(1, 'El grado del estudiante es requerido'),
  guardianName: z.string().min(2, 'El nombre del apoderado es requerido'),
  guardianEmail: z.string().email('Email inválido'),
  guardianPhone: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos'),
  scheduledDate: z.string().transform(str => new Date(str)),
  scheduledTime: z.string().min(1, 'La hora es requerida'),
  duration: z.number().min(15).max(120).default(30),
  location: z.string().default('Sala de Reuniones'),
  type: z.nativeEnum(MeetingType).default(MeetingType.PARENT_TEACHER),
  assignedTo: z.string().uuid(),
});

export async function createMeeting(data: z.infer<typeof meetingSchema>) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    // Only ADMIN and PROFESOR can create meetings
    if (session.user.role !== 'ADMIN' && session.user.role !== 'PROFESOR') {
      throw new AuthorizationError('No tienes permisos para crear reuniones');
    }

    const validatedData = meetingSchema.parse(data);

    const meeting = await prisma.meeting.create({
      data: {
        ...validatedData,
        scheduledDate: new Date(validatedData.scheduledDate),
      },
    });

    invalidateMeetingsCache();

    return { success: true, meeting };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Error al crear la reunión' };
  }
}

export async function updateMeeting(
  id: string,
  data: Partial<z.infer<typeof meetingSchema>>
) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    // Only ADMIN can update any meeting, PROFESOR can only update their own meetings
    if (session.user.role === 'PROFESOR') {
      const meeting = await prisma.meeting.findUnique({
        where: { id },
        select: { assignedTo: true },
      });

      if (!meeting || meeting.assignedTo !== session.user.id) {
        throw new AuthorizationError(
          'No tienes permisos para editar esta reunión'
        );
      }
    } else if (session.user.role !== 'ADMIN') {
      throw new AuthorizationError('No tienes permisos para editar reuniones');
    }

    const validatedData = meetingSchema.partial().parse(data);

    const meeting = await prisma.meeting.update({
      where: { id },
      data: {
        ...validatedData,
        ...(validatedData.scheduledDate && {
          scheduledDate: new Date(validatedData.scheduledDate),
        }),
      },
      include: {
        teacher: {
          select: { name: true },
        },
      },
    });

    // Send confirmation email when meeting is assigned to a teacher
    if (data.assignedTo && meeting.guardianEmail) {
      try {
        const { sendMeetingConfirmation } = await import('@/lib/email');
        await sendMeetingConfirmation({
          to: meeting.guardianEmail,
          parentName: meeting.guardianName || 'Apoderado',
          meetingTitle: meeting.title,
          meetingDate: meeting.scheduledDate,
          meetingTime: meeting.scheduledTime,
          assignedTeacher: meeting.teacher?.name || 'Profesor',
          location: meeting.location || 'Por confirmar',
        });
      } catch (error) {
        console.warn('Failed to send meeting confirmation:', error);
      }
    }

    invalidateMeetingsCache();

    return { success: true, meeting };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Error al actualizar la reunión' };
  }
}

export async function deleteMeeting(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    // Only ADMIN can delete any meeting, PROFESOR can only delete their own meetings
    if (session.user.role === 'PROFESOR') {
      const meeting = await prisma.meeting.findUnique({
        where: { id },
        select: { assignedTo: true },
      });

      if (!meeting || meeting.assignedTo !== session.user.id) {
        throw new AuthorizationError(
          'No tienes permisos para eliminar esta reunión'
        );
      }
    } else if (session.user.role !== 'ADMIN') {
      throw new AuthorizationError(
        'No tienes permisos para eliminar reuniones'
      );
    }

    await prisma.meeting.delete({
      where: { id },
    });

    invalidateMeetingsCache();

    return { success: true };
  } catch (error) {
    if (
      error instanceof AuthenticationError ||
      error instanceof AuthorizationError
    ) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Error al eliminar la reunión' };
  }
}

export async function updateMeetingStatus(id: string, status: MeetingStatus) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    // Only ADMIN and PROFESOR can update meeting status
    if (session.user.role !== 'ADMIN' && session.user.role !== 'PROFESOR') {
      throw new AuthorizationError(
        'No tienes permisos para actualizar el estado de reuniones'
      );
    }

    const meeting = await prisma.meeting.update({
      where: { id },
      data: { status },
      include: {
        teacher: {
          select: { name: true },
        },
      },
    });

    // Send email notification to parent about status update
    if (meeting.guardianEmail) {
      try {
        const { sendMeetingStatusUpdate } = await import('@/lib/email');
        await sendMeetingStatusUpdate(
          meeting.guardianEmail,
          meeting.guardianName || 'Apoderado',
          meeting.title,
          status,
          `Tu reunión ha cambiado al estado: ${status}`
        );
      } catch (error) {
        console.warn(
          'Failed to send meeting status update notification:',
          error
        );
      }
    }

    invalidateMeetingsCache();

    return { success: true, meeting };
  } catch (error) {
    return { success: false, error: 'Error al actualizar el estado' };
  }
}

export async function rescheduleMeeting(
  id: string,
  newDate: string,
  newTime: string
) {
  try {
    const meeting = await prisma.meeting.update({
      where: { id },
      data: {
        scheduledDate: new Date(newDate),
        scheduledTime: newTime,
        status: MeetingStatus.RESCHEDULED,
      },
      include: {
        teacher: {
          select: { name: true },
        },
      },
    });

    // Send email notification to parent about rescheduling
    if (meeting.guardianEmail) {
      try {
        const { sendMeetingStatusUpdate } = await import('@/lib/email');
        await sendMeetingStatusUpdate(
          meeting.guardianEmail,
          meeting.guardianName || 'Apoderado',
          meeting.title,
          'Reprogramada',
          `Tu reunión ha sido reprogramada para el ${new Date(newDate).toLocaleDateString('es-CL')} a las ${newTime}`
        );
      } catch (error) {
        console.warn('Failed to send meeting reschedule notification:', error);
      }
    }

    invalidateMeetingsCache();

    return { success: true, meeting };
  } catch (error) {
    return { success: false, error: 'Error al reprogramar la reunión' };
  }
}

export async function addMeetingNotes(
  id: string,
  notes: string,
  outcome?: string
) {
  try {
    const meeting = await prisma.meeting.update({
      where: { id },
      data: {
        notes,
        outcome,
        status: MeetingStatus.COMPLETED,
      },
    });

    invalidateMeetingsCache();

    return { success: true, meeting };
  } catch (error) {
    return { success: false, error: 'Error al agregar notas' };
  }
}

export async function uploadMeetingAttachments(
  id: string,
  attachments: string[]
) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    // Only ADMIN and PROFESOR can upload attachments
    if (session.user.role !== 'ADMIN' && session.user.role !== 'PROFESOR') {
      throw new AuthorizationError('No tienes permisos para subir archivos');
    }

    // PROFESOR can only upload to their own meetings
    if (session.user.role === 'PROFESOR') {
      const meeting = await prisma.meeting.findUnique({
        where: { id },
        select: { assignedTo: true },
      });

      if (!meeting || meeting.assignedTo !== session.user.id) {
        throw new AuthorizationError(
          'No tienes permisos para subir archivos a esta reunión'
        );
      }
    }

    const meeting = await prisma.meeting.update({
      where: { id },
      data: {
        attachments: {
          push: attachments,
        },
      },
    });

    invalidateMeetingsCache();

    return { success: true, meeting };
  } catch (error) {
    return { success: false, error: 'Error al subir archivos' };
  }
}

// Server actions for fetching meetings data
export async function getMeetingsAction(filters: any = {}) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { getRoleFilter } = await import('@/lib/role-utils');
    const roleFilter = getRoleFilter(session?.user?.role);

    const where: any = {
      ...roleFilter,
    };

    // Apply user filters
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.assignedTo) where.assignedTo = filters.assignedTo;
    if (filters.studentGrade) where.studentGrade = filters.studentGrade;

    if (filters.startDate || filters.endDate) {
      where.scheduledDate = {};
      if (filters.startDate) where.scheduledDate.gte = filters.startDate;
      if (filters.endDate) where.scheduledDate.lte = filters.endDate;
    }

    const meetings = await prisma.meeting.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    });

    return { success: true, data: meetings };
  } catch (error) {
    console.error('Failed to fetch meetings:', error);
    return {
      success: false,
      error: 'No se pudieron cargar las reuniones',
      data: [],
    };
  }
}

export async function getMeetingsByTeacherAction(teacherId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { getRoleFilter } = await import('@/lib/role-utils');
    const roleFilter = getRoleFilter(session?.user?.role);

    const meetings = await prisma.meeting.findMany({
      where: {
        assignedTo: teacherId,
        ...roleFilter,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    });

    return { success: true, data: meetings };
  } catch (error) {
    console.error('Failed to fetch meetings by teacher:', error);
    return {
      success: false,
      error: 'No se pudieron cargar las reuniones del profesor',
      data: [],
    };
  }
}

export async function getMeetingByIdAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { getRoleFilter } = await import('@/lib/role-utils');
    const roleFilter = getRoleFilter(session?.user?.role);

    const meeting = await prisma.meeting.findFirst({
      where: {
        id,
        ...roleFilter,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!meeting) {
      return {
        success: false,
        error: 'Reunión no encontrada',
        data: null,
      };
    }

    return { success: true, data: meeting };
  } catch (error) {
    console.error('Failed to fetch meeting by id:', error);
    return {
      success: false,
      error: 'No se pudo cargar la reunión',
      data: null,
    };
  }
}

export async function getMeetingStatsAction() {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { getRoleFilter } = await import('@/lib/role-utils');
    const roleFilter = getRoleFilter(session?.user?.role);

    const [
      totalMeetings,
      scheduledMeetings,
      completedMeetings,
      cancelledMeetings,
    ] = await Promise.all([
      prisma.meeting.count({ where: roleFilter }),
      prisma.meeting.count({
        where: { ...roleFilter, status: MeetingStatus.SCHEDULED },
      }),
      prisma.meeting.count({
        where: { ...roleFilter, status: MeetingStatus.COMPLETED },
      }),
      prisma.meeting.count({
        where: { ...roleFilter, status: MeetingStatus.CANCELLED },
      }),
    ]);

    return {
      success: true,
      data: {
        total: totalMeetings,
        pending: scheduledMeetings,
        completed: completedMeetings,
        cancelled: cancelledMeetings,
      },
    };
  } catch (error) {
    console.error('Failed to fetch meeting stats:', error);
    return {
      success: false,
      error: 'No se pudieron cargar las estadísticas',
      data: null,
    };
  }
}

export async function getUpcomingMeetingsAction(days = 7) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { getRoleFilter } = await import('@/lib/role-utils');
    const roleFilter = getRoleFilter(session?.user?.role);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const meetings = await prisma.meeting.findMany({
      where: {
        ...roleFilter,
        scheduledDate: {
          gte: startDate,
          lte: endDate,
        },
        status: MeetingStatus.SCHEDULED,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    });

    return { success: true, data: meetings };
  } catch (error) {
    console.error('Failed to fetch upcoming meetings:', error);
    return {
      success: false,
      error: 'No se pudieron cargar las próximas reuniones',
      data: [],
    };
  }
}

export async function getMeetingsByParentAction(parentId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    // Parents can only see their own meetings
    if (session.user.role !== 'PARENT' && session.user.id !== parentId) {
      throw new AuthorizationError(
        'No tienes permisos para ver estas reuniones'
      );
    }

    const meetings = await prisma.meeting.findMany({
      where: {
        guardianEmail: session.user.email, // Match by email
        OR: [
          { source: 'STAFF_CREATED' },
          { source: 'PARENT_REQUESTED', parentRequested: true },
        ],
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    });

    return { success: true, data: meetings };
  } catch (error) {
    console.error('Error fetching parent meetings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      data: [],
    };
  }
}

export async function getParentMeetingRequestsAction() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      throw new AuthorizationError(
        'Solo los administradores pueden ver las solicitudes'
      );
    }

    const meetings = await prisma.meeting.findMany({
      where: {
        source: 'PARENT_REQUESTED',
        parentRequested: true,
        status: 'SCHEDULED', // Only pending requests
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: meetings };
  } catch (error) {
    console.error('Error fetching parent meeting requests:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      data: [],
    };
  }
}

const meetingRequestSchema = z.object({
  studentName: z.string().min(2, 'El nombre del estudiante es requerido'),
  studentGrade: z.string().min(1, 'El grado del estudiante es requerido'),
  preferredDate: z.date(),
  preferredTime: z.string().min(1, 'La hora es requerida'),
  reason: z.string().min(10, 'El motivo debe tener al menos 10 caracteres'),
  additionalNotes: z.string().optional(),
  userId: z.string(),
  source: z.enum(['STAFF_CREATED', 'PARENT_REQUESTED']),
  parentRequested: z.boolean(),
});

export async function requestMeeting(
  data: z.infer<typeof meetingRequestSchema>
) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    // Additional rate limiting for authenticated users
    const userId = session.user.id;
    const rateLimitKey = `parent:${userId}`;

    // Reuse the shared rate limiter
    const { limit, windowMs } = { limit: 3, windowMs: 60 * 60 * 1000 }; // 3 requests per hour

    if (rateLimiter.isLimited(rateLimitKey, limit, windowMs)) {
      return {
        success: false,
        error:
          'Has alcanzado el límite de solicitudes. Por favor, espera una hora.',
      };
    }

    // Only PARENT users can request meetings
    if (session.user.role !== 'PARENT') {
      throw new AuthorizationError(
        'Solo los apoderados pueden solicitar reuniones'
      );
    }

    const validatedData = meetingRequestSchema.parse(data);

    const meeting = await prisma.meeting.create({
      data: {
        title: `Solicitud de Reunión - ${validatedData.studentName}`,
        description: validatedData.additionalNotes,
        studentName: validatedData.studentName,
        studentGrade: validatedData.studentGrade,
        guardianName: session.user.name || 'Apoderado',
        guardianEmail: session.user.email || '',
        guardianPhone: '',
        scheduledDate: validatedData.preferredDate,
        scheduledTime: validatedData.preferredTime,
        duration: 30,
        location: 'Por confirmar',
        status: 'SCHEDULED',
        type: 'PARENT_TEACHER',
        assignedTo: '', // Will be assigned by admin
        reason: validatedData.reason,
        source: validatedData.source,
        parentRequested: validatedData.parentRequested,
      },
    });

    // Send email notification to staff
    try {
      const { sendMeetingRequestNotification } = await import('@/lib/email');
      await sendMeetingRequestNotification({
        parentName: session.user.name || 'Apoderado',
        parentEmail: session.user.email || '',
        studentName: validatedData.studentName,
        studentGrade: validatedData.studentGrade,
        preferredDate: validatedData.preferredDate,
        preferredTime: validatedData.preferredTime,
        reason: validatedData.reason,
        additionalNotes: validatedData.additionalNotes,
      });
    } catch (error) {
      console.warn('Failed to send meeting request notification:', error);
      // Continue without failing the request
    }

    invalidateMeetingsCache();

    return { success: true, meeting };
  } catch (error) {
    console.error('Error requesting meeting:', error);

    if (error instanceof AuthenticationError) {
      return {
        success: false,
        error: 'Debes iniciar sesión para solicitar una reunión.',
      };
    }

    if (error instanceof AuthorizationError) {
      return {
        success: false,
        error: 'Solo los apoderados pueden solicitar reuniones.',
      };
    }

    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError.message,
      };
    }

    return {
      success: false,
      error: 'No pudimos procesar tu solicitud. Por favor, intenta más tarde.',
    };
  }
}
