"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useHydrationSafe } from "@/components/ui/hydration-error-boundary";

export function useAuthSync() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isHydrated = useHydrationSafe();
  const hasRedirected = useRef(false);

  // Simplified session synchronization - only after hydration
  useEffect(() => {
    if (!isHydrated) return;

    // Only sync on specific auth-related routes when component mounts
    if (pathname === "/auth-success" || pathname === "/login") {
      update().catch(console.error);
    }
  }, [pathname, update, isHydrated]);

  // Enhanced redirect logic with proper session validation and hydration check
  const handleAuthRedirect = useCallback(async () => {
    // Only redirect after hydration and prevent multiple redirects
    if (!isHydrated || hasRedirected.current) {
      return;
    }

    if (status === "authenticated" && session?.user) {
      const isAdminPath = pathname?.startsWith("/admin");
      const isProfesorPath = pathname?.startsWith("/profesor");
      const isParentPath = pathname?.startsWith("/parent");
      const isCpaPath = pathname?.startsWith("/cpma");
      const userRole = session.user.role;

      // Ensure session is fully loaded before redirecting
      if (!session.user.id) {
        await update();
        return;
      }

      let shouldRedirect = false;
      let redirectPath = "";

      // Redirect based on role
      switch (userRole) {
        case "ADMIN":
          // Admin can access all routes - no redirects needed
          break;
        case "PROFESOR":
          if (isAdminPath) {
            shouldRedirect = true;
            redirectPath = "/profesor";
          }
          break;
        case "PARENT":
          if (isAdminPath || isProfesorPath) {
            shouldRedirect = true;
            redirectPath = "/parent"; // Fix parent dashboard path
          }
          break;
        default:
          if (isAdminPath || isProfesorPath || isParentPath || isCpaPath) {
            shouldRedirect = true;
            redirectPath = "/";
          }
      }

      if (shouldRedirect) {
        hasRedirected.current = true;
        router.replace(redirectPath);
      }
    } else if (status === "unauthenticated") {
      const protectedPaths = [
        "/admin",
        "/profesor",
        "/parent",
        "/cpma/dashboard",
      ];
      const isProtectedPath = protectedPaths.some((path) =>
        pathname?.startsWith(path),
      );

      if (isProtectedPath) {
        hasRedirected.current = true;
        router.replace("/login");
      }
    }
  }, [status, session, pathname, router, update, isHydrated]);

  // Enhanced redirect logic with immediate execution - only after hydration
  useEffect(() => {
    if (isHydrated) {
      handleAuthRedirect();
    }
  }, [handleAuthRedirect, isHydrated]);

  // Reset redirect flag when pathname changes
  useEffect(() => {
    hasRedirected.current = false;
  }, [pathname]);

  // Storage event listener for cross-tab session sync - only after hydration
  useEffect(() => {
    if (!isHydrated) return;

    let timeoutId: NodeJS.Timeout;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "next-auth.session-token") {
        // Debounce updates to prevent excessive calls
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          update().catch(console.error);
        }, 1000);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearTimeout(timeoutId);
    };
  }, [update, isHydrated]);

  return {
    session,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    userRole: session?.user?.role,
    forceUpdate: update,
  };
}
