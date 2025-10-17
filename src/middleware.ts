import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/registro",
  "/auth-success",
  "/centro-consejo",
];

const PROTECTED_PREFIXES = ["/master", "/admin", "/profesor", "/parent"];

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

function addSecurityHeaders(response: NextResponse) {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return addSecurityHeaders(NextResponse.next());
  }

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  const { userId } = await auth();

  if (isProtected && !userId) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    return addSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  if (userId && pathname.startsWith("/login")) {
    const successUrl = req.nextUrl.clone();
    successUrl.pathname = "/auth-success";
    successUrl.searchParams.set("next", pathname + req.nextUrl.search);
    return addSecurityHeaders(NextResponse.redirect(successUrl));
  }

  if (isPublic) {
    return addSecurityHeaders(NextResponse.next());
  }

  if (!userId) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    return addSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return addSecurityHeaders(NextResponse.next());
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
