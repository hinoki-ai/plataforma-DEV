// Middleware-compatible authentication helper
// This runs in Edge Runtime and doesn't use Prisma

import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production'
);

export interface MiddlewareUser {
  id: string;
  email: string;
  name?: string | null;
  role: 'MASTER' | 'ADMIN' | 'PROFESOR' | 'PARENT' | 'PUBLIC';
  needsRegistration?: boolean;
  isOAuthUser?: boolean;
}

export interface MiddlewareSession {
  user: MiddlewareUser;
  expires: string;
}

/**
 * Extract and validate JWT token from request cookies
 * Compatible with NextAuth JWT structure
 */
export async function getMiddlewareAuth(request: NextRequest): Promise<MiddlewareSession | null> {
  try {
    // Get the session token from cookies (NextAuth uses 'next-auth.session-token')
    const token = request.cookies.get('next-auth.session-token')?.value ||
                  request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!token) {
      return null;
    }

    // Verify and decode the JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Extract user data from JWT payload
    const user: MiddlewareUser = {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string | null,
      role: payload.role as 'MASTER' | 'ADMIN' | 'PROFESOR' | 'PARENT' | 'PUBLIC',
      needsRegistration: payload.needsRegistration as boolean,
      isOAuthUser: payload.isOAuthUser as boolean,
    };

    return {
      user,
      expires: payload.exp ? new Date(payload.exp * 1000).toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    // Token is invalid or expired
    console.warn('Middleware auth error:', error);
    return null;
  }
}

/**
 * Check if user has required role for route access
 */
export function hasMiddlewareAccess(
  userRole: string | undefined,
  requiredRoles: string[]
): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * Get redirect path based on user role
 */
export function getRoleRedirectPath(userRole: string | undefined): string {
  switch (userRole) {
    case 'MASTER':
      return '/master';
    case 'ADMIN':
      return '/admin';
    case 'PROFESOR':
      return '/profesor';
    case 'PARENT':
      return '/parent';
    default:
      return '/';
  }
}