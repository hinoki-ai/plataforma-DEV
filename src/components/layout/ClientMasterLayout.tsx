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

  // Don't render children if not authenticated or not authorized
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

  return <>{children}</>;
}
