import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { canAccessProfesor } from '@/lib/role-utils';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limiter';

export const runtime = 'nodejs';

// Activity schema for validation
const createActivitySchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  type: z.enum(['CLASS', 'EVENT', 'WORKSHOP', 'EXCURSION', 'MEETING', 'OTHER']),
  subject: z.string().min(1, 'La materia es requerida'),
  grade: z.string().min(1, 'El grado es requerido'),
  scheduledDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Fecha inválida'
  }),
  scheduledTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Hora inválida (formato HH:MM)'
  }),
  duration: z.number().min(15, 'La duración mínima es 15 minutos').max(480, 'La duración máxima es 8 horas'),
  location: z.string().optional(),
  maxParticipants: z.number().min(1).max(100).optional(),
  materials: z.string().optional(),
  objectives: z.string().optional(),
  notes: z.string().optional(),
});

const updateActivitySchema = createActivitySchema.partial();

// GET /api/profesor/activities - Get activities for the logged-in teacher
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.role) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!canAccessProfesor(session.user.role)) {
      return NextResponse.json({
        error: 'No tienes permisos para acceder a estas actividades'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // upcoming, completed, all
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {
      teacherId: session.user.id,
    };

    // Add status filter
    if (status === 'upcoming') {
      where.scheduledDate = {
        gte: new Date(),
      };
    } else if (status === 'completed') {
      where.scheduledDate = {
        lt: new Date(),
      };
    }

    // Add type filter
    if (type) {
      where.type = type;
    }

    const activities = await prisma.activity.findMany({
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
        scheduledDate: status === 'upcoming' ? 'asc' : 'desc',
        createdAt: 'desc',
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    const total = await prisma.activity.count({ where });

    return NextResponse.json({
      success: true,
      data: activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Error al obtener actividades' },
      { status: 500 }
    );
  }
}

// POST /api/profesor/activities - Create new activity
export async function POST(request: NextRequest) {
  try {
    // Rate limiting for activity creation
    if (checkRateLimit(request, RATE_LIMITS.ADMIN_ACTIONS.limit, RATE_LIMITS.ADMIN_ACTIONS.windowMs, 'profesor')) {
      return NextResponse.json(
        { error: 'Too many activity creation requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(request, RATE_LIMITS.ADMIN_ACTIONS.limit, RATE_LIMITS.ADMIN_ACTIONS.windowMs, 'profesor')
        }
      );
    }

    const session = await auth();

    if (!session?.user?.role) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!canAccessProfesor(session.user.role)) {
      return NextResponse.json({
        error: 'No tienes permisos para crear actividades'
      }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createActivitySchema.parse(body);

    const activity = await prisma.activity.create({
      data: {
        ...validatedData,
        scheduledDate: new Date(validatedData.scheduledDate),
        teacherId: session.user.id,
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

    return NextResponse.json({
      success: true,
      data: activity,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Error al crear actividad' },
      { status: 500 }
    );
  }
}