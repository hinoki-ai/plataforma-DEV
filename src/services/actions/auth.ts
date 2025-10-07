/**
 * Auth Actions - Convex Implementation
 * Server Actions for authentication
 */

'use server';

import { signIn, signOut } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

/**
 * Authenticate user with credentials (for useActionState hook)
 * Returns error message string or undefined on success
 */
export async function authenticate(
  prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return 'Por favor ingrese email y contraseña';
    }

    await signIn('credentials', {
      email,
      password,
      redirectTo: '/auth-success',
    });

    // If signIn succeeds, redirect will happen automatically
    return undefined;
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Credenciales inválidas. Por favor verifique su email y contraseña.';
        case 'CallbackRouteError':
          return 'Error de autenticación. Por favor intente nuevamente.';
        default:
          return 'Error de autenticación. Por favor intente nuevamente.';
      }
    }
    
    // If it's a redirect (successful login), rethrow
    throw error;
  }
}

export async function loginAction(email: string, password: string) {
  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: 'Credenciales inválidas' };
    }
    return { success: false, error: 'Error de autenticación' };
  }
}

export async function logoutAction() {
  try {
    await signOut({ redirect: false });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error al cerrar sesión' };
  }
}
