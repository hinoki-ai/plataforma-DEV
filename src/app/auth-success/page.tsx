"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/unified-loader";
import { useLanguage } from "@/components/language/LanguageContext";

type UserRole = "MASTER" | "ADMIN" | "PROFESOR" | "PARENT" | "PUBLIC";

const ROLE_PATHS: Record<UserRole, string> = {
  MASTER: "/master",
  ADMIN: "/admin",
  PROFESOR: "/profesor",
  PARENT: "/parent",
  PUBLIC: "/",
};

export default function AuthSuccessPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [redirected, setRedirected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { t } = useLanguage();

  const performRedirect = useCallback((path: string, reason: string) => {
    if (redirected) return;
    
    console.log(`AuthSuccess - Redirecting to ${path} (${reason})`);
    setRedirected(true);
    
    // Use router.replace for smoother client-side navigation
    router.replace(path);
  }, [redirected, router]);

  useEffect(() => {
    if (redirected) return;

    const checkAuthAndRedirect = async () => {
      console.log(
        "AuthSuccess - Status:",
        status,
        "Session:",
        session?.user ? "exists" : "null",
        "Role:",
        session?.user?.role,
        "Retry:",
        retryCount,
      );

      // Still loading - wait for session
      if (status === "loading") {
        return;
      }

      // Unauthenticated - redirect to login
      if (status === "unauthenticated") {
        performRedirect("/login", "unauthenticated");
        return;
      }

      // Authenticated but waiting for session data
      if (status === "authenticated") {
        // Validate session has required data
        if (!session?.user) {
          // Retry up to 3 times with delay if session user data is missing
          if (retryCount < 3) {
            console.log("AuthSuccess - Session user data missing, retrying...");
            setTimeout(() => setRetryCount(prev => prev + 1), 300);
            return;
          }
          
          // After retries, redirect to login
          console.error("AuthSuccess - Session user data missing after retries");
          performRedirect("/login", "session data missing");
          return;
        }

        // Validate role exists
        const role = session.user.role as UserRole;
        if (!role || !ROLE_PATHS[role]) {
          console.error("AuthSuccess - Invalid or missing role:", role);
          performRedirect("/login", "invalid role");
          return;
        }

        // Handle PARENT with registration requirement
        if (role === "PARENT" && session.user.needsRegistration) {
          performRedirect("/centro-consejo", "parent needs registration");
          return;
        }

        // Redirect to role-based dashboard
        const targetPath = ROLE_PATHS[role];
        performRedirect(targetPath, `role: ${role}`);
      }
    };

    checkAuthAndRedirect();
  }, [session, status, router, redirected, retryCount, performRedirect]);

  // Safety timeout to prevent infinite loading (10 seconds)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!redirected) {
        console.warn("AuthSuccess - Timeout reached, redirecting to home");
        performRedirect("/", "timeout");
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [redirected, performRedirect]);

  return <PageLoader text={t("common.loading", "common")} />;
}
