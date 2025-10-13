"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Component that handles theme-aware favicon switching on the client side
 * Prevents hydration mismatches by only running on the client
 */
export function ThemeAwareFavicon() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const updateFavicon = (isDark: boolean) => {
      // Find all favicon link elements
      const faviconLinks = document.querySelectorAll(
        'link[rel*="icon"]',
      ) as NodeListOf<HTMLLinkElement>;

      faviconLinks.forEach((link) => {
        // Only update links that point to our theme-aware favicons (josh-happy images)
        const currentHref = link.href;
        if (currentHref.includes("josh-happy")) {
          link.href = isDark ? "/josh-happy-dark.png" : "/josh-happy-light.png";
        }
      });
    };

    // Update favicon based on current theme
    if (resolvedTheme) {
      updateFavicon(resolvedTheme === "dark");
    }

    // Listen for theme changes using MutationObserver on document class
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const isDark = document.documentElement.classList.contains("dark");
          updateFavicon(isDark);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [resolvedTheme]);

  return null; // This component doesn't render anything
}
