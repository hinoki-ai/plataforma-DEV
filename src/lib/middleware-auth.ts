// Middleware-compatible authentication helper
// This runs in Edge Runtime and doesn't use Prisma

import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production",
);

export interface MiddlewareUser {
  id: string;
  email: string;
  name?: string | null;
  role: "MASTER" | "ADMIN" | "PROFESOR" | "PARENT" | "PUBLIC";
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
export async function getMiddlewareAuth(
  request: NextRequest,
): Promise<MiddlewareSession | null> {
  try {
    // Determine cookie names based on environment
    // In production with HTTPS, NextAuth uses __Secure- prefix
    // In development (HTTP), it uses standard names
    const isSecure = process.env.NODE_ENV === "production" || 
                     request.nextUrl.protocol === "https:";
    
    const cookieNames = isSecure 
      ? [
          "__Secure-next-auth.session-token",
          "__Secure-authjs.session-token",
          "next-auth.session-token", // Fallback
          "authjs.session-token",
        ]
      : [
          "next-auth.session-token",
          "authjs.session-token",
          "__Secure-next-auth.session-token", // Fallback
          "__Secure-authjs.session-token",
        ];

    let token: string | undefined;
    let foundCookieName: string | undefined;
    
    for (const cookieName of cookieNames) {
      token = request.cookies.get(cookieName)?.value;
      if (token) {
        foundCookieName = cookieName;
        if (process.env.NODE_ENV === "development") {
          console.log("🔑 Found session token in cookie:", cookieName);
        }
        break;
      }
    }

    if (!token) {
      if (process.env.NODE_ENV === "development") {
        const allCookies = request.cookies.getAll();
        console.log("❌ No session token found. Available cookies:", 
          allCookies.map(c => c.name).join(", ") || "none");
      }
      return null;
    }

    // Verify and decode the JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (process.env.NODE_ENV === "development") {
      console.log("✅ JWT verified, payload:", {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      });
    }

    // Extract user data from JWT payload
    const user: MiddlewareUser = {
      id: (payload.id || payload.sub) as string,
      email: payload.email as string,
      name: (payload.name as string) || null,
      role: payload.role as
        | "MASTER"
        | "ADMIN"
        | "PROFESOR"
        | "PARENT"
        | "PUBLIC",
      needsRegistration: (payload.needsRegistration as boolean) || false,
      isOAuthUser: (payload.isOAuthUser as boolean) || false,
    };

    return {
      user,
      expires: payload.exp
        ? new Date(payload.exp * 1000).toISOString()
        : new Date().toISOString(),
    };
  } catch (error) {
    // Token is invalid or expired
    if (process.env.NODE_ENV === "development") {
      console.warn("❌ Middleware auth error:", error);
    } else {
      // Log minimal info in production for debugging (without sensitive details)
      console.log("❌ Auth validation failed");
    }
    return null;
  }
}

/**
 * Check if user has required role for route access
 */
export function hasMiddlewareAccess(
  userRole: string | undefined,
  requiredRoles: string[],
): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * Get redirect path based on user role
 */
export function getRoleRedirectPath(userRole: string | undefined): string {
  switch (userRole) {
    case "MASTER":
      return "/master";
    case "ADMIN":
      return "/admin";
    case "PROFESOR":
      return "/profesor";
    case "PARENT":
      return "/parent";
    default:
      return "/";
  }
}
