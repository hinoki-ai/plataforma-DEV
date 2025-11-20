import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

type UserRole = "MASTER" | "ADMIN" | "PROFESOR" | "PARENT" | "PUBLIC";

const ROLE_PATHS: Record<UserRole, string> = {
  MASTER: "/master",
  ADMIN: "/admin",
  PROFESOR: "/profesor",
  PARENT: "/parent",
  PUBLIC: "/",
};

export default async function AuthSuccessPage() {
  // Get session server-side - no client dependency needed
  const session = await auth();

  // Enhanced logging for debugging redirect loops

  // Not authenticated - redirect to login
  if (!session?.user) {
    redirect("/login");
  }

  // Validate session has required data
  if (!session?.user.role || !session?.user.email || !session?.user.id) {
    redirect("/login");
  }

  const role = session.user.role as UserRole;

  // Validate role exists
  if (!ROLE_PATHS[role]) {
    redirect("/login");
  }

  // Handle PARENT with registration requirement
  if (role === "PARENT" && session.user.needsRegistration) {
    redirect("/cpma");
  }

  // Success - redirect to role-based dashboard
  const targetPath = ROLE_PATHS[role];

  redirect(targetPath);
}
