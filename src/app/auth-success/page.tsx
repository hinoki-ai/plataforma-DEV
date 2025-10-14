"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
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
  const redirectedRef = useRef(false);
  const retryCountRef = useRef(0);
  const { t } = useLanguage();

  const performRedirect = (path: string, reason: string) => {
    if (redirectedRef.current) {
      console.log("⏭️ Redirect already in progress, skipping");
      return;
    }
    
    console.log(`🚀 AuthSuccess - Redirecting to ${path} (${reason})`);
    redirectedRef.current = true;
    
    // Force immediate navigation with full page reload
    // This ensures session cookie is properly sent to server for SSR auth checks
    window.location.href = path;
  };

  useEffect(() => {
    if (redirectedRef.current) return;

    console.log(
      "🔍 AuthSuccess Check:",
      { status, hasSession: !!session?.user, role: session?.user?.role, retry: retryCountRef.current }
    );

    // Still loading - wait for session
    if (status === "loading") {
      console.log("⏳ Session still loading...");
      return;
    }

    // Unauthenticated - redirect to login
    if (status === "unauthenticated") {
      console.warn("❌ Not authenticated, redirecting to login");
      performRedirect("/login", "unauthenticated");
      return;
    }

    // Authenticated but waiting for session data
    if (status === "authenticated") {
      // Validate session has required data
      if (!session?.user) {
        // Retry up to 5 times with exponential backoff for production
        if (retryCountRef.current < 5) {
          const delay = 200 * Math.pow(1.5, retryCountRef.current); // 200ms, 300ms, 450ms, 675ms, 1012ms
          console.log(`⏳ Session user data missing, retry ${retryCountRef.current + 1}/5 in ${Math.round(delay)}ms`);
          retryCountRef.current++;
          // Don't need to trigger re-render, just wait and let next useEffect cycle handle it
          return;
        }
        
        // After retries, redirect to login
        console.error("❌ Session user data missing after 5 retries");
        performRedirect("/login", "session data missing after retries");
        return;
      }

      // Validate role exists and is valid
      const role = session.user.role as UserRole;
      if (!role || !ROLE_PATHS[role]) {
        console.error("❌ Invalid or missing role:", role);
        performRedirect("/login", "invalid role");
        return;
      }

      // Additional validation: ensure session has all required fields
      if (!session.user.email || !session.user.id) {
        console.error("❌ Session missing required fields", { email: !!session.user.email, id: !!session.user.id });
        performRedirect("/login", "incomplete session data");
        return;
      }

      // Handle PARENT with registration requirement
      if (role === "PARENT" && session.user.needsRegistration) {
        console.log("📝 Parent needs registration");
        performRedirect("/centro-consejo", "parent needs registration");
        return;
      }

      // All validations passed - redirect to role-based dashboard
      const targetPath = ROLE_PATHS[role];
      console.log(`✅ Session valid, redirecting to ${targetPath}`);
      performRedirect(targetPath, `role: ${role}`);
    }
  }, [session, status]);

  // Safety timeout to prevent infinite loading (15 seconds for production)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!redirectedRef.current) {
        console.error("⏰ AuthSuccess timeout reached after 15s");
        // On timeout, try to redirect to login for safety
        performRedirect("/login", "timeout - please try again");
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, []);

  return <PageLoader text={t("common.loading", "common")} />;
}
