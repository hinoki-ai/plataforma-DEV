import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
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

  const expires = sessionClaims?.exp
    ? new Date(sessionClaims.exp * 1000).toISOString()
    : undefined;

  const session: SessionData = {
    user: {
      id: clerkUser.user.id,
      clerkId: userId,
      email: clerkUser.user.email,
      name: clerkUser.user.name ?? user?.fullName ?? null,
      image: clerkUser.user.image ?? user?.imageUrl ?? null,
      role: clerkUser.user.role,
      needsRegistration: clerkUser.needsRegistration,
      isOAuthUser: clerkUser.user.isOAuthUser,
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
