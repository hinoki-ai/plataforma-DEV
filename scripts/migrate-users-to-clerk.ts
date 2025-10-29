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
  console.log("🚀 Starting user migration from Convex to Clerk");
  console.log("================================================");

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.error("❌ NEXT_PUBLIC_CONVEX_URL environment variable is not set");
    process.exit(1);
  }

  const client = new ConvexHttpClient(convexUrl);

  try {
    // Get all users from Convex
    console.log("📋 Fetching users from Convex...");
    const convexUsers: ConvexUser[] = await client.query("users:getUsers", {});

    console.log(`✅ Found ${convexUsers.length} users in Convex`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of convexUsers) {
      try {
        // Check if user already exists in Clerk
        const existingClerkUser = await getClerkUserByEmail(user.email);

        if (existingClerkUser) {
          console.log(`⏭️  Skipping ${user.email} - already exists in Clerk`);
          skipped++;
          continue;
        }

        // Create user in Clerk
        console.log(`🔄 Migrating ${user.email}...`);

        const clerkUserData = {
          name: user.name || user.email,
          email: user.email,
          password: user.password, // Will be undefined for OAuth users
          role: user.role,
          isActive: user.isActive,
          skipPasswordRequirement: user.isOAuthUser || !user.password,
        };

        await createClerkUser(clerkUserData);

        console.log(`✅ Migrated ${user.email}`);
        migrated++;

        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Failed to migrate ${user.email}:`, error);
        errors++;
      }
    }

    console.log("\n📊 Migration Summary");
    console.log("===================");
    console.log(`✅ Successfully migrated: ${migrated}`);
    console.log(`⏭️  Skipped (already exist): ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total processed: ${convexUsers.length}`);

    if (errors === 0) {
      console.log("\n🎉 Migration completed successfully!");
      console.log("\n📝 Next steps:");
      console.log("1. Test the application with Clerk authentication");
      console.log("2. Update your deployment to use the new Clerk-based auth");
      console.log("3. Monitor for any authentication issues");
      console.log(
        "4. Consider keeping Convex users as backup for rollback purposes",
      );
    } else {
      console.log(
        "\n⚠️  Migration completed with errors. Please review the failed migrations.",
      );
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateUsersToClerk().catch(console.error);
}

export { migrateUsersToClerk };
