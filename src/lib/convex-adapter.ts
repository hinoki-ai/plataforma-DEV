/**
 * Convex Adapter for NextAuth.js (Auth.js v5)
 *
 * This adapter integrates Convex as the database backend for NextAuth authentication.
 * It implements the NextAuth Adapter interface using Convex queries and mutations.
 */

import type {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
} from "next-auth/adapters";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

export function ConvexAdapter(client: ConvexHttpClient): Adapter {
  return {
    async createUser(user) {
      const userId = await client.mutation(api.authAdapter.createUser, {
        email: user.email,
        name: user.name ?? undefined,
        image: user.image ?? undefined,
        emailVerified: user.emailVerified
          ? user.emailVerified.getTime()
          : undefined,
      });

      return {
        id: userId,
        email: user.email,
        name: user.name ?? undefined,
        image: user.image ?? undefined,
        emailVerified: user.emailVerified,
        role: "PUBLIC",
        isActive: true,
      } as AdapterUser;
    },

    async getUser(id) {
      const user = await client.query(api.authAdapter.getUserById, { id });
      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        image: user.image ?? undefined,
        emailVerified: user.emailVerified,
        role: user.role || "PUBLIC",
        isActive: user.isActive ?? true,
      } as AdapterUser;
    },

    async getUserByEmail(email) {
      const user = await client.query(api.authAdapter.getUserByEmail, {
        email,
      });
      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        image: user.image ?? undefined,
        emailVerified: user.emailVerified,
        role: user.role || "PUBLIC",
        isActive: user.isActive ?? true,
      } as AdapterUser;
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const account = await client.query(api.authAdapter.getAccountByProvider, {
        provider,
        providerAccountId,
      });

      if (!account) return null;

      const user = await client.query(api.authAdapter.getUserById, {
        id: account.userId,
      });
      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        image: user.image ?? undefined,
        emailVerified: user.emailVerified,
        role: user.role || "PUBLIC",
        isActive: user.isActive ?? true,
      } as AdapterUser;
    },

    async updateUser(user) {
      const userId = await client.mutation(api.authAdapter.updateUser, {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        image: user.image ?? undefined,
        emailVerified: user.emailVerified
          ? user.emailVerified.getTime()
          : undefined,
      });

      // Get updated user to return full data including role
      const updatedUser = await client.query(api.authAdapter.getUserById, {
        id: userId,
      });

      return {
        id: userId,
        email: user.email || updatedUser?.email,
        name: user.name ?? undefined,
        image: user.image ?? undefined,
        emailVerified: user.emailVerified,
        role: updatedUser?.role || "PUBLIC",
        isActive: true,
      } as AdapterUser;
    },

    async deleteUser(userId) {
      await client.mutation(api.authAdapter.deleteUser, { id: userId });
    },

    async linkAccount(account) {
      await client.mutation(api.authAdapter.linkAccount, {
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token ?? undefined,
        access_token: account.access_token ?? undefined,
        expires_at: account.expires_at ?? undefined,
        token_type: account.token_type ?? undefined,
        scope: account.scope ?? undefined,
        id_token: account.id_token ?? undefined,
        session_state:
          typeof account.session_state === "string"
            ? account.session_state
            : undefined,
      });
    },

    async unlinkAccount({ provider, providerAccountId }) {
      await client.mutation(api.authAdapter.deleteAccount, {
        provider,
        providerAccountId,
      });
    },

    async createSession({ sessionToken, userId, expires }) {
      const sessionId = await client.mutation(api.authAdapter.createSession, {
        sessionToken,
        userId,
        expires: expires.getTime(),
      });

      return {
        sessionToken,
        userId,
        expires,
      } as AdapterSession;
    },

    async getSessionAndUser(sessionToken) {
      const result = await client.query(api.authAdapter.getSessionAndUser, {
        sessionToken,
      });
      if (!result) return null;

      return {
        session: {
          sessionToken: result.session.sessionToken,
          userId: result.session.userId,
          expires: result.session.expires,
        },
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          image: result.user.image,
          emailVerified: result.user.emailVerified,
          role: result.user.role,
          isActive: result.user.isActive,
        },
      };
    },

    async updateSession({ sessionToken, expires }) {
      await client.mutation(api.authAdapter.updateSession, {
        sessionToken,
        expires: expires ? expires.getTime() : undefined,
      });

      const result = await client.query(api.authAdapter.getSessionAndUser, {
        sessionToken,
      });
      if (!result) return null;

      return {
        sessionToken: result.session.sessionToken,
        userId: result.session.userId,
        expires: result.session.expires,
      } as AdapterSession;
    },

    async deleteSession(sessionToken) {
      await client.mutation(api.authAdapter.deleteSession, { sessionToken });
    },

    async createVerificationToken({ identifier, expires, token }) {
      await client.mutation(api.authAdapter.createVerificationToken, {
        identifier,
        token,
        expires: expires.getTime(),
      });

      return {
        identifier,
        token,
        expires,
      };
    },

    async useVerificationToken({ identifier, token }) {
      const verificationToken = await client.query(
        api.authAdapter.useVerificationToken,
        {
          identifier,
          token,
        },
      );

      if (!verificationToken) return null;

      // Delete the token after use
      await client.mutation(api.authAdapter.deleteVerificationToken, {
        identifier,
        token,
      });

      return {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: verificationToken.expires,
      };
    },
  };
}
