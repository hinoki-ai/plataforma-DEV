import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default authMiddleware({
  // Routes that require authentication
  publicRoutes: [
    "/",
    "/contacto",
    "/cpma",
    "/dpa",
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
  ],

  // Routes that require specific roles
  afterAuth(auth, req, evt) {
    // If the user is not authenticated and trying to access a protected route
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // Allow authenticated users to access any route
    // Role-based access control is handled in the layouts/components
    return NextResponse.next();
  },
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
