"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { getRoleAccess } from "@/lib/role-utils";
import { DashboardLoader } from "@/components/ui/dashboard-loader";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useDivineParsing(["parent"]);
  const hasRedirectedRef = useRef(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === "loading") {
      if (!loadingTimeoutRef.current) {
        loadingTimeoutRef.current = setTimeout(() => {
          if (!hasRedirectedRef.current) {
            console.warn(
              "Session loading timeout, redirecting to login for safety",
            );
            hasRedirectedRef.current = true;
            router.replace("/login");
          }
        }, 10000);
      }
      return;
    }

    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    if (status === "unauthenticated" || !session) {
      if (!hasRedirectedRef.current) {
        if (process.env.NODE_ENV === "development") {
          console.warn("No active session found, redirecting to login");
        }
        hasRedirectedRef.current = true;
        router.replace("/login");
      }
      return;
    }

    if (!session?.user?.role) {
      if (!hasRedirectedRef.current) {
        console.warn("Session missing user role, redirecting to login");
        hasRedirectedRef.current = true;
        router.replace("/login");
      }
      return;
    }

    const roleAccess = getRoleAccess(session.user.role);

    // MASTER has access to all sections
    if (!roleAccess.canAccessParent && session.user.role !== "MASTER") {
      if (!hasRedirectedRef.current) {
        console.warn(
          `Access denied to parent section for role: ${session.user.role}`,
        );
        hasRedirectedRef.current = true;
        router.replace("/unauthorized");
      }
      return;
    }

    hasRedirectedRef.current = false;
  }, [session, status, router]);

  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, []);

  if (status === "loading") {
    return <DashboardLoader text={t("parent.layout.checking_access")} />;
  }

  if (status === "unauthenticated" || !session) {
    return <DashboardLoader text={t("parent.layout.redirecting")} />;
  }

  return <>{children}</>;
}
