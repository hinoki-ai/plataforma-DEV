"use client";

import { useSession } from "@/lib/auth-client";
import { hasMasterGodModeAccess } from "@/lib/role-utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SkeletonLoader } from "@/components/ui/dashboard-loader";

interface ClientMasterLayoutProps {
  children: React.ReactNode;
}

export default function ClientMasterLayout({
  children,
}: ClientMasterLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // DEV MODE: Skip all authentication checks for localhost development
    const isDev =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    if (isDev) {
      // In dev mode, allow access to master dashboard without authentication
      return;
    }

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      if (!hasMasterGodModeAccess(session.user.role)) {
        router.push("/no-autorizado");
        return;
      }
    }
  }, [status, session, router]);

  // Show loading while hydrating to prevent hydration mismatches
  if (!isHydrated) {
    return (
      <div className="p-8">
        <SkeletonLoader variant="list" lines={6} />
      </div>
    );
  }

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="p-8">
        <SkeletonLoader variant="list" lines={6} />
      </div>
    );
  }

  // DEV MODE: Allow rendering in dev mode
  const isDev =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  if (!isDev) {
    // Don't render children if not authenticated or not authorized in production
    if (status === "unauthenticated" || !session?.user) {
      return (
        <div className="p-8">
          <SkeletonLoader variant="list" lines={6} />
        </div>
      );
    }

    if (!hasMasterGodModeAccess(session.user.role)) {
      return (
        <div className="p-8">
          <SkeletonLoader variant="list" lines={6} />
        </div>
      );
    }
  }

  return <>{children}</>;
}
