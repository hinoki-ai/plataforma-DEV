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
  console.log("🔐 [AUTH-SUCCESS] Session Check:", {
    timestamp: new Date().toISOString(),
    hasSession: !!session?.user,
    role: session?.user?.role,
    email: session?.user?.email,
    userId: session?.user?.id,
    needsRegistration: session?.user?.needsRegistration,
    isOAuthUser: session?.user?.isOAuthUser,
  });

  // Not authenticated - redirect to login
  if (!session?.user) {
    console.warn("❌ [AUTH-SUCCESS] No session found, redirecting to login", {
      timestamp: new Date().toISOString(),
    });
    redirect("/login");
  }

  // Validate session has required data
  if (!session?.user.role || !session?.user.email || !session?.user.id) {
    console.error(
      "❌ [AUTH-SUCCESS] Session missing required fields, redirecting to login",
      {
        hasRole: !!session?.user.role,
        hasEmail: !!session?.user.email,
        hasId: !!session?.user.id,
        timestamp: new Date().toISOString(),
      },
    );
    redirect("/login");
  }

  const role = session.data?.user.role as UserRole;

  // Validate role exists
  if (!ROLE_PATHS[role]) {
    console.error("❌ [AUTH-SUCCESS] Invalid role:", {
      role,
      timestamp: new Date().toISOString(),
    });
    redirect("/login");
  }

  // Handle PARENT with registration requirement
  if (role === "PARENT" && session.data?.user.needsRegistration) {
    console.log(
      "📝 [AUTH-SUCCESS] Parent needs registration, redirecting to cpma",
      {
        timestamp: new Date().toISOString(),
      },
    );
    redirect("/cpma");
  }

  // Success - redirect to role-based dashboard
  const targetPath = ROLE_PATHS[role];
  console.log(
    `✅ [AUTH-SUCCESS] Redirecting authenticated ${role} to ${targetPath}`,
    {
      timestamp: new Date().toISOString(),
    },
  );
  redirect(targetPath);
}
