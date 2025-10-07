"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getRoleAccess } from "@/lib/role-utils";
import { DashboardLoader } from "@/components/ui/dashboard-loader";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated" || !session) {
      // Only redirect once to prevent infinite loops
      if (!hasRedirected) {
        // Only log error in development or if this is the first attempt
        if (process.env.NODE_ENV === "development" || !isChecking) {
          console.warn("No active session found, redirecting to login");
        }
        setHasRedirected(true);
        router.push("/login");
      }
      return;
    }

    // Reset redirect flag if we have a valid session
    if (hasRedirected) {
      setHasRedirected(false);
    }

    if (!session.user?.role) {
      if (!hasRedirected) {
        console.warn("Session missing user role, redirecting to login");
        setHasRedirected(true);
        router.push("/login");
      }
      return;
    }

    const roleAccess = getRoleAccess(session.user.role);

    if (!roleAccess.canAccessParent) {
      if (!hasRedirected) {
        console.warn(
          `Access denied to parent section for role: ${session.user.role}`,
        );
        setHasRedirected(true);
        router.push("/unauthorized");
      }
      return;
    }

    setIsChecking(false);
  }, [session, status, router, isChecking, hasRedirected]);

  // Set up a timeout to prevent indefinite loading
  useEffect(() => {
    if (status === "loading" && !loadingTimeout) {
      const timeout = setTimeout(() => {
        console.warn("Session loading timeout, checking authentication status");
        setIsChecking(false);
      }, 10000); // 10 second timeout
      setLoadingTimeout(timeout);
    }

    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        setLoadingTimeout(null);
      }
    };
  }, [status, loadingTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [loadingTimeout]);

  if (status === "loading" || isChecking) {
    return <DashboardLoader text="Verificando acceso..." />;
  }

  if (status === "unauthenticated" || !session) {
    return <DashboardLoader text="Redirigiendo..." />;
  }

  return <>{children}</>;
}
