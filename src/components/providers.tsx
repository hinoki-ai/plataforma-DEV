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

  // CRITICAL: Use window.location.origin for baseUrl on client side
  // SessionProvider is a client component and needs the base URL to construct
  // fetch requests to /api/auth/*. Without this, auth requests fail with NetworkError.
  // Cannot use NEXTAUTH_URL env var as it's server-side only (no NEXT_PUBLIC_ prefix).
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : undefined;

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
