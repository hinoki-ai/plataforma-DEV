import { NextRequest, NextResponse } from "next/server";

// Supported locales
export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = "es";

// Locale detection order
const LOCALE_COOKIE = "aramac-language-preference";
const LOCALE_HEADER = "accept-language";

// Get locale from request
export function getLocaleFromRequest(request: NextRequest): Locale {
  // 1. Check cookie (user preference)
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  // 2. Check Accept-Language header
  const acceptLanguage = request.headers.get(LOCALE_HEADER);
  if (acceptLanguage) {
    // Parse Accept-Language header (e.g., "es-CL,en-US;q=0.9,en;q=0.8")
    const languages = acceptLanguage.split(",").map((lang) => {
      const [locale] = lang.trim().split(";");
      return locale.split("-")[0]; // Get language code without region
    });

    for (const lang of languages) {
      if (locales.includes(lang as Locale)) {
        return lang as Locale;
      }
    }
  }

  // 3. Fallback to default locale
  return defaultLocale;
}

// Set locale cookie
export function setLocaleCookie(response: NextResponse, locale: Locale) {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: false, // Allow client-side access
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

// Language routing middleware
export function createI18nMiddleware() {
  return function i18nMiddleware(
    request: NextRequest,
  ): NextResponse | undefined {
    const { pathname } = request.nextUrl;

    // Skip middleware for static files, API routes, and Next.js internals
    if (
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/api/") ||
      pathname.includes(".") ||
      pathname.startsWith("/favicon") ||
      pathname.startsWith("/manifest") ||
      pathname.startsWith("/robots.txt") ||
      pathname.startsWith("/sitemap")
    ) {
      return undefined;
    }

    // Get current locale from request
    const currentLocale = getLocaleFromRequest(request);

    // If no locale prefix and not default locale, redirect to localized path
    // For now, we'll keep URLs without locale prefixes since the app uses context-based language switching
    // This can be extended later for full URL-based internationalization

    // Set locale cookie for future requests
    const response = NextResponse.next();
    setLocaleCookie(response, currentLocale);

    return response;
  };
}
