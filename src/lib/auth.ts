import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { getConvexClient } from "./convex";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { SessionData } from "@/lib/auth-client";
import type { ExtendedUserRole } from "@/lib/authorization";

interface ConvexUserRecord {
  _id: Id<"users">;
  email: string;
  name?: string;
  image?: string;
  role: ExtendedUserRole;
  isActive: boolean;
  isOAuthUser?: boolean;
  clerkId?: string;
  provider?: string;
}

async function resolveConvexUser(clerkUserId: string, email: string | null) {
  const client = getConvexClient();

  let user = await client.query(api.users.getUserByClerkId, {
    clerkId: clerkUserId,
  });

  if (!user && email) {
    const existing = await client.query(api.users.getUserByEmail, { email });
    if (existing) {
      user = existing;
      await client.mutation(api.users.linkClerkIdentity, {
        userId: existing._id,
        clerkId: clerkUserId,
      });
    }
  }

  if (!user) return null;
  if (!user.isActive) return null;

  const needsRegistration = await determineParentRegistrationStatus(
    client,
    user as ConvexUserRecord,
  );

  return {
    user,
    needsRegistration,
  };
}

async function determineParentRegistrationStatus(
  client: ReturnType<typeof getConvexClient>,
  user: ConvexUserRecord,
) {
  if (user.role !== "PARENT") return false;
  if (!user.isOAuthUser) return false;

  try {
    const profile = await client.query(api.users.getParentProfileByUserId, {
      userId: user._id,
    });
    return !profile?.registrationComplete;
  } catch (error) {
    console.warn("Failed to read parent profile", {
      userId: user._id,
      error,
    });
    return true;
  }
}

export async function auth(): Promise<SessionData | null> {
  const { userId, sessionId, sessionClaims } = await clerkAuth();

  if (!userId || !sessionId) {
    return null;
  }

  const user = await currentUser();
  const convexUser = await resolveConvexUser(
    userId,
    user?.emailAddresses?.[0]?.emailAddress ?? null,
  );

  if (!convexUser) {
    return null;
  }

  const expires = sessionClaims?.exp
    ? new Date(sessionClaims.exp * 1000).toISOString()
    : undefined;

  const session: SessionData = {
    user: {
      id: convexUser.user._id,
      clerkId: userId,
      email: convexUser.user.email,
      name: convexUser.user.name ?? user?.fullName ?? null,
      image: convexUser.user.image ?? user?.imageUrl ?? null,
      role: convexUser.user.role,
      needsRegistration: convexUser.needsRegistration,
      isOAuthUser: convexUser.user.isOAuthUser,
      provider: convexUser.user.provider,
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
