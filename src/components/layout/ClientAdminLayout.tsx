"use client";

import { useSession } from "@/lib/auth-client";
import { getRoleAccess } from "@/lib/role-utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SkeletonLoader } from "@/components/ui/dashboard-loader";

interface ClientAdminLayoutProps {
  children: React.ReactNode;
}

export default function ClientAdminLayout({
  children,
}: ClientAdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      const roleAccess = getRoleAccess(session.user.role);
      if (!roleAccess.canAccessAdmin) {
        router.push("/unauthorized");
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

  const roleAccess = getRoleAccess(session.user.role);
  if (!roleAccess.canAccessAdmin) {
    return null;
  }

  return <>{children}</>;
}
