"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./theme-provider";
import { DesktopToggleProvider } from "@/lib/hooks/useDesktopToggle";
// 🕊️ DIVINE PARSING ORACLE - Now using chunked i18n system
import { LanguageProvider } from "@/components/language/LanguageContext";
import { ContextProvider } from "./providers/ContextProvider";
import { WebVitalsProvider } from "./providers/WebVitalsProvider";
import { usePathname } from "next/navigation";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const convex = new ConvexReactClient(convexUrl);

function OptimizedSessionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Only refetch on window focus for auth-related routes
  const shouldRefetchOnFocus =
    pathname === "/login" || pathname === "/auth-success";

  // CRITICAL FIX: SessionProvider baseUrl configuration
  // ================================================================
  // PROBLEM: Without baseUrl, SessionProvider cannot construct proper URLs
  // for auth API requests (/api/auth/session, /api/auth/csrf, etc.),
  // resulting in "NetworkError when attempting to fetch resource"
  //
  // WHY window.location.origin:
  // - SessionProvider is a CLIENT component ("use client")
  // - NEXTAUTH_URL env var is SERVER-SIDE ONLY (no NEXT_PUBLIC_ prefix)
  // - process.env.NEXTAUTH_URL returns undefined in client components
  // - window.location.origin provides the actual browser origin
  //
  // This ensures auth requests go to:
  // https://plataforma.aramac.dev/api/auth/* (production)
  // http://localhost:3000/api/auth/* (development)
  // ================================================================
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : undefined;

  if (typeof window !== "undefined" && !baseUrl) {
    console.error(
      "[AUTH ERROR] Failed to determine baseUrl for SessionProvider",
    );
  }

  return (
    <SessionProvider
      refetchInterval={600} // Refresh every 10 minutes to reduce server load
      refetchOnWindowFocus={shouldRefetchOnFocus} // Selective window focus refresh
      refetchWhenOffline={false}
      basePath="/api/auth"
      baseUrl={baseUrl}
    >
      {children}
    </SessionProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <OptimizedSessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
          storageKey="school-theme"
          forcedTheme={undefined}
          nonce={undefined}
        >
          <ContextProvider>
            <LanguageProvider>
              <DesktopToggleProvider>
                <WebVitalsProvider>{children}</WebVitalsProvider>
              </DesktopToggleProvider>
            </LanguageProvider>
          </ContextProvider>
        </ThemeProvider>
      </OptimizedSessionProvider>
    </ConvexProvider>
  );
}
