import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/server-auth";
import { getRoleAccess } from "@/lib/role-utils";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const roleAccess = getRoleAccess(session.user.role);

  // Ensure user has access to admin section
  if (!roleAccess.canAccessAdmin) {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
