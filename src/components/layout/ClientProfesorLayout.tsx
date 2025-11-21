"use client";

import { useSession } from "@/lib/auth-client";
import { getRoleAccess } from "@/lib/role-utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SkeletonLoader } from "@/components/ui/dashboard-loader";

interface ClientProfesorLayoutProps {
  children: React.ReactNode;
}

export default function ClientProfesorLayout({
  children,
}: ClientProfesorLayoutProps) {
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
      if (!session.user.role) {
        router.push("/no-autorizado");
        return;
      }

      const roleAccess = getRoleAccess(session.user.role);

      if (!roleAccess.canAccessProfesor) {
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

  if (!session.user.role) {
    return (
      <div className="p-8">
        <SkeletonLoader variant="list" lines={6} />
      </div>
    );
  }

  const roleAccess = getRoleAccess(session.user.role);
  if (!roleAccess.canAccessProfesor) {
    return (
      <div className="p-8">
        <SkeletonLoader variant="list" lines={6} />
      </div>
    );
  }

  return <>{children}</>;
}
