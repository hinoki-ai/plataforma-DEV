import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createI18nMiddleware } from "./middleware/i18n";

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/registro",
  "/registro-centro",
  "/auth-success",
  "/cpma",
];

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/master(.*)",
  "/admin(.*)",
  "/profesor(.*)",
  "/parent(.*)",
]);

const i18nMiddleware = createI18nMiddleware();

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Handle i18n routing first (language detection and cookies)
  const i18nResponse = i18nMiddleware(req);
  if (i18nResponse) {
    return i18nResponse;
  }

  // Skip middleware for static assets and API routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // If it's a protected route and user is not authenticated, redirect to login
  if (isProtectedRoute(req) && !(await auth()).userId) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user on login page → redirect to success
  if ((await auth()).userId && pathname.startsWith("/login")) {
    const successUrl = req.nextUrl.clone();
    successUrl.pathname = "/auth-success";
    successUrl.searchParams.set("next", pathname + req.nextUrl.search);
    return NextResponse.redirect(successUrl);
  }

  // Public routes and authenticated users → allow access
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
