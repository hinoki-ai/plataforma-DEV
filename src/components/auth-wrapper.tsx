"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ActionLoader } from "@/components/ui/dashboard-loader";
import { useLanguage } from "@/components/language/LanguageContext";

interface AuthWrapperProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function AuthWrapper({
  children,
  allowedRoles,
  redirectTo = "/login",
}: AuthWrapperProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace(redirectTo);
      return;
    }

    if (status === "authenticated" && allowedRoles?.length) {
      const userRole = session.user?.role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard based on role
        switch (userRole) {
          case "ADMIN":
            router.replace("/admin");
            break;
          case "PROFESOR":
            router.replace("/profesor");
            break;
          case "PARENT":
            router.replace("/parent");
            break;
          default:
            router.replace("/");
        }
      }
    }
  }, [session, status, allowedRoles, redirectTo, router]);

  if (status === "loading") {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        role="status"
        aria-live="polite"
        aria-label={t("auth.verifying", "common")}
      >
        <div className="text-center">
          <ActionLoader size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">
            {t("auth.verifying", "common")}
          </p>
          <span className="sr-only">{t("auth.verifying", "common")}</span>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will redirect via useEffect
  }

  if (status === "authenticated" && allowedRoles?.length) {
    const userRole = session.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return null; // Will redirect via useEffect
    }
  }

  return <>{children}</>;
}
