"use client";

import { ClerkProvider } from "@clerk/nextjs";

import { ThemeProvider } from "./theme-provider";
import { DesktopToggleProvider } from "@/lib/hooks/useDesktopToggle";
// 🕊️ DIVINE PARSING ORACLE - Using chunked i18n system directly
import { DivineParsingOracleProvider } from "@/components/language/ChunkedLanguageProvider";
import { LanguageHtmlUpdater } from "@/components/language/LanguageHtmlUpdater";
import { ContextProvider } from "./providers/ContextProvider";
import { WebVitalsProvider } from "./providers/WebVitalsProvider";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { AppSessionProvider } from "@/lib/auth-client";
import { clerkConfig } from "@/lib/clerk-config";
import { PreloadingProvider } from "./providers/PreloadingProvider";
import { JoshWelcomeToast } from "./ui/josh-welcome-toast";
import { JoshIndicator } from "./ui/josh-indicator";
import { JoshProactiveSuggestions } from "./ui/josh-proactive";
import {
  JoshAnalyticsProvider,
  JoshAnalyticsDashboard,
} from "./ui/josh-analytics";
import { ClientOnly } from "./ui/client-only";

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
            <DivineParsingOracleProvider
              initialNamespaces={[
                "common",
                "navigation",
                "language",
                "admin",
                "profesor",
                "parent",
                "dashboard",
                "programas",
                "contacto",
                "planes",
              ]}
            >
              <LanguageHtmlUpdater />
              <JoshAnalyticsProvider>
                <ClientOnly>
                  <JoshWelcomeToast />
                  <JoshIndicator />
                  <JoshProactiveSuggestions />
                  <JoshAnalyticsDashboard />
                </ClientOnly>
              </JoshAnalyticsProvider>
              <ContextProvider>
                <DesktopToggleProvider>
                  <WebVitalsProvider>
                    <PreloadingProvider>{children}</PreloadingProvider>
                  </WebVitalsProvider>
                </DesktopToggleProvider>
              </ContextProvider>
            </DivineParsingOracleProvider>
          </ThemeProvider>
        </AppSessionProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
