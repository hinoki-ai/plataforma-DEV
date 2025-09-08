import { db as prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getRoleFilter } from '@/lib/role-utils';
import { MeetingStatus, MeetingType } from '@prisma/client';
import type {
  MeetingsResponse,
  MeetingResponse,
  MeetingStatsResponse,
  MeetingFilters,
} from '@/lib/types/service-responses';
import { AuthenticationError, AuthorizationError } from '@/lib/errors';

export async function getMeetings(
  filters: MeetingFilters = {}
): Promise<MeetingsResponse> {
  try {
    const session = await auth();
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

export async function getMeetingsByTeacher(
  teacherId: string
): Promise<MeetingsResponse> {
  try {
    const session = await auth();
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

export async function getMeetingById(id: string): Promise<MeetingResponse> {
  try {
    const session = await auth();
    const roleFilter = getRoleFilter(session?.user?.role);

    const meeting = await prisma.meeting.findUnique({
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
      return { success: false, error: 'Reunión no encontrada' };
    }

    return { success: true, data: meeting };
  } catch (error) {
    console.error('Failed to fetch meeting by ID:', error);
    return {
      success: false,
      error: 'No se pudo cargar la reunión',
    };
  }
}

export async function getMeetingStats(): Promise<MeetingStatsResponse> {
  try {
    const session = await auth();
    const roleFilter = getRoleFilter(session?.user?.role);

    const [
      totalMeetings,
      scheduledMeetings,
      confirmedMeetings,
      completedMeetings,
      cancelledMeetings,
    ] = await Promise.all([
      prisma.meeting.count({ where: roleFilter }),
      prisma.meeting.count({
        where: { status: MeetingStatus.SCHEDULED, ...roleFilter },
      }),
      prisma.meeting.count({
        where: { status: MeetingStatus.CONFIRMED, ...roleFilter },
      }),
      prisma.meeting.count({
        where: { status: MeetingStatus.COMPLETED, ...roleFilter },
      }),
      prisma.meeting.count({
        where: { status: MeetingStatus.CANCELLED, ...roleFilter },
      }),
    ]);

    return {
      success: true,
      data: {
        totalMeetings: totalMeetings,
        scheduledMeetings: scheduledMeetings,
        confirmedMeetings: confirmedMeetings,
        completedMeetings: completedMeetings,
        cancelledMeetings: cancelledMeetings,
      },
    };
  } catch (error) {
    console.error('Failed to fetch meeting stats:', error);
    return {
      success: false,
      error: 'No se pudieron cargar las estadísticas de reuniones',
    };
  }
}

export async function getUpcomingMeetings(days = 7): Promise<MeetingsResponse> {
  try {
    const session = await auth();
    const roleFilter = getRoleFilter(session?.user?.role);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days);

    const meetings = await prisma.meeting.findMany({
      where: {
        scheduledDate: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: [MeetingStatus.SCHEDULED, MeetingStatus.CONFIRMED],
        },
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
    console.error('Failed to fetch upcoming meetings:', error);
    return {
      success: false,
      error: 'No se pudieron cargar las próximas reuniones',
      data: [],
    };
  }
}

export async function getMeetingsByParent(
  parentId: string
): Promise<MeetingsResponse> {
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
    };
  }
}

export async function getParentMeetingRequests(): Promise<MeetingsResponse> {
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
    };
  }
}
