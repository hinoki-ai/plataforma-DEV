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

  return (
    <SessionProvider
      refetchInterval={600} // Refresh every 10 minutes to reduce server load
      refetchOnWindowFocus={shouldRefetchOnFocus} // Selective window focus refresh
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
