import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import type { SessionData } from "@/lib/auth-client";
import type { ExtendedUserRole } from "@/lib/authorization";
import { getClerkUserById } from "@/services/actions/clerk-users";

async function resolveClerkUser(clerkUserId: string) {
  const user = await getClerkUserById(clerkUserId);

  if (!user) return null;
  if (!user.isActive) return null;

  const needsRegistration = await determineParentRegistrationStatus(user);

  return {
    user,
    needsRegistration,
  };
}

async function determineParentRegistrationStatus(user: any) {
  if (user.role !== "PARENT") return false;
  if (!user.isOAuthUser) return false;

  // For Clerk-based users, we assume registration is complete
  // This can be enhanced later with additional metadata
  return false;
}

export async function auth(): Promise<SessionData | null> {
  const { userId, sessionId, sessionClaims } = await clerkAuth();

  if (!userId || !sessionId) {
    return null;
  }

  const clerkUser = await resolveClerkUser(userId);

  if (!clerkUser) {
    return null;
  }

  const user = await currentUser();

  let convexUser: any | null = null;
  try {
    const convex = getConvexClient();
    convexUser = await convex.query(api.users.getUserByClerkId, {
      clerkId: userId,
    });
  } catch (error) {
    console.error("Failed to resolve Convex user for session", {
      clerkId: userId,
      error,
    });
  }

  const expires = sessionClaims?.exp
    ? new Date(sessionClaims.exp * 1000).toISOString()
    : undefined;

  const session: SessionData = {
    user: {
      id: convexUser?._id ?? clerkUser.user.id,
      clerkId: userId,
      email: convexUser?.email ?? clerkUser.user.email,
      name: convexUser?.name ?? clerkUser.user.name ?? user?.fullName ?? null,
      image:
        convexUser?.image ?? clerkUser.user.image ?? user?.imageUrl ?? null,
      role:
        (convexUser?.role as ExtendedUserRole | undefined) ??
        clerkUser.user.role,
      needsRegistration: clerkUser.needsRegistration,
      isOAuthUser:
        convexUser?.isOAuthUser ?? clerkUser.user.isOAuthUser ?? false,
      provider: clerkUser.user.provider,
    },
    expires,
  };

  return session;
}

export async function signOut(): Promise<void> {
  throw new Error("Server-side signOut is not supported in Clerk migration");
}

export async function signIn(): Promise<void> {
  throw new Error("Server-side signIn is not supported in Clerk migration");
}

export type { SessionData as Session };
