"use client";

import { ClerkProvider } from "@clerk/nextjs";

import { ThemeProvider } from "./theme-provider";
import { DesktopToggleProvider } from "@/lib/hooks/useDesktopToggle";
// 🕊️ DIVINE PARSING ORACLE - Now using chunked i18n system
import { DivineParsingOracleProvider } from "@/components/language/ChunkedLanguageProvider";
import { LanguageHtmlUpdater } from "@/components/language/LanguageHtmlUpdater";
import { ContextProvider } from "./providers/ContextProvider";
import { WebVitalsProvider } from "./providers/WebVitalsProvider";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { AppSessionProvider } from "@/lib/auth-client";
import { clerkConfig } from "@/lib/clerk-config";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider {...clerkConfig}>
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
                <LanguageHtmlUpdater />
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
