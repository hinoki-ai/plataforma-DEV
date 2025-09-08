import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/crypto';

const parentRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Nombre completo es requerido'),
  email: z.string().email('Email no válido'),
  phone: z.string().min(8, 'Teléfono es requerido'),
  password: z
    .string()
    .min(6, 'Contraseña debe tener al menos 6 caracteres')
    .optional(),
  rut: z.string().min(8, 'RUT es requerido'),
  childName: z.string().min(2, 'Nombre del niño/a es requerido'),
  childGrade: z.string().min(1, 'Grado es requerido'),
  relationship: z.string().min(1, 'Relación es requerida'),
  address: z.string().min(5, 'Dirección es requerida'),
  region: z.string().min(1, 'Región es requerida'),
  comuna: z.string().min(1, 'Comuna es requerida'),
  emergencyContact: z.string().min(2, 'Contacto de emergencia es requerido'),
  emergencyPhone: z.string().min(8, 'Teléfono de emergencia es requerido'),
  parentRole: z.enum(['padre', 'madre', 'apoderado', 'otro']),
  provider: z.string().optional(),
  isOAuthUser: z.boolean().default(false),
});

export type ParentRegistrationInput = z.infer<typeof parentRegistrationSchema>;

export async function registerParent(formData: FormData) {
  try {
    // Convert FormData to object
    const data = Object.fromEntries(formData.entries());

    // Handle OAuth vs credentials registration
    const isOAuth = data.provider === 'google';

    // Validate with Zod
    const validated = parentRegistrationSchema.parse({
      ...data,
      isOAuthUser: isOAuth,
      password: isOAuth ? undefined : data.password, // Password only required for credentials
    });

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser && existingUser.role !== 'PARENT') {
      return {
        success: false,
        error: 'Este email ya está registrado con otro tipo de cuenta.',
      };
    }

    if (existingUser && existingUser.role === 'PARENT') {
      return {
        success: false,
        error: 'Ya existe una cuenta de padre con este email.',
      };
    }

    // Create parent user
    const userData: any = {
      name: validated.fullName,
      email: validated.email,
      phone: validated.phone,
      role: 'PARENT',
      parentRole: validated.parentRole,
      status: 'ACTIVE',
      isOAuthUser: validated.isOAuthUser,
      provider: validated.provider || 'credentials',
    };

    // Hash password for credentials users
    if (!validated.isOAuthUser && validated.password) {
      userData.password = await hashPassword(validated.password);
    }

    const user = await db.user.create({
      data: userData,
    });

    // Store additional parent information (could be in a separate table in the future)
    // For now, we'll just return success with the user data

    return {
      success: true,
      userId: user.id,
      message: 'Registro exitoso. Bienvenido al Centro de Padres.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.issues.forEach(issue => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });

      return {
        success: false,
        error: 'Por favor corrige los errores en el formulario',
        fieldErrors,
      };
    }

    return {
      success: false,
      error: 'Error interno del servidor. Por favor intenta nuevamente.',
    };
  }
}

// Backward compatibility
export const registerWithUnifiedProfile = registerParent;
export type UnifiedRegistrationInput = ParentRegistrationInput;
