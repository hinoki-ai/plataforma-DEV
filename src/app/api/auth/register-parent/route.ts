import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { z } from "zod";
import bcryptjs from "bcryptjs";

export const runtime = "nodejs";

// Parent self-registration schema
const registerParentSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingrese un email válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
    .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número")
    .regex(
      /[^a-zA-Z0-9]/,
      "La contraseña debe contener al menos un carácter especial",
    ),
  phone: z.string().optional(),
  guardianPhone: z.string().optional(),
  // Student information for verification
  studentName: z.string().min(2, "El nombre del estudiante es requerido"),
  studentGrade: z.string().min(1, "El grado del estudiante es requerido"),
  studentEmail: z
    .string()
    .email("El email del estudiante debe ser válido")
    .optional(),
  relationship: z.string().min(1, "La relación familiar es requerida"),
});

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

    // Hash the provided password
    const hashedPassword = await bcryptjs.hash(validatedData.password, 10);

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

    console.error("Error registering parent:", error);
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 },
    );
  }
}
