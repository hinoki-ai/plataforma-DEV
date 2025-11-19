"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { ExtendedUserRole } from "@/lib/authorization";

const VALID_ROLES: ExtendedUserRole[] = [
  "MASTER",
  "ADMIN",
  "PROFESOR",
  "PARENT",
  "PUBLIC",
];

function normalizeRole(role?: string | null): ExtendedUserRole {
  if (!role) {
    return "PUBLIC";
  }

  const normalized = role.toString().toUpperCase() as ExtendedUserRole;
  return VALID_ROLES.includes(normalized) ? normalized : "PUBLIC";
}

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export interface SessionUser {
  id: string;
  clerkId: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: ExtendedUserRole;
  needsRegistration?: boolean;
  isOAuthUser?: boolean;
  provider?: string;
}

export interface SessionData {
  user: SessionUser;
  expires?: string;
}

interface SessionContextValue {
  data: SessionData | null;
  status: SessionStatus;
  update: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

export function AppSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [version, setVersion] = useState(0);

  const sessionQuery = useQuery(api.users.currentSession, { version });

  const fallbackSession = useMemo<SessionData | null>(() => {
    if (!isSignedIn || !user) {
      return null;
    }

    const emailAddress =
      (user.primaryEmailAddress?.emailAddress as string | undefined) ??
      (user.emailAddresses?.[0]?.emailAddress as string | undefined) ??
      "";

    const nameFromParts = [user.firstName, user.lastName]
      .filter((part): part is string => Boolean(part))
      .join(" ");

    const fallbackName =
      user.fullName ??
      (nameFromParts.length > 0 ? nameFromParts : undefined) ??
      user.username ??
      null;

    const roleMetadata = user.publicMetadata?.role as string | undefined;

    const needsRegistration = Boolean(
      (user.publicMetadata?.needsRegistration as boolean | undefined) ?? false,
    );

    const hasExternalAccounts = Array.isArray(user.externalAccounts)
      ? user.externalAccounts.length > 0
      : false;

    const providerFromAccount = hasExternalAccounts
      ? ((user.externalAccounts?.[0]?.provider as string | undefined) ??
        "oauth")
      : "clerk";

    const derivedId =
      (user.publicMetadata?.appUserId as string | undefined) ?? user.id;

    return {
      user: {
        id: derivedId,
        clerkId: user.id,
        email: emailAddress,
        name: fallbackName,
        image: user.imageUrl ?? null,
        role: normalizeRole(roleMetadata),
        needsRegistration,
        isOAuthUser: hasExternalAccounts,
        provider: providerFromAccount,
      },
      expires: undefined,
    };
  }, [isSignedIn, user]);

  const status: SessionStatus = useMemo(() => {
    if (!isLoaded) return "loading";
    if (!isSignedIn) return "unauthenticated";
    if (sessionQuery === undefined && !fallbackSession) return "loading";
    if (sessionQuery) return "authenticated";
    if (fallbackSession) return "authenticated";
    return "unauthenticated";
  }, [isLoaded, isSignedIn, sessionQuery, fallbackSession]);

  const sessionData: SessionData | null = useMemo(() => {
    if (sessionQuery) {
      return {
        user: {
          id: sessionQuery.user.id,
          clerkId: sessionQuery.user.clerkId,
          email: sessionQuery.user.email,
          name: sessionQuery.user.name ?? user?.fullName ?? null,
          image: sessionQuery.user.image ?? user?.imageUrl ?? null,
          role: sessionQuery.user.role,
          needsRegistration: sessionQuery.user.needsRegistration,
          isOAuthUser: sessionQuery.user.isOAuthUser,
        },
        expires: sessionQuery.expires,
      };
    }

    return fallbackSession;
  }, [sessionQuery, fallbackSession, user?.fullName, user?.imageUrl]);

  const update = useCallback(async () => {
    setVersion((current) => current + 1);
  }, []);

  const value = useMemo(
    () => ({ data: sessionData, status, update }),
    [sessionData, status, update],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <AppSessionProvider>{children}</AppSessionProvider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within an AppSessionProvider");
  }
  return context;
}

export function signIn(options?: { callbackUrl?: string }) {
  if (typeof window === "undefined") return Promise.resolve();
  const target = new URL("/login", window.location.origin);
  if (options?.callbackUrl) {
    target.searchParams.set("callbackUrl", options.callbackUrl);
  }
  window.location.assign(target.toString());
  return Promise.resolve();
}

export const signOut = ({ callbackUrl }: { callbackUrl?: string } = {}) => {
  if (typeof window === "undefined") return Promise.resolve();
  const redirectUrl = callbackUrl ?? window.location.origin;
  if (window.Clerk) {
    return window.Clerk.signOut({ redirectUrl });
  }
  return Promise.resolve();
};

export type Session = SessionData;

declare global {
  interface Window {
    Clerk?: {
      signOut: (options?: { redirectUrl?: string }) => Promise<void>;
    };
  }
}
