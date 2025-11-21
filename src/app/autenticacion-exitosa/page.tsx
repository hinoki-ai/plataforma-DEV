import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { cookies } from "next/headers";

type UserRole = "MASTER" | "ADMIN" | "PROFESOR" | "PARENT" | "PUBLIC";

const ROLE_PATHS: Record<UserRole, string> = {
  MASTER: "/master",
  ADMIN: "/admin",
  PROFESOR: "/profesor",
  PARENT: "/parent",
  PUBLIC: "/",
};

export default async function AuthSuccessPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const cookieStore = await cookies();

  // DEV MODE: Handle development authentication parameters
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    const devRole = searchParams.dev_role as string;
    const devName = searchParams.dev_name as string;
    const devEmail = searchParams.dev_email as string;

    if (devRole && devName && devEmail) {
      // Create dev session cookies
      const devSession = {
        user: {
          id: `dev-${devEmail}`,
          clerkId: `dev-${devEmail}`,
          email: devEmail,
          name: devName,
          role: devRole as UserRole,
          needsRegistration: false,
          isOAuthUser: false,
          provider: "dev",
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };

      // Set dev session cookie
      cookieStore.set("dev-session", JSON.stringify(devSession), {
        httpOnly: true,
        secure: false, // localhost doesn't need secure
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/",
      });

      const targetPath = ROLE_PATHS[devRole as UserRole] || "/master";
      redirect(targetPath);
    }

    // Fallback for dev mode without parameters
    redirect("/master");
  }

  // PRODUCTION MODE: Get session server-side - no client dependency needed
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
