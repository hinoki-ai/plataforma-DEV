/**
 * Auth Actions - Convex Implementation
 * Server Actions for authentication
 */

"use server";

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";
import { authenticateUser } from "@/lib/auth-convex";

/**
 * Authenticate user with credentials (for useActionState hook)
 * Returns { success: true } on success or { success: false, error: string } on failure
 */
export async function authenticate(
  prevState: { success: boolean; error?: string } | undefined,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return {
        success: false,
        error: "Por favor ingrese email y contraseña",
      };
    }

    // Pre-validate credentials to provide better error messages
    const user = await authenticateUser(email, password);

    if (!user) {
      return {
        success: false,
        error:
          "Credenciales inválidas. Por favor verifique su email y contraseña.",
      };
    }

    // Use redirect: true to let NextAuth handle the flow properly
    // The auth.ts redirect callback will send user to /auth-success
    // This ensures cookies are properly set before any client-side navigation
    await signIn("credentials", {
      email,
      password,
      redirect: true,
      redirectTo: "/auth-success",
    });

    // This line won't be reached due to redirect above
    // But return success for type safety
    return { success: true };
  } catch (error) {
    // Only catch actual errors, not redirects
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            error:
              "Credenciales inválidas. Por favor verifique su email y contraseña.",
          };
        case "CallbackRouteError":
          return {
            success: false,
            error: "Error de autenticación. Por favor intente nuevamente.",
          };
        default:
          return {
            success: false,
            error: "Error de autenticación. Por favor intente nuevamente.",
          };
      }
    }

    // Re-throw redirect errors (NextAuth uses throw for redirects)
    throw error;
  }
}

export async function loginAction(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Credenciales inválidas" };
    }
    return { success: false, error: "Error de autenticación" };
  }
}

export async function logoutAction() {
  try {
    await signOut({ redirect: false });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al cerrar sesión" };
  }
}
