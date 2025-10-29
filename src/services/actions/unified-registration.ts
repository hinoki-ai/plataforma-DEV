/**
 * Unified Registration Actions - Convex Implementation
 */

import { getConvexClient } from "@/lib/convex";
import { api } from "../../../convex/_generated/api";
import {
  hashUserPassword,
  generateRandomPassword,
  logUserCreation,
  UserCreationError,
} from "@/lib/user-creation";

export async function registerParent(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}) {
  try {
    const client = getConvexClient();

    // Hash password using standardized function
    const hashedPassword = await hashUserPassword(data.password);

    const userId = await client.mutation(api.users.createUser, {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      phone: data.phone,
      role: "PARENT",
      isOAuthUser: false,
    });

    // Log successful registration
    logUserCreation(
      "registerParent",
      {
        email: data.email,
        role: "PARENT",
        name: data.name,
      },
      undefined,
      true,
    );

    return { success: true, data: { id: userId } };
  } catch (error) {
    // Log failed registration
    logUserCreation(
      "registerParent",
      {
        email: data.email,
        role: "PARENT",
        name: data.name,
      },
      undefined,
      false,
      error,
    );

    if (error instanceof UserCreationError) {
      return {
        success: false,
        error: error.message,
      };
    }

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

    // Hash password using standardized function
    const hashedPassword = await hashUserPassword(password);

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

    // Log successful registration
    logUserCreation(
      "registerParentComplete",
      {
        email: data.email,
        role: "PARENT",
        name: data.fullName,
      },
      undefined,
      true,
    );

    return {
      success: true,
      data: {
        id: result.userId,
        studentId: result.studentId,
      },
    };
  } catch (error) {
    // Log failed registration
    logUserCreation(
      "registerParentComplete",
      {
        email: data.email,
        role: "PARENT",
        name: data.fullName,
      },
      undefined,
      false,
      error,
    );

    if (error instanceof UserCreationError) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (error instanceof Error && error.message?.includes("already exists")) {
      return {
        success: false,
        error: "El correo electrónico ya está registrado",
      };
    }

    return { success: false, error: "No se pudo completar el registro" };
  }
}
