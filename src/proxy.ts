import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
// Inline i18n handling (replaces middleware usage)
const LOCALES = ["es", "en"] as const;
type Locale = (typeof LOCALES)[number];
const DEFAULT_LOCALE: Locale = "es";
const LOCALE_COOKIE = "aramac-language-preference";

function getLocaleFromRequest(req: Request): Locale {
  try {
    // 1) Cookie preference
    // @ts-expect-error - next Request has cookies()
    const cookieLocale = req.cookies?.get?.(LOCALE_COOKIE)?.value;
    if (cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)) {
      return cookieLocale as Locale;
    }

    // 2) Accept-Language header
    const acceptLanguage = req.headers.get("accept-language");
    if (acceptLanguage) {
      const languages = acceptLanguage.split(",").map((lang) => {
        const [locale] = lang.trim().split(";");
        return locale.split("-")[0];
      });
      for (const lang of languages) {
        if ((LOCALES as readonly string[]).includes(lang)) {
          return lang as Locale;
        }
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_LOCALE;
}

function setLocaleCookie(response: NextResponse, locale: Locale) {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/registro",
  "/registro-centro",
  "/autenticacion-exitosa",
  "/cpma",
];

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/master(.*)",
  "/admin(.*)",
  "/profesor(.*)",
  "/parent(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Handle i18n first (detect and persist cookie; no URL prefixing)
  const locale = getLocaleFromRequest(req);
  const res = NextResponse.next();
  setLocaleCookie(res, locale);

  // Skip middleware for static assets and API routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return res;
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
    successUrl.pathname = "/autenticacion-exitosa";
    successUrl.searchParams.set("next", pathname + req.nextUrl.search);
    return NextResponse.redirect(successUrl);
  }

  // Public routes and authenticated users → allow access
  return res;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
