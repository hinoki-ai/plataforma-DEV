import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authenticateUser, findUserByEmail } from "./auth-convex";
import { ConvexAdapter } from "./convex-adapter";
import { getConvexClient } from "./convex";
import { Logger } from "./logger";

const logger = Logger.getInstance("Authentication");

type UserRole = "MASTER" | "ADMIN" | "PROFESOR" | "PARENT" | "PUBLIC";

// Validate environment variables
const validateOAuthConfig = () => {
  const config = {
    google: {
      enabled:
        !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  };

  // OAuth configuration validation (development context)

  return config;
};

const oauthConfig = validateOAuthConfig();

// Initialize Convex adapter only if URL is configured
const convexClient = process.env.NEXT_PUBLIC_CONVEX_URL
  ? getConvexClient()
  : null;

export const authOptions: NextAuthConfig = {
  adapter: convexClient ? ConvexAdapter(convexClient) : undefined,
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update session every hour to prevent expiration
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  logger: {
    error(error: Error) {
      logger.error("NextAuth Error", {
        error: error.message,
        stack: error.stack,
      });
    },
    warn(code: string) {
      logger.warn("NextAuth Warning", { code });
    },
    debug(code: string, metadata?: unknown) {
      // Only log debug info in development
      if (process.env.NODE_ENV === "development") {
        logger.debug("NextAuth Debug", { code, metadata });
      }
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        logger.info("Authentication attempt", { email: credentials.email });

        // Use Prisma authentication in Node.js runtime
        try {
          const user = await authenticateUser(
            credentials.email as string,
            credentials.password as string,
          );

          if (!user) {
            logger.warn("Authentication failed", { email: credentials.email });
            return null;
          }

          logger.info("Authentication successful", {
            email: credentials.email,
            role: user.role,
          });
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          logger.error("Authentication error", {
            email: credentials.email,
            error,
          });
          return null;
        }
      },
    }),
    ...(oauthConfig.google.enabled
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allow relative URLs and URLs from the same domain
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async signIn({ user, account, profile, email, credentials }: any) {
      try {
        if (process.env.NODE_ENV === "development") {
          console.log("🔐 Sign in callback triggered:", {
            provider: account?.provider,
            email: user?.email,
          });
        }

        // For OAuth providers (Google only now), handle parent authentication
        if (account?.provider === "google") {
          // Check if user exists in the User table
          const existingUser = await findUserByEmail(user.email!);

          if (existingUser) {
            // If user exists as teacher/admin (non-PARENT role), prevent OAuth login
            // Teachers and admins must use credentials login only
            if (existingUser.role !== "PARENT") {
              if (process.env.NODE_ENV === "development") {
                console.log(
                  "❌ OAuth blocked for non-parent user:",
                  existingUser.role,
                );
              }
              return false;
            }

            // If existing PARENT user, allow login
            user.role = existingUser.role;
            user.id = existingUser.id;
            user.needsRegistration = false;
          } else {
            // New OAuth user - they will need to complete parent registration
            user.role = "PARENT";
            user.needsRegistration = true;
          }
        }

        // For credentials login, user object is already populated by the authorize function
        if (process.env.NODE_ENV === "development") {
          console.log(
            "✅ Sign in successful for user:",
            user?.email,
            "role:",
            user?.role,
          );
        }
        return true;
      } catch (error) {
        console.error("❌ Sign in callback error:", error);
        return false;
      }
    },

    async jwt({ token, user, account }: any) {
      // Persist user data to token on sign in
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.needsRegistration = user.needsRegistration;
        token.isOAuthUser = user.isOAuthUser;
        if (process.env.NODE_ENV === "development") {
          console.log(
            "🔑 JWT Callback - User role:",
            user.role,
            "Token role:",
            token.role,
            "User ID:",
            user.id,
          );
        }
      }
      
      // Ensure token always has these properties - critical for production
      if (!token.role && token.email) {
        console.log("⚠️ Token missing role, fetching from database...");
        // Try to fetch user data from Convex if missing
        try {
          const userFromDb = await findUserByEmail(token.email as string);
          if (userFromDb) {
            token.role = userFromDb.role;
            token.id = userFromDb.id;
            token.name = userFromDb.name;
            console.log("✅ Restored token data from database:", {
              role: userFromDb.role,
              id: userFromDb.id,
            });
          } else {
            console.error("❌ User not found in database for email:", token.email);
          }
        } catch (error) {
          console.error("❌ Failed to fetch user in JWT callback:", error);
        }
      }
      
      // Validate token has minimum required data before returning
      if (!token.role || !token.email || !token.id) {
        console.error("❌ Invalid token state:", {
          hasRole: !!token.role,
          hasEmail: !!token.email,
          hasId: !!token.id,
        });
      }
      
      return token;
    },

    async session({ session, token }: any) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.needsRegistration = token.needsRegistration;
        session.user.isOAuthUser = token.isOAuthUser;
        
        // Ensure email is set (required field)
        if (!session.user.email && token.email) {
          session.user.email = token.email as string;
        }
        
        if (process.env.NODE_ENV === "development") {
          console.log(
            "📋 Session Callback - Token role:",
            token.role,
            "Session role:",
            session.user.role,
          );
        }
        
        // Validate session has all required data before returning
        if (!session.user.id || !session.user.role || !session.user.email) {
          console.error("❌ Session missing required fields:", {
            hasId: !!session.user.id,
            hasRole: !!session.user.role,
            hasEmail: !!session.user.email,
          });
        }
      } else {
        console.error("❌ Session callback called without token");
      }
      return session;
    },
  },
  events: {
    async signIn(message) {
      if (process.env.NODE_ENV === "development") {
        console.log("🔐 Sign in event:", message);
      }
    },
    async signOut(message) {
      if (process.env.NODE_ENV === "development") {
        console.log("🚪 Sign out event:", message);
      }
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
export const { GET, POST } = handlers;

declare module "next-auth" {
  interface User {
    role: UserRole;
    id: string;
    provider?: string;
    needsRegistration?: boolean;
    isOAuthUser?: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
      provider?: string;
      needsRegistration?: boolean;
      isOAuthUser?: boolean;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: UserRole;
    id: string;
    provider?: string;
    needsRegistration?: boolean;
    isOAuthUser?: boolean;
  }
}
