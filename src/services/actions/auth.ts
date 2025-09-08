'use server';

import { signIn, signOut } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('🔐 Auth attempt:', { email, hasPassword: !!password });

    if (!email || !password) {
      return 'Por favor, completa todos los campos';
    }

    // Let NextAuth handle redirects after authentication
    // We'll redirect to auth-success which will handle role-based routing
    console.log('🔐 Attempting authentication');

    // Try without redirect first to see if authentication works
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false, // Don't redirect immediately
    });

    console.log('🔐 Sign in result:', result);

    if (result?.error) {
      console.log('❌ Sign in error:', result.error);
      return 'Credenciales inválidas';
    }

    // If successful, redirect manually
    console.log('✅ Sign in successful, redirecting to auth-success');
    redirect('/auth-success');

    // This line should never be reached due to redirect
    console.log('🚨 Unexpected: signIn completed without redirect');
    return undefined;
  } catch (error) {
    console.log('🚨 Auth error:', error);

    // NextAuth throws redirect as an error - allow it to propagate
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      console.log('✅ NextAuth redirect detected, allowing propagation');
      throw error;
    }

    if (error instanceof AuthError) {
      console.log('❌ NextAuth AuthError:', error.type);
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Credenciales inválidas';
        default:
          return 'Error al iniciar sesión';
      }
    }

    // Handle other errors
    console.log('❌ Unknown auth error:', error);
    return 'Error al iniciar sesión. Por favor, intenta nuevamente.';
  }
}

export async function logout() {
  await signOut({ redirectTo: '/', redirect: true });
}
