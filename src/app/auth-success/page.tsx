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

  // Log server-side for debugging
  console.log("🔐 AuthSuccess Server Check:", {
    hasSession: !!session?.user,
    role: session?.user?.role,
    email: session?.user?.email,
    userId: session?.user?.id,
    needsRegistration: session?.user?.needsRegistration,
    isOAuthUser: session?.user?.isOAuthUser,
  });

  // Not authenticated - redirect to login
  if (!session?.user) {
    console.warn("❌ No session found, redirecting to login");
    redirect("/login");
  }

  // Validate session has required data
  if (!session.user.role || !session.user.email || !session.user.id) {
    console.error("❌ Session missing required fields, redirecting to login");
    redirect("/login");
  }

  const role = session.user.role as UserRole;

  // Validate role exists
  if (!ROLE_PATHS[role]) {
    console.error("❌ Invalid role:", role);
    redirect("/login");
  }

  // Handle PARENT with registration requirement
  if (role === "PARENT" && session.user.needsRegistration) {
    console.log("📝 Parent needs registration, redirecting to centro-consejo");
    redirect("/centro-consejo");
  }

  // Success - redirect to role-based dashboard
  const targetPath = ROLE_PATHS[role];
  console.log(`✅ Redirecting authenticated ${role} to ${targetPath}`);
  redirect(targetPath);
}
