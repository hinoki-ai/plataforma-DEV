#!/usr/bin/env tsx

/**
 * Import Convex Users to Clerk
 *
 * This script:
 * 1. Exports all users from Convex database
 * 2. Creates JSON export file (Clerk-compatible format)
 * 3. Imports users into Clerk using Clerk Backend API
 * 4. Updates Convex users with Clerk IDs
 *
 * Usage: npm run import-convex-to-clerk
 * Or: tsx scripts/import-convex-users-to-clerk.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { clerkClient } from "@clerk/backend";
import * as fs from "fs";
import * as path from "path";
import type { ExtendedUserRole } from "../src/lib/authorization";

interface ConvexUser {
  _id: string;
  name?: string;
  email: string;
  password?: string;
  role: ExtendedUserRole;
  phone?: string;
  image?: string;
  isActive: boolean;
  isOAuthUser: boolean;
  provider?: string;
  status?: "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED";
  clerkId?: string;
  createdAt: number;
  updatedAt: number;
}

interface ClerkImportUser {
  emailAddress: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  skipPasswordRequirement?: boolean;
  publicMetadata?: {
    role: string;
    isActive: boolean;
    convexUserId?: string;
  };
  privateMetadata?: {
    role: string;
  };
  phoneNumbers?: string[];
}

/**
 * Normalize role to match Clerk expectations
 */
function normalizeRole(role: string): ExtendedUserRole {
  const upperRole = role.toUpperCase();
  const validRoles: ExtendedUserRole[] = [
    "MASTER",
    "ADMIN",
    "PROFESOR",
    "PARENT",
    "PUBLIC",
  ];
  return validRoles.includes(upperRole as ExtendedUserRole)
    ? (upperRole as ExtendedUserRole)
    : "PUBLIC";
}

/**
 * Split name into first and last name
 */
function splitName(name: string | undefined): {
  firstName: string;
  lastName: string;
} {
  if (!name || name.trim() === "") {
    return { firstName: "", lastName: "" };
  }

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: parts[0] };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

/**
 * Export users from Convex
 */
async function exportConvexUsers(
  client: ConvexHttpClient,
): Promise<ConvexUser[]> {
  const users = await client.query(api.users.getUsers, {});

  return users as ConvexUser[];
}

/**
 * Create Clerk import format JSON file
 */
async function createClerkImportFile(
  users: ConvexUser[],
  outputPath: string,
): Promise<void> {
  const clerkImportData: ClerkImportUser[] = users
    .filter((user) => !user.clerkId) // Only export users without Clerk ID
    .map((user) => {
      const { firstName, lastName } = splitName(user.name);

      return {
        emailAddress: user.email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        password:
          user.password && !user.isOAuthUser ? user.password : undefined,
        skipPasswordRequirement: user.isOAuthUser || !user.password,
        publicMetadata: {
          role: normalizeRole(user.role),
          isActive: user.isActive,
          convexUserId: user._id,
        },
        privateMetadata: {
          role: normalizeRole(user.role),
        },
        phoneNumbers: user.phone ? [user.phone] : undefined,
      };
    });

  // Remove undefined values
  const cleanedData = clerkImportData.map((user) => {
    const cleaned: any = {};
    Object.keys(user).forEach((key) => {
      const value = (user as any)[key];
      if (value !== undefined) {
        cleaned[key] = value;
      }
    });
    return cleaned;
  });

  fs.writeFileSync(outputPath, JSON.stringify(cleanedData, null, 2), "utf-8");
}

/**
 * Import users to Clerk
 */
async function importUsersToClerk(
  users: ConvexUser[],
  convexClient: ConvexHttpClient,
): Promise<void> {
  const clerk = clerkClient(process.env.CLERK_SECRET_KEY!);
  const usersToImport = users.filter((user) => !user.clerkId);

  let imported = 0;
  let skipped = 0;
  let errors = 0;
  const errorsList: Array<{ email: string; error: string }> = [];

  for (let i = 0; i < usersToImport.length; i++) {
    const user = usersToImport[i];
    const progress = `[${i + 1}/${usersToImport.length}]`;

    try {
      // Check if user already exists in Clerk
      const existingUsers = await clerk.users.getUserList({
        emailAddress: [user.email],
      });

      if (existingUsers.data.length > 0) {
        const existingUser = existingUsers.data[0];

        // Link the existing Clerk user to Convex
        await convexClient.mutation(api.users.linkClerkIdentity, {
          userId: user._id as any,
          clerkId: existingUser.id,
        });

        skipped++;
        continue;
      }

      // Prepare user data for Clerk
      const { firstName, lastName } = splitName(user.name);

      const clerkUserParams: any = {
        emailAddress: [user.email],
        firstName: firstName || user.email.split("@")[0],
        lastName: lastName || "",
        skipPasswordRequirement: user.isOAuthUser || !user.password,
        publicMetadata: {
          role: normalizeRole(user.role),
          isActive: user.isActive,
          convexUserId: user._id,
        },
        privateMetadata: {
          role: normalizeRole(user.role),
        },
      };

      // Add phone if available
      if (user.phone) {
        clerkUserParams.phoneNumbers = [user.phone];
      }

      // Add password if available and not OAuth user
      if (user.password && !user.isOAuthUser) {
        // Note: If passwords are hashed, Clerk expects plain text or specific hash format
        // You may need to handle password migration differently based on your setup
        // For now, we'll skip password for hashed passwords and let users reset
        if (!user.password.startsWith("$2")) {
          // Not bcrypt hash, might be plain text (not recommended)
          // Or you might have a different hash format
          clerkUserParams.password = user.password;
        } else {
          // Password is hashed, skip it and require password reset
          clerkUserParams.skipPasswordRequirement = true;
        }
      }

      // Create user in Clerk

      const clerkUser = await clerk.users.createUser(clerkUserParams);

      // Link Clerk ID to Convex user
      await convexClient.mutation(api.users.linkClerkIdentity, {
        userId: user._id as any,
        clerkId: clerkUser.id,
      });

      imported++;

      // Rate limiting: wait 100ms between requests
      if (i < usersToImport.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || error?.toString() || "Unknown error";

      errors++;
      errorsList.push({ email: user.email, error: errorMessage });

      // Continue with next user even if one fails
      continue;
    }
  }

  // Print summary

  if (errorsList.length > 0) {
    errorsList.forEach(({ email, error }) => {});
  }

  if (errors === 0) {
  } else {
  }
}

/**
 * Main function
 */
async function main() {
  // Check environment variables
  const convexUrl =
    process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
  if (!convexUrl) {
    process.exit(1);
  }

  if (!process.env.CLERK_SECRET_KEY) {
    process.exit(1);
  }

  try {
    // Initialize Convex client
    const convexClient = new ConvexHttpClient(convexUrl);

    // Step 1: Export users from Convex
    const convexUsers = await exportConvexUsers(convexClient);

    if (convexUsers.length === 0) {
      return;
    }

    // Step 2: Create JSON export file (optional, for backup/reference)
    const exportDir = path.join(process.cwd(), "scripts", "exports");
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const exportPath = path.join(
      exportDir,
      `convex-users-export-${new Date().toISOString().split("T")[0]}.json`,
    );
    await createClerkImportFile(convexUsers, exportPath);

    // Step 3: Import users to Clerk
    await importUsersToClerk(convexUsers, convexClient);
  } catch (error) {
    if (error instanceof Error) {
    }
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    process.exit(1);
  });
}

export { main as importConvexUsersToClerk };
