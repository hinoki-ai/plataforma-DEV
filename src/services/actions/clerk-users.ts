import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/backend";
import type { ExtendedUserRole } from "@/lib/authorization";

// Define Clerk parameter types locally
interface CreateUserParams {
  firstName?: string;
  lastName?: string;
  emailAddress: string[];
  password?: string;
  skipPasswordRequirement?: boolean;
  publicMetadata?: Record<string, any>;
}

interface UpdateUserParams {
  firstName?: string;
  lastName?: string;
  emailAddress?: string[];
  password?: string;
  publicMetadata?: Record<string, any>;
}

export interface ClerkUserData {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: ExtendedUserRole;
  isActive: boolean;
  provider: string;
  isOAuthUser: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClerkUserData {
  name: string;
  email: string;
  password?: string;
  role: ExtendedUserRole;
  isActive?: boolean;
  skipPasswordRequirement?: boolean;
}

export interface UpdateClerkUserData {
  name?: string;
  email?: string;
  role?: ExtendedUserRole;
  isActive?: boolean;
}

/**
 * Convert Clerk user to our application format
 */
function clerkUserToAppFormat(user: User): ClerkUserData {
  const primaryEmail =
    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)
      ?.emailAddress || user.emailAddresses[0]?.emailAddress;

  const metadataRole = user.publicMetadata?.role || user.privateMetadata?.role;
  const role = normalizeRole(metadataRole as string);

  return {
    id: user.id,
    email: primaryEmail || "",
    name:
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`.trim()
        : user.username || null,
    image: user.imageUrl || null,
    role,
    isActive: !user.banned,
    provider: user.externalAccounts.length > 0 ? "oauth" : "clerk",
    isOAuthUser: user.externalAccounts.length > 0,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  };
}

/**
 * Normalize role string to our enum values
 */
function normalizeRole(role: string | undefined): ExtendedUserRole {
  const validRoles: ExtendedUserRole[] = [
    "MASTER",
    "ADMIN",
    "PROFESOR",
    "PARENT",
    "PUBLIC",
  ];
  const upperRole = role?.toUpperCase();
  return validRoles.includes(upperRole as ExtendedUserRole)
    ? (upperRole as ExtendedUserRole)
    : "PUBLIC";
}

/**
 * Create a new user in Clerk
 */
export async function createClerkUser(
  data: CreateClerkUserData,
): Promise<ClerkUserData> {
  try {
    const client = await clerkClient();

    const userParams: CreateUserParams = {
      firstName: data.name.split(" ")[0],
      lastName:
        data.name.split(" ").slice(1).join(" ") || data.name.split(" ")[0],
      emailAddress: [data.email],
      password: data.password,
      skipPasswordRequirement: data.skipPasswordRequirement || false,
      publicMetadata: {
        role: data.role.toUpperCase(),
        isActive: data.isActive ?? true,
      },
    };

    // Remove password if not provided for OAuth users
    if (!data.password && data.skipPasswordRequirement) {
      delete userParams.password;
    }

    const user = await client.users.createUser(userParams);
    return clerkUserToAppFormat(user);
  } catch (error) {
    throw new Error(
      `Failed to create user: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Get user by ID from Clerk
 */
export async function getClerkUserById(
  userId: string,
): Promise<ClerkUserData | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return clerkUserToAppFormat(user);
  } catch (error) {
    return null;
  }
}

/**
 * Get user by email from Clerk
 */
export async function getClerkUserByEmail(
  email: string,
): Promise<ClerkUserData | null> {
  try {
    const client = await clerkClient();
    const users = await client.users.getUserList({ emailAddress: [email] });

    if (users.data.length === 0) {
      return null;
    }

    return clerkUserToAppFormat(users.data[0]);
  } catch (error) {
    return null;
  }
}

/**
 * Get all users from Clerk with optional role filter
 */
export async function getClerkUsers(
  role?: ExtendedUserRole,
): Promise<ClerkUserData[]> {
  try {
    const client = await clerkClient();
    const users = await client.users.getUserList({ limit: 100 });

    let filteredUsers = users.data
      .filter((user) => user) // Filter out null/undefined users
      .map((user) => {
        try {
          return clerkUserToAppFormat(user);
        } catch (error) {
          return null;
        }
      })
      .filter((user) => user !== null);

    if (role) {
      filteredUsers = filteredUsers.filter((user) => user.role === role);
    }

    return filteredUsers;
  } catch (error) {
    return [];
  }
}

/**
 * Update user in Clerk
 */
export async function updateClerkUser(
  userId: string,
  data: UpdateClerkUserData,
): Promise<ClerkUserData> {
  try {
    const client = await clerkClient();

    const updateParams: UpdateUserParams = {};

    if (data.name) {
      const nameParts = data.name.split(" ");
      updateParams.firstName = nameParts[0];
      updateParams.lastName = nameParts.slice(1).join(" ") || nameParts[0];
    }

    if (data.email) {
      updateParams.emailAddress = [data.email];
    }

    const metadata: Record<string, any> = {};
    if (data.role) {
      metadata.role = data.role.toUpperCase();
    }
    if (data.isActive !== undefined) {
      metadata.isActive = data.isActive;
    }

    if (Object.keys(metadata).length > 0) {
      updateParams.publicMetadata = metadata;
    }

    // Handle banning/unbanning
    if (data.isActive === false) {
      await client.users.banUser(userId);
    } else if (data.isActive === true) {
      await client.users.unbanUser(userId);
    }

    const user = await client.users.updateUser(userId, updateParams);
    return clerkUserToAppFormat(user);
  } catch (error) {
    throw new Error(
      `Failed to update user: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Delete user from Clerk
 */
export async function deleteClerkUser(userId: string): Promise<void> {
  try {
    const client = await clerkClient();
    await client.users.deleteUser(userId);
  } catch (error) {
    throw new Error(
      `Failed to delete user: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Get user count by role from Clerk
 */
export async function getClerkUserCountByRole(): Promise<
  Record<ExtendedUserRole, number> & { total: number }
> {
  try {
    const users = await getClerkUsers();
    const counts = {
      MASTER: 0,
      ADMIN: 0,
      PROFESOR: 0,
      PARENT: 0,
      PUBLIC: 0,
      total: users.length,
    };

    users.forEach((user) => {
      if (user.role in counts) {
        counts[user.role as keyof typeof counts]++;
      }
    });

    return counts;
  } catch (error) {
    return {
      MASTER: 0,
      ADMIN: 0,
      PROFESOR: 0,
      PARENT: 0,
      PUBLIC: 0,
      total: 0,
    };
  }
}
