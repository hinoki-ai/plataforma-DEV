#!/usr/bin/env tsx

/**
 * Migration Script: Move Convex Users to Clerk
 *
 * This script migrates existing users from Convex database to Clerk.
 * It should be run only once during the production migration.
 *
 * Usage: npm run migrate-users-to-clerk
 */

import { ConvexHttpClient } from "convex/browser";
import {
  createClerkUser,
  getClerkUserByEmail,
} from "../src/services/actions/clerk-users.js";
import type { ExtendedUserRole } from "../src/lib/authorization.js";

interface ConvexUser {
  _id: string;
  name?: string;
  email: string;
  password?: string;
  role: ExtendedUserRole;
  isActive: boolean;
  isOAuthUser: boolean;
  provider?: string;
  createdAt: number;
  updatedAt: number;
}

async function migrateUsersToClerk() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    process.exit(1);
  }

  const client = new ConvexHttpClient(convexUrl);

  try {
    // Get all users from Convex

    const convexUsers: ConvexUser[] = await client.query("users:getUsers", {});

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of convexUsers) {
      try {
        // Check if user already exists in Clerk
        const existingClerkUser = await getClerkUserByEmail(user.email);

        if (existingClerkUser) {
          skipped++;
          continue;
        }

        // Create user in Clerk

        const clerkUserData = {
          name: user.name || user.email,
          email: user.email,
          password: user.password, // Will be undefined for OAuth users
          role: user.role,
          isActive: user.isActive,
          skipPasswordRequirement: user.isOAuthUser || !user.password,
        };

        await createClerkUser(clerkUserData);

        migrated++;

        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        errors++;
      }
    }

    if (errors === 0) {
    } else {
    }
  } catch (error) {
    process.exit(1);
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateUsersToClerk().catch(console.error);
}

export { migrateUsersToClerk };
