import React from "react";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { homeMetadata, organizationSchema } from "@/lib/seo";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ThemeAwareFavicon } from "@/components/ui/theme-aware-favicon";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
  preload: true,
  adjustFontFallback: true,
});

// Apple touch icon is configured via Next.js metadata API (modern approach)

export const metadata: Metadata = {
  ...homeMetadata,
  icons: {
    apple: "/apple-touch-icon-180.png",
  },
};

function RootLayoutInner({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationSchema }}
        />
        {/* Removed theme-color meta tag - not supported by Firefox/Opera */}
        <meta name="color-scheme" content="light dark" />
        <meta name="msapplication-TileColor" content="#1e40af" />
        <meta name="msapplication-TileImage" content="/tile-150.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="application-name" content="Plataforma Astral" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"
        />

        {/* Preload homepage background image for performance */}
        <link rel="preload" as="image" href="/bg2.jpg" />

        {/* Responsive background images for different screen sizes */}
        <link
          rel="preload"
          as="image"
          href="/bg2-mobile.jpg"
          media="(max-width: 768px)"
        />
        <link
          rel="preload"
          as="image"
          href="/bg2-desktop.jpg"
          media="(min-width: 769px)"
        />

        {/* Preload critical resources */}
        {/* Google Fonts preconnect handled automatically by next/font/google */}

        {/* BROWSER TAB FAVICON - Default favicon for SSR */}
        <link rel="icon" type="image/png" sizes="32x32" href="/dfav.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/dfav.png" />
        <link rel="shortcut icon" href="/dfav.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Plataforma Astral" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
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

        <ErrorBoundary>
          <Providers>
            {children}
            {/* Theme-aware favicon handling */}
            <ThemeAwareFavicon />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return <RootLayoutInner>{props.children}</RootLayoutInner>;
}
