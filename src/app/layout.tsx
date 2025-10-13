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

function RootLayoutInner({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
