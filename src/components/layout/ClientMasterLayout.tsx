"use client";

import { useSession } from "@/lib/auth-client";
import { hasMasterGodModeAccess } from "@/lib/role-utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SkeletonLoader } from "@/components/ui/dashboard-loader";

interface ClientMasterLayoutProps {
  children: React.ReactNode;
}

export default function ClientMasterLayout({
  children,
}: ClientMasterLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

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
    return null;
  }

  if (!hasMasterGodModeAccess(session.user.role)) {
    return null;
  }

  return <>{children}</>;
}
