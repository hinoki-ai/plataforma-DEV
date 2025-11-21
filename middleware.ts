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
  // DEV MODE: Handle development authentication redirects
  if (req.nextUrl.pathname === "/autenticacion-exitosa") {
    const devRole = req.nextUrl.searchParams.get("dev_role");
    const devName = req.nextUrl.searchParams.get("dev_name");
    const devEmail = req.nextUrl.searchParams.get("dev_email");
    if (
      devRole &&
      (req.nextUrl.hostname === "localhost" ||
        req.nextUrl.hostname === "127.0.0.1")
    ) {
      // Development mode: redirect based on dev_role parameter and set dev auth cookie
      const rolePaths = {
        MASTER: "/master",
        ADMIN: "/admin",
        PROFESOR: "/profesor",
        PARENT: "/parent",
      };
      const targetPath =
        rolePaths[devRole as keyof typeof rolePaths] || "/master";

      const response = NextResponse.redirect(new URL(targetPath, req.url));
      // Set a cookie to indicate dev authentication
      response.cookies.set(
        "dev_auth",
        JSON.stringify({
          role: devRole,
          name: devName,
          email: devEmail,
          authenticated: true,
        }),
        {
          httpOnly: false, // Allow client-side access
          secure: false, // Allow on localhost
          sameSite: "lax",
          path: "/",
        },
      );

      return response;
    }
  }

  // DEV MODE: Allow access to protected routes with dev authentication
  if (isProtectedRoute(req) && !(await auth()).userId) {
    // Check for dev mode authentication cookie
    const devAuthCookie = req.cookies.get("dev_auth")?.value;
    if (
      (req.nextUrl.hostname === "localhost" ||
        req.nextUrl.hostname === "127.0.0.1") &&
      devAuthCookie
    ) {
      try {
        const devAuth = JSON.parse(devAuthCookie);
        if (devAuth.authenticated) {
          // Allow dev access - skip authentication check
          return NextResponse.next();
        }
      } catch (e) {
        // Invalid cookie, continue to login redirect
      }
    }

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
