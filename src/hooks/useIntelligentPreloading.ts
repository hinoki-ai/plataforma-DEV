"use client";

import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

interface PreloadOptions {
  priority?: "low" | "high";
  as?: "script" | "style" | "font" | "image" | "fetch" | "document";
  crossOrigin?: "anonymous" | "use-credentials";
}

export function useIntelligentPreloading() {
  const pathname = usePathname();

  // Generic resource preloading
  const preloadResource = useCallback(
    (href: string, options: PreloadOptions = {}) => {
      // Check if already preloaded
      const existingLink = document.querySelector(`link[href="${href}"]`);
      if (existingLink) return;

      const link = document.createElement("link");
      link.rel = "preload";
      link.href = href;

      if (options.as) link.as = options.as;
      if (options.crossOrigin) link.crossOrigin = options.crossOrigin;

      // Set fetch priority if supported
      if ("fetchPriority" in link && options.priority) {
        (link as any).fetchPriority = options.priority;
      }

      document.head.appendChild(link);
    },
    [],
  );

  // Preload critical resources based on current route
  const preloadRouteResources = useCallback((route: string) => {
    const resources: Array<{ href: string; options?: PreloadOptions }> = [];

    // Route-specific preloading
    switch (route) {
      case "/":
        resources.push(
          { href: "/api/analytics", options: { as: "fetch", priority: "low" } },
          {
            href: "/api/school-info",
            options: { as: "fetch", priority: "high" },
          },
        );
        break;

      case "/admin":
        resources.push(
          {
            href: "/api/admin/dashboard",
            options: { as: "fetch", priority: "high" },
          },
          {
            href: "/api/admin/users",
            options: { as: "fetch", priority: "low" },
          },
        );
        break;

      case "/profesor":
        resources.push(
          {
            href: "/api/profesor/dashboard",
            options: { as: "fetch", priority: "high" },
          },
          {
            href: "/api/profesor/planning",
            options: { as: "fetch", priority: "low" },
          },
        );
        break;

      case "/parent":
        resources.push(
          {
            href: "/api/parent/dashboard",
            options: { as: "fetch", priority: "high" },
          },
          {
            href: "/api/parent/communications",
            options: { as: "fetch", priority: "low" },
          },
        );
        break;
    }

    // Preload resources
    resources.forEach(({ href, options }) => {
      preloadResource(href, options);
    });
  }, []);

  // Smart component preloading based on user behavior
  const preloadComponents = useCallback(() => {
    // Component preloading removed due to invalid preload link generation
    // Next.js handles component preloading automatically via dynamic imports
  }, []);

  // Image preloading for critical images
  const preloadImages = useCallback((imageUrls: string[]) => {
    imageUrls.forEach((url) => {
      preloadResource(url, {
        as: "image",
        priority: "low",
      });
    });
  }, []);

  // Font preloading
  const preloadFonts = useCallback((fontUrls: string[]) => {
    fontUrls.forEach((url) => {
      preloadResource(url, {
        as: "font",
        crossOrigin: "anonymous",
        priority: "high",
      });
    });
  }, []);

  // Predict next routes based on current location and user role
  const predictNextRoutes = useCallback(() => {
    const predictions: string[] = [];

    // Add common next routes based on current path
    if (pathname?.startsWith("/admin")) {
      predictions.push(
        "/admin/usuarios",
        "/admin/calendario-escolar",
        "/admin/reuniones",
      );
    } else if (pathname?.startsWith("/profesor")) {
      predictions.push(
        "/profesor/planificaciones",
        "/profesor/calendario-escolar",
        "/profesor/reuniones",
      );
    } else if (pathname?.startsWith("/parent")) {
      predictions.push(
        "/parent/comunicacion",
        "/parent/calendario-escolar",
        "/parent/reuniones",
      );
    }

    return predictions;
  }, [pathname]);

  // Preload predicted routes
  const preloadPredictedRoutes = useCallback(() => {
    const routes = predictNextRoutes();

    routes.forEach((route) => {
      // Use Next.js prefetch API for pages
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = route;
      link.as = "document";
      document.head.appendChild(link);

      // Clean up after timeout
      setTimeout(() => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      }, 60000); // 1 minute
    });
  }, [predictNextRoutes]);

  // Hover-based preloading for interactive elements
  const setupHoverPreloading = useCallback(() => {
    const handleMouseEnter = (e: Event) => {
      // Check if target is an HTMLElement before accessing element methods
      if (!(e.target instanceof HTMLElement)) return;

      const target = e.target;
      const href =
        target.getAttribute("href") || target.getAttribute("data-preload");

      if (href && (href.startsWith("/") || href.startsWith("http"))) {
        // Small delay to avoid unnecessary preloading on quick mouse movements
        const timeoutId = setTimeout(() => {
          if (href.startsWith("/")) {
            preloadResource(href, { as: "document", priority: "low" });
          }
        }, 100);

        // Store timeout on element for cleanup
        (target as any)._preloadTimeout = timeoutId;
      }
    };

    const handleMouseLeave = (e: Event) => {
      // Check if target is an HTMLElement before accessing element methods
      if (!(e.target instanceof HTMLElement)) return;

      const target = e.target;
      if ((target as any)._preloadTimeout) {
        clearTimeout((target as any)._preloadTimeout);
        delete (target as any)._preloadTimeout;
      }
    };

    // Add event listeners to navigation elements
    document.addEventListener("mouseenter", handleMouseEnter, true);
    document.addEventListener("mouseleave", handleMouseLeave, true);

    return () => {
      document.removeEventListener("mouseenter", handleMouseEnter, true);
      document.removeEventListener("mouseleave", handleMouseLeave, true);
    };
  }, []);

  // Initialize preloading on mount
  useEffect(() => {
    // Route-based preloading
    preloadRouteResources(pathname || "/");

    // Component preloading
    preloadComponents();

    // Predicted route preloading
    preloadPredictedRoutes();

    // Setup hover-based preloading
    const cleanup = setupHoverPreloading();

    // Preload critical images (add specific images as needed)
    // preloadImages(['/bg1.jpg', '/bg2.jpg']);

    return cleanup;
  }, [
    pathname,
    preloadRouteResources,
    preloadComponents,
    preloadPredictedRoutes,
    setupHoverPreloading,
  ]);

  // Return utility functions for manual preloading
  return {
    preloadResource,
    preloadImages,
    preloadFonts,
    preloadRouteResources,
    preloadPredictedRoutes,
  };
}
