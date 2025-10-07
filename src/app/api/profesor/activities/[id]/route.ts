import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { canAccessProfesor } from '@/lib/role-utils';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { z } from 'zod';

export const runtime = 'nodejs';

const updateActivitySchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').optional(),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').optional(),
  type: z.enum(['CLASS', 'EVENT', 'WORKSHOP', 'EXCURSION', 'MEETING', 'OTHER']).optional(),
  subject: z.string().min(1, 'La materia es requerida').optional(),
  grade: z.string().min(1, 'El grado es requerido').optional(),
  scheduledDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Fecha inválida'
  }).optional(),
  scheduledTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Hora inválida (formato HH:MM)'
  }).optional(),
  duration: z.number().min(15, 'La duración mínima es 15 minutos').max(480, 'La duración máxima es 8 horas').optional(),
  location: z.string().optional(),
  maxParticipants: z.number().min(1).max(100).optional(),
  materials: z.string().optional(),
  objectives: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/profesor/activities/[id] - Get specific activity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.role) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!canAccessProfesor(session.user.role)) {
      return NextResponse.json({
        error: 'No tienes permisos para acceder a esta actividad'
      }, { status: 403 });
    }

    const client = getConvexClient();
    const activity = await client.query(api.activities.getActivityById, {
      id: id as Id<"activities">,
    });

    if (!activity) {
      return NextResponse.json(
        { error: 'Actividad no encontrada' },
        { status: 404 }
      );
    }

    // Check if the activity belongs to the current teacher
    if (activity.teacherId !== session.user.id) {
      return NextResponse.json({
        error: 'No tienes permisos para ver esta actividad'
      }, { status: 403 });
    }

    // Get teacher info
    const teacher = await client.query(api.users.getUserById, {
      userId: activity.teacherId,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...activity,
        teacher: teacher ? {
          id: teacher._id,
          name: teacher.name,
          email: teacher.email,
        } : null,
      },
    });

  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Error al obtener actividad' },
      { status: 500 }
    );
  }
}

// PUT /api/profesor/activities/[id] - Update activity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.role) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!canAccessProfesor(session.user.role)) {
      return NextResponse.json({
        error: 'No tienes permisos para editar esta actividad'
      }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateActivitySchema.parse(body);

    const client = getConvexClient();

    // Check if activity exists and belongs to current teacher
    const existingActivity = await client.query(api.activities.getActivityById, {
      id: id as Id<"activities">,
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: 'Actividad no encontrada' },
        { status: 404 }
      );
    }

    if (existingActivity.teacherId !== session.user.id) {
      return NextResponse.json({
        error: 'No tienes permisos para editar esta actividad'
      }, { status: 403 });
    }

    const updateData: any = { ...validatedData };
    if (validatedData.scheduledDate) {
      updateData.scheduledDate = new Date(validatedData.scheduledDate).getTime();
    }

    const activity = await client.mutation(api.activities.updateActivity, {
      id: id as Id<"activities">,
      ...updateData,
    });

    // Get teacher info
    const teacher = await client.query(api.users.getUserById, {
      userId: activity.teacherId,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...activity,
        teacher: teacher ? {
          id: teacher._id,
          name: teacher.name,
          email: teacher.email,
        } : null,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating activity:', error);
    return NextResponse.json(
      { error: 'Error al actualizar actividad' },
      { status: 500 }
    );
  }
}

// DELETE /api/profesor/activities/[id] - Delete activity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.role) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!canAccessProfesor(session.user.role)) {
      return NextResponse.json({
        error: 'No tienes permisos para eliminar esta actividad'
      }, { status: 403 });
    }

    const client = getConvexClient();

    // Check if activity exists and belongs to current teacher
    const existingActivity = await client.query(api.activities.getActivityById, {
      id: id as Id<"activities">,
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: 'Actividad no encontrada' },
        { status: 404 }
      );
    }

    if (existingActivity.teacherId !== session.user.id) {
      return NextResponse.json({
        error: 'No tienes permisos para eliminar esta actividad'
      }, { status: 403 });
    }

    await client.mutation(api.activities.deleteActivity, {
      id: id as Id<"activities">,
    });

    return NextResponse.json({
      success: true,
      message: 'Actividad eliminada exitosamente',
    });

  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json(
      { error: 'Error al eliminar actividad' },
      { status: 500 }
    );
  }
}