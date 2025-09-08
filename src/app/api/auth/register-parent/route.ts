import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { hashPassword } from '@/lib/crypto';

export const runtime = 'nodejs';

// Parent self-registration schema
const registerParentSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingrese un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .regex(/[^a-zA-Z0-9]/, 'La contraseña debe contener al menos un carácter especial'),
  phone: z.string().optional(),
  // Student information for verification
  studentName: z.string().min(2, 'El nombre del estudiante es requerido'),
  studentGrade: z.string().min(1, 'El grado del estudiante es requerido'),
  relationship: z.string().min(1, 'La relación familiar es requerida'),
});

// POST /api/auth/register-parent - Parent self-registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerParentSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Hash the provided password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create parent user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        phone: validatedData.phone,
        role: 'PARENT',
        status: 'PENDING', // Parent accounts start as pending until verified
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Create a verification meeting record with student information
    await prisma.meeting.create({
      data: {
        title: `Registro de Padre/Madre - ${validatedData.studentName} (Pendiente Verificación)`,
        description: `Usuario padre registrado por sí mismo. Requiere verificación. Estudiante: ${validatedData.studentName}`,
        studentName: validatedData.studentName,
        studentGrade: validatedData.studentGrade,
        guardianName: validatedData.name,
        guardianEmail: validatedData.email,
        guardianPhone: validatedData.phone || '',
        scheduledDate: new Date(), // Set to current date for pending verification
        scheduledTime: '09:00', // Default time
        assignedTo: 'SYSTEM', // Will be assigned to appropriate teacher/admin later
        status: 'SCHEDULED',
        source: 'PARENT_REQUESTED',
        parentRequested: true,
        reason: `Auto-registro de padre - Relación: ${validatedData.relationship} (Requiere verificación)`,
      },
    });

    return NextResponse.json({
      ...user,
      message: 'Registro exitoso. Tu cuenta será verificada por el personal de la escuela antes de ser activada.',
      studentInfo: {
        studentName: validatedData.studentName,
        studentGrade: validatedData.studentGrade,
        relationship: validatedData.relationship,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error registering parent:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}