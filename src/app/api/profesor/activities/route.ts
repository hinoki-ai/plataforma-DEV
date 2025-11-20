import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canAccessProfesor } from "@/lib/role-utils";
import { getAuthenticatedConvexClient } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { z } from "zod";
import {
  checkRateLimit,
  getRateLimitHeaders,
  RATE_LIMITS,
} from "@/lib/rate-limiter";

export const runtime = "nodejs";

// Activity schema for validation
const createActivitySchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  type: z.enum(["CLASS", "EVENT", "WORKSHOP", "EXCURSION", "MEETING", "OTHER"]),
  subject: z.string().min(1, "La materia es requerida"),
  grade: z.string().min(1, "El grado es requerido"),
  scheduledDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha inválida",
  }),
  scheduledTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Hora inválida (formato HH:MM)",
  }),
  duration: z
    .number()
    .min(15, "La duración mínima es 15 minutos")
    .max(480, "La duración máxima es 8 horas"),
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
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!canAccessProfesor(session.user.role)) {
      return NextResponse.json(
        {
          error: "No tienes permisos para acceder a estas actividades",
        },
        { status: 403 },
      );
    }

    const client = await getAuthenticatedConvexClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // upcoming, completed, all
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Get activities for this teacher
    const allActivities = (await client.query(api.activities.getActivities, {
      teacherId: session.user.id as any,
      type: type as any,
    })) as Doc<"activities">[];

    // Apply status filter
    const now = Date.now();
    let filteredActivities: Doc<"activities">[] = allActivities;
    if (status === "upcoming") {
      filteredActivities = allActivities.filter(
        (a: Doc<"activities">) => a.scheduledDate >= now,
      );
    } else if (status === "completed") {
      filteredActivities = allActivities.filter(
        (a: Doc<"activities">) => a.scheduledDate < now,
      );
    }

    // Sort based on status
    filteredActivities.sort((a: Doc<"activities">, b: Doc<"activities">) => {
      if (status === "upcoming") {
        return a.scheduledDate - b.scheduledDate; // Ascending for upcoming
      }
      return b.scheduledDate - a.scheduledDate; // Descending for completed/all
    });

    // Apply pagination
    const total = filteredActivities.length;
    const paginatedActivities = filteredActivities.slice(
      (page - 1) * limit,
      page * limit,
    );

    // Get teacher info for each activity
    const activitiesWithTeacher = await Promise.all(
      paginatedActivities.map(async (activity: Doc<"activities">) => {
        const teacher = await client.query(api.users.getUserById, {
          userId: activity.teacherId,
        });
        return {
          ...activity,
          teacher: teacher
            ? {
                id: teacher._id,
                name: teacher.name,
                email: teacher.email,
              }
            : null,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      data: activitiesWithTeacher,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener actividades" },
      { status: 500 },
    );
  }
}

// POST /api/profesor/activities - Create new activity
export async function POST(request: NextRequest) {
  try {
    // Rate limiting for activity creation
    if (
      checkRateLimit(
        request,
        RATE_LIMITS.ADMIN_ACTIONS.limit,
        RATE_LIMITS.ADMIN_ACTIONS.windowMs,
        "profesor",
      )
    ) {
      return NextResponse.json(
        {
          error: "Too many activity creation requests. Please try again later.",
        },
        {
          status: 429,
          headers: getRateLimitHeaders(
            request,
            RATE_LIMITS.ADMIN_ACTIONS.limit,
            RATE_LIMITS.ADMIN_ACTIONS.windowMs,
            "profesor",
          ),
        },
      );
    }

    const session = await auth();

    if (!session?.user?.role) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!canAccessProfesor(session.user.role)) {
      return NextResponse.json(
        {
          error: "No tienes permisos para crear actividades",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validatedData = createActivitySchema.parse(body);

    const client = await getAuthenticatedConvexClient();
    const activityId = await client.mutation(api.activities.createActivity, {
      ...validatedData,
      scheduledDate: new Date(validatedData.scheduledDate).getTime(),
      teacherId: session.user.id as any,
    });

    const activity = await client.query(api.activities.getActivityById, {
      id: activityId,
    });

    const teacher = await client.query(api.users.getUserById, {
      userId: session.user.id as any,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...activity,
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Error al crear actividad" },
      { status: 500 },
    );
  }
}
