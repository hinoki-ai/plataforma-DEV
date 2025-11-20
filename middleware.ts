import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/contacto",
  "/cpma",
  "/acuerdo-proteccion-datos",
  "/equipo-multidisciplinario",
  "/privacidad",
  "/programas",
  "/registro-centro",
  "/terminos",
  "/planes",
  "/docs(.*)",
  "/api/health",
  "/api/contacto",
  "/api/cpma",
  "/api/magic-login(.*)",
  "/api/auth(.*)",
];

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/master(.*)",
  "/admin(.*)",
  "/profesor(.*)",
  "/parent(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // If it's a protected route and user is not authenticated, redirect to login
  if (isProtectedRoute(req) && !(await auth()).userId) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Allow authenticated users to access any route
  // Role-based access control is handled in the layouts/components
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
