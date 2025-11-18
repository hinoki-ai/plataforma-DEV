import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { sanitizeJsonInput } from "@/lib/sanitization";

const INSTITUTION_TYPES = [
  "PRESCHOOL",
  "BASIC_SCHOOL",
  "HIGH_SCHOOL",
  "TECHNICAL_INSTITUTE",
  "TECHNICAL_CENTER",
  "UNIVERSITY",
] as const;

const adminSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingrese un correo electrónico válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  phone: z.string().min(6, "Ingrese un teléfono válido").optional(),
  role: z.enum(["ADMIN", "MASTER"]).optional(),
  isPrimary: z.boolean().optional(),
});

const institutionSchema = z.object({
  name: z.string().min(3, "El nombre de la institución es requerido"),
  mission: z
    .string()
    .min(10, "La misión debe describir el propósito de la institución"),
  vision: z
    .string()
    .min(10, "La visión debe describir la proyección de la institución"),
  address: z.string().min(5, "Ingrese una dirección válida"),
  phone: z.string().min(7, "Ingrese un teléfono de contacto válido"),
  email: z.string().email("Ingrese un correo institucional válido"),
  website: z.string().url("Ingrese una URL válida"),
  logoUrl: z
    .string()
    .url("Ingrese una URL válida para el logo")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  institutionType: z.enum(INSTITUTION_TYPES),
  supportedLevels: z.any().optional(),
  customGrades: z.any().optional(),
  customSubjects: z.any().optional(),
  educationalConfig: z.any().optional(),
  isActive: z.boolean().optional(),
});

const payloadSchema = z
  .object({
    institution: institutionSchema,
    admins: z
      .array(adminSchema)
      .min(1, "Debe registrar al menos un administrador"),
  })
  .refine((data) => data.admins.some((admin) => admin.isPrimary), {
    message: "Debe marcar un administrador principal",
    path: ["admins"],
  });

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "MASTER") {
      return NextResponse.json(
        { success: false, error: "Acceso restringido a usuarios MASTER" },
        { status: 403 },
      );
    }

    const rawBody = await request.json();
    const sanitizedBody = sanitizeJsonInput(rawBody);
    const parsedBody = payloadSchema.parse(sanitizedBody);

    const client = getConvexClient();

    let createdByUserId: Id<"users"> | undefined;
    try {
      const convexUser = await client.query(api.users.getUserByEmail, {
        email: session.user.email,
      });
      createdByUserId = convexUser?._id as Id<"users"> | undefined;
    } catch (error) {
      console.warn("Unable to resolve Convex user for MASTER session", {
        email: session.user.email,
        error,
      });
    }

    const result = await client.mutation(
      api.institutionInfo.createInstitutionWithAdmins,
      {
        institution: {
          ...parsedBody.institution,
          logoUrl: parsedBody.institution.logoUrl || undefined,
        },
        admins: parsedBody.admins.map((admin) => ({
          name: admin.name.trim(),
          email: admin.email.trim(),
          password: admin.password,
          phone: admin.phone?.trim(),
          role: admin.role ?? "ADMIN",
          isPrimary: admin.isPrimary ?? false,
        })),
        createdBy: createdByUserId,
      },
    );

    return NextResponse.json(
      {
        success: true,
        institutionId: result.institution?._id ?? null,
        institution: result.institution,
        admins: result.admins,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos inválidos",
          issues: error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    console.error("MASTER institution creation error", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "No se pudo crear la institución",
      },
      { status: 500 },
    );
  }
}
