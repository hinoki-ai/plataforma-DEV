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
      const favicon32 = document.querySelector(
        'link[rel="icon"][sizes="32x32"]',
      ) as HTMLLinkElement;
      const favicon16 = document.querySelector(
        'link[rel="icon"][sizes="16x16"]',
      ) as HTMLLinkElement;
      const shortcutIcon = document.querySelector(
        'link[rel="shortcut icon"]',
      ) as HTMLLinkElement;

      if (favicon32) favicon32.href = isDark ? "/josh-happy-dark.png" : "/josh-happy-light.png";
      if (favicon16) favicon16.href = isDark ? "/josh-happy-dark.png" : "/josh-happy-light.png";
      if (shortcutIcon) shortcutIcon.href = isDark ? "/josh-happy-dark.png" : "/josh-happy-light.png";
    };

    // Update favicon based on current theme
    if (resolvedTheme) {
      updateFavicon(resolvedTheme === "dark");
    }

    // Listen for theme changes
    const handleThemeChange = (newTheme: string) => {
      updateFavicon(newTheme === "dark");
    };

    // We can't directly listen to theme changes from next-themes
    // So we'll use a MutationObserver on the document's class attribute
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
