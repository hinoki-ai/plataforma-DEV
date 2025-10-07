import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/server-auth";
import { getRoleAccess } from "@/lib/role-utils";

export default async function ProfesorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  // Debug logging for troubleshooting
  console.log(
    "ProfesorLayout - User:",
    session.user?.email,
    "Role:",
    session.user?.role,
  );

  // Ensure user has a valid role
  if (!session.user?.role) {
    console.error(
      "ProfesorLayout - No user role found, redirecting to unauthorized",
    );
    redirect("/unauthorized");
  }

  const roleAccess = getRoleAccess(session.user.role);

  // Ensure user has access to profesor section
  if (!roleAccess.canAccessProfesor) {
    console.log(
      "ProfesorLayout - User does not have profesor access, role:",
      session.user.role,
    );
    redirect("/unauthorized");
  }

  console.log("ProfesorLayout - Access granted for role:", session.user.role);
  return <>{children}</>;
}
