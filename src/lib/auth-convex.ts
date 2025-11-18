/**
 * Convex Authentication Utilities
 * Replaces auth-prisma.ts with Convex-based authentication
 */

import bcryptjs from "bcryptjs";
import { getConvexClient } from "./convex";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export type UserRole = "MASTER" | "ADMIN" | "PROFESOR" | "PARENT" | "PUBLIC";

export interface User {
  _id: Id<"users">;
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  image: string | null;
  password?: string;
  isActive: boolean;
  needsRegistration?: boolean;
  isOAuthUser?: boolean;
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<User | null> {
  try {
    const client = getConvexClient();

    // Get user by email
    const user = await client.query(api.users.getUserByEmail, { email });

    if (!user) {
      return null;
    }

    if (!user || !user.password) {
      return null;
    }

    // Cast the user ID to the proper type
    const userId = user._id as Id<"users">;

    // Verify password
    const isValidPassword = await bcryptjs.compare(password, user.password);

    if (!isValidPassword || !user.isActive) {
      console.warn("🚫 Authentication rejected", {
        email,
        isValidPassword,
        isActive: user.isActive,
      });
      return null;
    }

    // Determine if user needs registration (for parent OAuth users)
    let needsRegistration = false;
    if (user.role === "PARENT" && user.isOAuthUser) {
      // Check if parent has completed registration
      try {
        const parentProfile = await client.query(
          api.users.getParentProfileByUserId,
          {
            userId: userId,
          },
        );
        needsRegistration = !parentProfile?.registrationComplete;
      } catch (error) {
        // If no parent profile exists, they need registration
        needsRegistration = true;
        console.warn("📝 Parent registration lookup failed", {
          email,
          message:
            error instanceof Error
              ? error.message
              : "Unknown registration error",
        });
      }
    }

    // Return user without password
    return {
      _id: user._id as Id<"users">,
      id: user._id,
      email: user.email,
      name: user.name ?? null,
      role: user.role,
      image: user.image ?? null,
      isActive: user.isActive,
      needsRegistration,
      isOAuthUser: user.isOAuthUser,
    };
  } catch (error) {
    console.error("💥 authenticateUser() threw", {
      email,
      error,
    });
    return null;
  }
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const client = getConvexClient();
    const user = await client.query(api.users.getUserByEmail, { email });

    if (!user) {
      return null;
    }

    // Cast the user ID to the proper type
    const userId = user._id as Id<"users">;

    return {
      _id: userId,
      id: userId,
      email: user.email,
      name: user.name ?? null,
      role: user.role,
      image: user.image ?? null,
      isActive: user.isActive,
    };
  } catch (error) {
    console.error("Find user error:", error);
    return null;
  }
}

/**
 * Find user by ID
 */
export async function findUserById(
  id: string | Id<"users">,
): Promise<User | null> {
  try {
    const client = getConvexClient();
    const user = await client.query(api.users.getUserById, {
      userId: id as Id<"users">,
    });

    if (!user) {
      return null;
    }

    return {
      _id: user._id as Id<"users">,
      id: user._id,
      email: user.email,
      name: user.name ?? null,
      role: user.role,
      image: user.image ?? null,
      isActive: user.isActive,
    };
  } catch (error) {
    console.error("Find user by ID error:", error);
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(data: {
  email: string;
  password?: string;
  name?: string;
  role: UserRole;
  image?: string;
  phone?: string;
  provider?: string;
  isOAuthUser?: boolean;
}): Promise<User> {
  const client = getConvexClient();

  // Hash password if provided
  const hashedPassword = data.password
    ? await bcryptjs.hash(data.password, 10)
    : undefined;

  const userId = await client.mutation(api.users.createUser, {
    email: data.email,
    password: hashedPassword,
    name: data.name,
    role: data.role,
    image: data.image,
    phone: data.phone,
    provider: data.provider,
    isOAuthUser: data.isOAuthUser ?? false,
  });

  const user = await client.query(api.users.getUserById, { userId });

  if (!user) {
    throw new Error("Failed to create user");
  }

  return {
    _id: userId,
    id: user._id,
    email: user.email,
    name: user.name ?? null,
    role: user.role,
    image: user.image ?? null,
    isActive: user.isActive,
  };
}
