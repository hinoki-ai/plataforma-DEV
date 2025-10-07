import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/role-utils";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { z } from "zod";

export const runtime = "nodejs";

const updateMeetingSchema = z.object({
  title: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .optional(),
  description: z.string().optional(),
  studentName: z
    .string()
    .min(2, "El nombre del estudiante es requerido")
    .optional(),
  studentGrade: z
    .string()
    .min(1, "El grado del estudiante es requerido")
    .optional(),
  guardianName: z
    .string()
    .min(2, "El nombre del tutor es requerido")
    .optional(),
  guardianEmail: z.string().email("Email del tutor inválido").optional(),
  guardianPhone: z.string().optional(),
  scheduledDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Fecha inválida",
    })
    .optional(),
  scheduledTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Hora inválida (formato HH:MM)",
    })
    .optional(),
  duration: z
    .number()
    .min(15, "La duración mínima es 15 minutos")
    .max(240, "La duración máxima es 4 horas")
    .optional(),
  location: z.string().min(1, "La ubicación es requerida").optional(),
  status: z
    .enum([
      "SCHEDULED",
      "CONFIRMED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
      "RESCHEDULED",
    ])
    .optional(),
  type: z
    .enum([
      "PARENT_TEACHER",
      "FOLLOW_UP",
      "EMERGENCY",
      "IEP_REVIEW",
      "GRADE_CONFERENCE",
    ])
    .optional(),
  assignedTo: z.string().min(1, "Debe asignar a un profesor").optional(),
  notes: z.string().optional(),
  outcome: z.string().optional(),
  followUpRequired: z.boolean().optional(),
  reason: z.string().optional(),
});

// GET /api/admin/meetings/[id] - Get specific meeting (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.role || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const client = getConvexClient();
    const meeting = await client.query(api.meetings.getMeetingById, {
      id: id as Id<"meetings">,
    });

    if (!meeting) {
      return NextResponse.json(
        { error: "Reunión no encontrada" },
        { status: 404 },
      );
    }

    // Get teacher info
    const teacher = await client.query(api.users.getUserById, {
      userId: meeting.assignedTo,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...meeting,
        teacher: teacher
          ? {
              id: teacher._id,
              name: teacher.name,
              email: teacher.email,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching admin meeting:", error);
    return NextResponse.json(
      { error: "Error al obtener reunión" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/meetings/[id] - Update meeting (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.role || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateMeetingSchema.parse(body);

    const client = getConvexClient();

    // Check if meeting exists
    const existingMeeting = await client.query(api.meetings.getMeetingById, {
      id: id as Id<"meetings">,
    });

    if (!existingMeeting) {
      return NextResponse.json(
        { error: "Reunión no encontrada" },
        { status: 404 },
      );
    }

    // If changing assigned teacher, verify they exist and are active
    if (
      validatedData.assignedTo &&
      validatedData.assignedTo !== existingMeeting.assignedTo
    ) {
      const assignedTeacher = await client.query(api.users.getUserById, {
        userId: validatedData.assignedTo as Id<"users">,
      });

      if (
        !assignedTeacher ||
        assignedTeacher.role !== "PROFESOR" ||
        !assignedTeacher.isActive
      ) {
        return NextResponse.json(
          {
            error: "El profesor asignado no existe o no está activo",
          },
          { status: 400 },
        );
      }
    }

    const updateData: any = { ...validatedData };
    if (validatedData.scheduledDate) {
      updateData.scheduledDate = new Date(
        validatedData.scheduledDate,
      ).getTime();
    }
    // Convert assignedTo to Id if present
    if (validatedData.assignedTo) {
      updateData.assignedTo = validatedData.assignedTo as Id<"users">;
    }

    const meeting = await client.mutation(api.meetings.updateMeeting, {
      id: id as Id<"meetings">,
      ...updateData,
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, error: "No se pudo actualizar la reunión" },
        { status: 500 },
      );
    }

    // Get teacher info
    const teacher = meeting.assignedTo
      ? await client.query(api.users.getUserById, {
          userId: meeting.assignedTo,
        })
      : null;

    return NextResponse.json({
      success: true,
      data: {
        ...meeting,
        teacher: teacher
          ? {
              id: teacher._id,
              name: teacher.name,
              email: teacher.email,
            }
          : null,
      },
      message: "Reunión actualizada exitosamente",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error updating admin meeting:", error);
    return NextResponse.json(
      { error: "Error al actualizar reunión" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/meetings/[id] - Delete meeting (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.role || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const client = getConvexClient();

    // Check if meeting exists
    const existingMeeting = await client.query(api.meetings.getMeetingById, {
      id: id as Id<"meetings">,
    });

    if (!existingMeeting) {
      return NextResponse.json(
        { error: "Reunión no encontrada" },
        { status: 404 },
      );
    }

    await client.mutation(api.meetings.deleteMeeting, {
      id: id as Id<"meetings">,
    });

    return NextResponse.json({
      success: true,
      message: "Reunión eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error deleting admin meeting:", error);
    return NextResponse.json(
      { error: "Error al eliminar reunión" },
      { status: 500 },
    );
  }
}
