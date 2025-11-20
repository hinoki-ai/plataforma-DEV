import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { z } from "zod";
import {
  parentRegistrationSchema,
  hashUserPassword,
  logUserCreation,
  UserCreationError,
  type ParentRegistrationData,
} from "@/lib/user-creation";

export const runtime = "nodejs";

// Parent self-registration schema (extended from standardized schema)
const registerParentSchema = parentRegistrationSchema;

// POST /api/auth/register-parent - Parent self-registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerParentSchema.parse(body);

    const primaryGuardianPhone = (
      validatedData.guardianPhone ??
      validatedData.phone ??
      ""
    ).trim();
    const studentEmail = validatedData.studentEmail || undefined;

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

    // Hash the provided password using standardized function
    const hashedPassword = await hashUserPassword(validatedData.password);

    // Create parent user
    const userId = await client.mutation(api.users.createUser, {
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      phone: validatedData.phone,
      role: "PARENT",
      parentRole: validatedData.relationship,
      status: "PENDING", // Parent accounts start as pending until verified
    });

    const user = await client.query(api.users.getUserById, { userId: userId });

    // Get default admin/teacher for assignment
    const admins = await client.query(api.users.getUsers, { role: "ADMIN" });
    const firstAdmin = admins[0];

    // Log successful parent registration
    logUserCreation(
      "parentSelfRegistration",
      {
        email: validatedData.email,
        role: "PARENT",
        name: validatedData.name,
      },
      undefined,
      true,
    );

    // Create a verification meeting record with student information
    await client.mutation(api.meetings.createMeeting, {
      title: `Registro de Padre/Madre - ${validatedData.studentName} (Pendiente Verificación)`,
      description: `Usuario padre registrado por sí mismo. Requiere verificación. Estudiante: ${validatedData.studentName}`,
      studentName: validatedData.studentName,
      studentGrade: validatedData.studentGrade,
      guardianName: validatedData.name,
      guardianEmail: validatedData.email,
      guardianPhone: primaryGuardianPhone,
      scheduledDate: Date.now(), // Set to current date for pending verification
      scheduledTime: "09:00", // Default time
      assignedTo: firstAdmin?._id || userId, // Assign to admin or self if no admin exists
      type: "PARENT_TEACHER",
      parentRequested: true,
      reason:
        `Auto-registro de padre - Relación: ${validatedData.relationship} (Requiere verificación)` +
        (studentEmail ? ` | Email estudiante: ${studentEmail}` : ""),
    });

    return NextResponse.json({
      id: user!._id,
      name: user!.name,
      email: user!.email,
      role: user!.role,
      status: user!.status,
      createdAt: user!.createdAt,
      message:
        "Registro exitoso. Tu cuenta será verificada por el personal de la escuela antes de ser activada.",
      studentInfo: {
        studentName: validatedData.studentName,
        studentGrade: validatedData.studentGrade,
        relationship: validatedData.relationship,
        studentEmail,
        guardianPhone: primaryGuardianPhone || undefined,
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
      { error: "Error al registrar usuario" },
      { status: 500 },
    );
  }
}
