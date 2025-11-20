import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/role-utils";
import { getAuthenticatedConvexClient } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import { z } from "zod";
import {
  checkRateLimit,
  getRateLimitHeaders,
  RATE_LIMITS,
} from "@/lib/rate-limiter";

export const runtime = "nodejs";

// Meeting validation schema
const createMeetingSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  studentName: z.string().min(2, "El nombre del estudiante es requerido"),
  studentGrade: z.string().min(1, "El grado del estudiante es requerido"),
  guardianName: z.string().min(2, "El nombre del tutor es requerido"),
  guardianEmail: z.string().email("Email del tutor inválido"),
  guardianPhone: z.string().optional(),
  scheduledDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha inválida",
  }),
  scheduledTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Hora inválida (formato HH:MM)",
  }),
  duration: z
    .number()
    .min(15, "La duración mínima es 15 minutos")
    .max(240, "La duración máxima es 4 horas"),
  location: z.string().min(1, "La ubicación es requerida"),
  type: z.enum([
    "PARENT_TEACHER",
    "FOLLOW_UP",
    "EMERGENCY",
    "IEP_REVIEW",
    "GRADE_CONFERENCE",
  ]),
  assignedTo: z.string().min(1, "Debe asignar a un profesor"),
  notes: z.string().optional(),
  reason: z.string().optional(),
});

// GET /api/admin/meetings - Get all meetings (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.role || !canAccessAdmin(session.data?.user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const client = await getAuthenticatedConvexClient();

    // Build filter object
    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    // Query Convex for meetings with pagination
    const result = await client.query(api.meetings.getMeetings, {
      filter,
      page,
      limit,
    });

    const meetings = result.meetings;
    const total = result.total;

    return NextResponse.json({
      success: true,
      data: meetings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching admin meetings:", error);
    return NextResponse.json(
      { error: "Error al obtener reuniones" },
      { status: 500 },
    );
  }
}

// POST /api/admin/meetings - Create new meeting (admin only)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting for admin actions
    if (
      checkRateLimit(
        request,
        RATE_LIMITS.ADMIN_ACTIONS.limit,
        RATE_LIMITS.ADMIN_ACTIONS.windowMs,
        "admin",
      )
    ) {
      return NextResponse.json(
        {
          error: "Too many meeting creation requests. Please try again later.",
        },
        {
          status: 429,
          headers: getRateLimitHeaders(
            request,
            RATE_LIMITS.ADMIN_ACTIONS.limit,
            RATE_LIMITS.ADMIN_ACTIONS.windowMs,
            "admin",
          ),
        },
      );
    }

    const session = await auth();

    if (!session?.user?.role || !canAccessAdmin(session.data?.user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createMeetingSchema.parse(body);

    const client = await getAuthenticatedConvexClient();

    // Verify that the assigned teacher exists and is active
    const assignedTeacher = await client.query(api.users.getUserById, {
      userId: validatedData.assignedTo as any, // Cast string to Id<"users">
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

    const meeting = await client.mutation(api.meetings.createMeeting, {
      ...validatedData,
      assignedTo: validatedData.assignedTo as any, // Cast string to Id<"users">
      scheduledDate: new Date(validatedData.scheduledDate).getTime(),
      guardianPhone: validatedData.guardianPhone || "",
      parentRequested: false, // Admin-created meetings are not parent-requested
    });

    return NextResponse.json({
      success: true,
      data: meeting,
      message: "Reunión creada exitosamente",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error creating admin meeting:", error);
    return NextResponse.json(
      { error: "Error al crear reunión" },
      { status: 500 },
    );
  }
}
