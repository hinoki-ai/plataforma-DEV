import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/server-auth";
import { hasMasterGodModeAccess } from "@/lib/role-utils";

export default async function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  // Ensure user has MASTER access
  if (!hasMasterGodModeAccess(session.data?.user.role)) {
    redirect("/unauthorized");
  }

  return <div className="min-h-screen">{children}</div>;
}
