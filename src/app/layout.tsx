import React from "react";

import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { homeMetadata, organizationSchema } from "@/lib/seo";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ThemeAwareFavicon } from "@/components/ui/theme-aware-favicon";
import { HomepageMusic } from "@/components/shared/HomepageMusic";
import { AudioConsentBanner } from "@/components/shared/AudioConsentBanner";
import { cookies, headers } from "next/headers";
import "./globals.css";

// Using system fonts instead of Google Fonts to avoid network dependencies during build
const inter = {
  variable: "--font-inter",
  className: "font-sans",
};

// Apple touch icon configured via Next.js metadata API

export const metadata: Metadata = {
  ...homeMetadata,
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  applicationName: "Plataforma Astral",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Plataforma Astral",
  },
  other: {
    "msapplication-TileColor": "#1e40af",
    "msapplication-TileImage": "/favicon-32x32.png",
    "msapplication-config": "/browserconfig.xml",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light dark",
};

async function RootLayoutInner({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side language detection to prevent hydration mismatches
  const detectServerLanguage = async (): Promise<"es" | "en"> => {
    try {
      const cookieStore = await cookies();
      const languageCookie = cookieStore.get(
        "aramac-language-preference",
      )?.value;

      // If we have a stored language preference, use it (highest priority)
      if (languageCookie === "es" || languageCookie === "en") {
        return languageCookie as "es" | "en";
      }

      // Check Accept-Language header to match client-side browser language detection
      const headersStore = await headers();
      const acceptLanguage = headersStore.get("accept-language");

      if (acceptLanguage) {
        const browserLang = acceptLanguage.toLowerCase();

        // Check for exact matches first
        if (browserLang.startsWith("es")) return "es";
        if (browserLang.startsWith("en")) return "en";

        // Check language code without region
        const langCode = browserLang.split("-")[0];
        if (langCode === "es") return "es";
        if (langCode === "en") return "en";
      }

      // Default to Spanish for Chile-based application
      return "es";
    } catch (error) {
      // Fallback to Spanish if detection fails
      return "es";
    }
  };

  const initialLanguage = await detectServerLanguage();

  return (
    <html lang="es-CL" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationSchema }}
        />
        {/* ARIA Live Regions for screen readers */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          id="announcements"
          role="status"
        />
        <div
          aria-live="assertive"
          aria-atomic="true"
          className="sr-only"
          id="alerts"
          role="alert"
        />
        <div
          aria-live="polite"
          className="sr-only"
          id="notifications"
          role="log"
        />
        {/* Language change announcements for screen readers */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          id="language-announcement"
          role="status"
        />

        <ErrorBoundary>
          <Providers initialLanguage={initialLanguage}>
            <HomepageMusic />
            {children}
            {/* Theme-aware favicon handling */}
            <ThemeAwareFavicon />
            {/* Audio consent banner */}
            <AudioConsentBanner />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return <RootLayoutInner>{props.children}</RootLayoutInner>;
}
