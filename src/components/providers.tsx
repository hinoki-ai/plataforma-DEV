"use client";

import { ClerkProvider } from "@clerk/nextjs";

import { ThemeProvider } from "./theme-provider";
import { DesktopToggleProvider } from "@/lib/hooks/useDesktopToggle";
// 🕊️ DIVINE PARSING ORACLE - Now using chunked i18n system
import { LanguageProvider } from "@/components/language/LanguageContext";
import { ContextProvider } from "./providers/ContextProvider";
import { WebVitalsProvider } from "./providers/WebVitalsProvider";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { AppSessionProvider } from "@/lib/auth-client";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <AppSessionProvider>
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
        </AppSessionProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
