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
 * Returns error message string or undefined on success
 */
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return "Por favor ingrese email y contraseña";
    }

    // First authenticate to get user data without redirect
    const user = await authenticateUser(email, password);

    if (!user) {
      return "Credenciales inválidas. Por favor verifique su email y contraseña.";
    }

    // Determine redirect URL based on user role
    let redirectUrl = "/";
    switch (user.role) {
      case "MASTER":
        redirectUrl = "/master";
        break;
      case "ADMIN":
        redirectUrl = "/admin";
        break;
      case "PROFESOR":
        redirectUrl = "/profesor";
        break;
      case "PARENT":
        redirectUrl = user.needsRegistration ? "/centro-consejo" : "/parent";
        break;
      default:
        redirectUrl = "/";
    }

    // Sign in and redirect to the appropriate dashboard
    await signIn("credentials", {
      email,
      password,
      redirectTo: redirectUrl,
    });

    // This line should never be reached if signIn succeeds (it redirects)
    return undefined;
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Credenciales inválidas. Por favor verifique su email y contraseña.";
        case "CallbackRouteError":
          return "Error de autenticación. Por favor intente nuevamente.";
        default:
          return "Error de autenticación. Por favor intente nuevamente.";
      }
    }

    // If it's a redirect (successful login), rethrow
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
