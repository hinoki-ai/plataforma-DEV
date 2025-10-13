/**
 * Unified Registration Actions - Convex Implementation
 */

import { getConvexClient } from "@/lib/convex";
import { api } from "../../../convex/_generated/api";
import bcryptjs from "bcryptjs";

export async function registerParent(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}) {
  try {
    const client = getConvexClient();

    // Hash password
    const hashedPassword = await bcryptjs.hash(data.password, 10);

    const userId = await client.mutation(api.users.createUser, {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      phone: data.phone,
      role: "PARENT",
      isOAuthUser: false,
    });

    return { success: true, data: { id: userId } };
  } catch (error) {
    console.error("Failed to register parent:", error);

    if (error instanceof Error && error.message?.includes("already exists")) {
      return {
        success: false,
        error: "El correo electrónico ya está registrado",
      };
    }

    return { success: false, error: "No se pudo completar el registro" };
  }
}

/**
 * Register parent with complete profile information
 * Creates user account, parent profile, and student record
 */
export async function registerParentComplete(data: {
  fullName: string;
  email: string;
  phone: string;
  rut: string;
  childName: string;
  childGrade: string;
  relationship: string;
  address: string;
  region: string;
  comuna: string;
  emergencyContact: string;
  emergencyPhone: string;
  institutionId?: string;
  password?: string;
  provider?: string;
  isOAuthUser?: boolean;
}) {
  try {
    const client = getConvexClient();

    // Generate password if not provided (for OAuth users)
    const password = data.password || generateRandomPassword();

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    const result = await client.mutation(api.users.registerParentComplete, {
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      rut: data.rut,
      address: data.address,
      region: data.region,
      comuna: data.comuna,
      relationship: data.relationship,
      emergencyContact: data.emergencyContact,
      emergencyPhone: data.emergencyPhone,
      childName: data.childName,
      childGrade: data.childGrade,
      institutionId: data.institutionId as any, // Type assertion for Convex ID
      provider: data.provider,
      isOAuthUser: data.isOAuthUser ?? false,
    });

    return {
      success: true,
      data: {
        id: result.userId,
        studentId: result.studentId,
      },
    };
  } catch (error) {
    console.error("Failed to register parent:", error);

    if (error instanceof Error && error.message?.includes("already exists")) {
      return {
        success: false,
        error: "El correo electrónico ya está registrado",
      };
    }

    return { success: false, error: "No se pudo completar el registro" };
  }
}

/**
 * Generate a random secure password for OAuth users
 */
function generateRandomPassword(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
