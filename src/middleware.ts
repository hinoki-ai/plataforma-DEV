import {
  getMiddlewareAuth,
  hasMiddlewareAccess,
  getRoleRedirectPath,
} from "@/lib/middleware-auth";
import { NextRequest, NextResponse } from "next/server";

// Role hierarchy for authorization (future use in role comparison)
const _ROLE_HIERARCHY = {
  MASTER: 4,
  ADMIN: 3,
  PROFESOR: 2,
  PARENT: 1,
  PUBLIC: 0,
} as const;

type UserRole = keyof typeof _ROLE_HIERARCHY;

// Route access control matrix
const ROUTE_ACCESS: Record<string, UserRole[]> = {
  "/master": ["MASTER"],
  "/admin": ["MASTER", "ADMIN"],
  "/profesor": ["MASTER", "ADMIN", "PROFESOR"],
  "/parent": ["MASTER", "ADMIN", "PARENT"],
  "/api/master": ["MASTER"],
  "/api/admin": ["MASTER", "ADMIN"],
  "/api/profesor": ["MASTER", "ADMIN", "PROFESOR"],
  "/api/parent": ["MASTER", "ADMIN", "PARENT"],
};

// Security headers for all responses
const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
} as const;

function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Authorization helper moved to middleware-auth.ts

// Edge Runtime compatible middleware
export default async function middleware(req: NextRequest) {
  try {
    const { nextUrl } = req;
    const pathname = nextUrl.pathname;

    // Skip middleware for static assets, system paths, and auth transition pages
    // CRITICAL: /auth-success must bypass all auth checks to prevent redirect loops
    if (
      pathname.includes("_next/static") ||
      pathname.includes("_next/image") ||
      pathname.includes("favicon") ||
      pathname.startsWith("/auth-success") ||
      pathname.startsWith("/api/auth") ||
      pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/)
    ) {
      const response = NextResponse.next();
      return addSecurityHeaders(response);
    }

    // Get session and user info using middleware-compatible auth
    const session = await getMiddlewareAuth(req);
    const isLoggedIn = Boolean(session?.user);
    const userRole = session?.user?.role as UserRole | undefined;

    // Log security events in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🔐 Route: ${pathname} | User: ${userRole || "ANONYMOUS"} | Logged: ${isLoggedIn}`,
      );
    }

    // Handle auth pages - only redirect if session is fully established
    // CRITICAL: Don't redirect during login/registration process to avoid loops
    const isAuthPage =
      pathname.startsWith("/login") || pathname.startsWith("/registro");

    if (isAuthPage && isLoggedIn && userRole) {
      // Only redirect if user has a valid, complete session
      // This prevents redirect loops during the login process
      if (session?.user?.id && session?.user?.email && session?.user?.role) {
        const redirectPath = getRoleRedirectPath(userRole);
        if (process.env.NODE_ENV === "development") {
          console.log(
            `👤 Logged in user on auth page, redirecting to ${redirectPath}`,
          );
        }
        const response = NextResponse.redirect(new URL(redirectPath, nextUrl));
        return addSecurityHeaders(response);
      }
    }

    // Check if route requires authentication
    const requiresAuth = Object.keys(ROUTE_ACCESS).some((route) =>
      pathname.startsWith(route),
    );

    if (requiresAuth && !isLoggedIn) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `🔒 Auth required for ${pathname} but user not logged in - redirecting to login`,
        );
      }
      const loginUrl = new URL("/login", nextUrl);
      // Preserve the original URL for redirect after login
      loginUrl.searchParams.set("callbackUrl", pathname + nextUrl.search);
      const response = NextResponse.redirect(loginUrl);
      return addSecurityHeaders(response);
    }

    // Check authorization for protected routes
    if (requiresAuth) {
      // Find matching route pattern for authorization
      const matchingRoute = Object.keys(ROUTE_ACCESS).find((route) =>
        pathname.startsWith(route),
      );

      if (
        matchingRoute &&
        !hasMiddlewareAccess(userRole, ROUTE_ACCESS[matchingRoute])
      ) {
        // Log unauthorized access attempt
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `🚨 Unauthorized access attempt: ${userRole} → ${pathname}`,
          );
        }

        // Redirect to appropriate dashboard or show unauthorized
        const allowedPath =
          isLoggedIn && userRole
            ? getRoleRedirectPath(userRole)
            : "/unauthorized";

        const response = NextResponse.redirect(new URL(allowedPath, nextUrl));
        return addSecurityHeaders(response);
      }
    }

    // Add security headers to all responses
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  } catch (error) {
    console.error("🚨 Middleware error:", error);

    // Fail secure - redirect to login on error, preserving callback URL
    const loginUrl = new URL("/login", req.nextUrl);
    const pathname = req.nextUrl.pathname;

    // Only add callback if not already on auth pages
    if (!pathname.startsWith("/login") && !pathname.startsWith("/registro")) {
      loginUrl.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    }

    const response = NextResponse.redirect(loginUrl);
    return addSecurityHeaders(response);
  }
}

export const config = {
  matcher: [
    // Match all request paths except static files and system paths
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
