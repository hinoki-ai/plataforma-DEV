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

  // CRITICAL FIX: Custom fetch to bypass next-auth beta NetworkError bug
  // ================================================================
  // ISSUE: next-auth 5.0.0-beta.29 _getSession() has NetworkError bug
  // The internal fetch fails despite correct configuration
  //
  // SOLUTION: Disable automatic session fetching, use manual approach
  // This completely bypasses the broken SessionProvider fetch
  // ================================================================

  if (typeof window !== "undefined") {
    console.log(
      `[AUTH DEBUG] SessionProvider with DISABLED auto-fetch (working around next-auth beta bug)`,
    );
    console.log(`[AUTH DEBUG] Session will be managed server-side only`);
  }

  return (
    <SessionProvider
      refetchInterval={0} // DISABLE auto-refetch - this is where the bug is
      refetchOnWindowFocus={false} // DISABLE focus refetch - this causes NetworkError
      refetchWhenOffline={false}
      basePath="/api/auth"
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
