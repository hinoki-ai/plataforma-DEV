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

  // CRITICAL FIX: NextAuth 5.0.0-beta SessionProvider Configuration
  // ================================================================
  // ISSUE: NetworkError when attempting to fetch resource
  // 
  // APPROACHES TRIED:
  // 1. baseUrl with window.location.origin - FAILED
  // 2. baseUrl with process.env.NEXTAUTH_URL - FAILED (undefined on client)
  // 
  // CURRENT SOLUTION: Let SessionProvider use relative URLs
  // This bypasses the baseUrl construction entirely and uses same-origin fetch
  // ================================================================
  
  if (typeof window !== "undefined") {
    console.log(
      `[AUTH DEBUG] SessionProvider configured with basePath: /api/auth (relative URLs)`,
    );
    console.log(
      `[AUTH DEBUG] Session endpoint: ${window.location.origin}/api/auth/session`,
    );
  }

  return (
    <SessionProvider
      refetchInterval={600} // Refresh every 10 minutes
      refetchOnWindowFocus={shouldRefetchOnFocus} // Selective window focus
      refetchWhenOffline={false}
      basePath="/api/auth" // Use basePath only, no baseUrl
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
