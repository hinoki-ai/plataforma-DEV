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
import { CognitoWelcomeToast } from "./ui/cognito-welcome-toast";
import { CognitoIndicator } from "./ui/cognito-indicator";
import { CognitoProactiveSuggestions } from "./ui/cognito-proactive";
import {
  CognitoAnalyticsProvider,
  CognitoAnalyticsDashboard,
} from "./ui/cognito-analytics";
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
              <CognitoAnalyticsProvider>
                <ClientOnly>
                  <CognitoWelcomeToast />
                  <CognitoIndicator />
                  <CognitoProactiveSuggestions />
                  <CognitoAnalyticsDashboard />
                </ClientOnly>
              </CognitoAnalyticsProvider>
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
