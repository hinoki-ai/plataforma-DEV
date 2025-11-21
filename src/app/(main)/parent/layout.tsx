"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // DEV MODE: Allow access to parent pages on localhost
    const isDev =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    if (isDev) {
      hasRedirectedRef.current = false;
      return;
    }

    if (status === "loading") {
      if (!loadingTimeoutRef.current) {
        loadingTimeoutRef.current = setTimeout(() => {
          if (!hasRedirectedRef.current) {
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
      // DEV MODE: Don't redirect on localhost
      const isDev =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");

      if (!isDev) {
        if (!hasRedirectedRef.current) {
          if (process.env.NODE_ENV === "development") {
          }
          hasRedirectedRef.current = true;
          router.replace("/login");
        }
        return;
      }
    }

    if (!session?.user?.role) {
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        router.replace("/login");
      }
      return;
    }

    const roleAccess = getRoleAccess(session.user.role);

    // MASTER has access to all sections
    if (!roleAccess.canAccessParent && session.user.role !== "MASTER") {
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        router.replace("/no-autorizado");
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

  // Show loading while hydrating to prevent hydration mismatches
  if (!isHydrated) {
    return <DashboardLoader text={t("parent.layout.checking_access")} />;
  }

  if (status === "loading") {
    return <DashboardLoader text={t("parent.layout.checking_access")} />;
  }

  if (status === "unauthenticated" || !session) {
    return <DashboardLoader text={t("parent.layout.redirecting")} />;
  }

  return <>{children}</>;
}
