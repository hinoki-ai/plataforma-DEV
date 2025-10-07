import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canCreateParentUser } from "@/lib/authorization";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { z } from "zod";
import { hashPassword } from "@/lib/crypto";
import {
  checkRateLimit,
  getRateLimitHeaders,
  RATE_LIMITS,
} from "@/lib/rate-limiter";
import { sanitizeJsonInput } from "@/lib/sanitization";

export const runtime = "nodejs";

// Parent creation schema for teachers
const createParentSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingrese un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  phone: z.string().optional(),
  // Student information
  studentName: z.string().min(2, "El nombre del estudiante es requerido"),
  studentGrade: z.string().min(1, "El grado del estudiante es requerido"),
  studentEmail: z
    .string()
    .email("El email del estudiante debe ser válido")
    .optional(),
  guardianPhone: z.string().optional(),
  relationship: z.string().min(1, "La relación familiar es requerida"),
});

// POST /api/profesor/parents - Create new parent user (teachers only)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting for user creation
    if (
      checkRateLimit(
        request,
        RATE_LIMITS.ADMIN_ACTIONS.limit,
        RATE_LIMITS.ADMIN_ACTIONS.windowMs,
        "profesor",
      )
    ) {
      return NextResponse.json(
        { error: "Too many user creation requests. Please try again later." },
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

    // Check if user can create parent users
    if (!canCreateParentUser(session.user.role)) {
      return NextResponse.json(
        {
          error: "No tienes permisos para crear usuarios padres",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    // Sanitize input data before validation
    const sanitizedBody = sanitizeJsonInput(body);
    const validatedData = createParentSchema.parse(sanitizedBody);

    const client = getConvexClient();

    // Check if email already exists
    const existingUser = await client.query(api.users.getUserByEmail, {
      email: validatedData.email,
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 },
      );
    }

    // Hash the provided password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create parent user
    const userId = await client.mutation(api.users.createUser, {
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      phone: validatedData.phone,
      role: "PARENT",
      createdByAdmin: session.user.id, // Track which teacher created this user
    });

    // Get the created user
    const user = await client.query(api.users.getUserById, {
      userId,
    });

    // Create a meeting record with student information for future reference
    await client.mutation(api.meetings.createMeeting, {
      title: `Registro de Padre/Madre - ${validatedData.studentName}`,
      description: `Usuario padre creado por profesor. Estudiante: ${validatedData.studentName}`,
      studentName: validatedData.studentName,
      studentGrade: validatedData.studentGrade,
      guardianName: validatedData.name,
      guardianEmail: validatedData.email,
      guardianPhone: validatedData.guardianPhone || validatedData.phone || "",
      scheduledDate: Date.now(), // Set to current date for registration tracking
      scheduledTime: "09:00", // Default time
      assignedTo: session.user.id as Id<"users">,
      type: "PARENT_TEACHER",
      reason: `Registro de usuario padre - Relación: ${validatedData.relationship}`,
    });

    return NextResponse.json({
      id: user?._id,
      name: user?.name,
      email: user?.email,
      role: user?.role,
      createdAt: user?.createdAt
        ? new Date(user.createdAt).toISOString()
        : undefined,
      updatedAt: user?.updatedAt
        ? new Date(user.updatedAt).toISOString()
        : undefined,
      studentInfo: {
        studentName: validatedData.studentName,
        studentGrade: validatedData.studentGrade,
        relationship: validatedData.relationship,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error creating parent user:", error);
    return NextResponse.json(
      { error: "Error al crear usuario padre" },
      { status: 500 },
    );
  }
}
