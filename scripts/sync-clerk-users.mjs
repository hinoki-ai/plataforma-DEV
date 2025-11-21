#!/usr/bin/env node
/**
 * Sync Clerk Users to Convex
 * Manually sync all users from Clerk to Convex database using createUser mutation
 */

import { createClerkClient } from "@clerk/backend";
import { ConvexHttpClient } from "convex/browser";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

async function syncClerkUsers() {
  try {
    const clerkSecret = process.env.CLERK_SECRET_KEY;
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!clerkSecret || !convexUrl) {
      console.log("❌ Missing required environment variables");
      return;
    }

    console.log("🔗 Connecting to services...");
    const clerkClient = createClerkClient({ secretKey: clerkSecret });
    const convexClient = new ConvexHttpClient(convexUrl);

    console.log("📥 Getting users from Clerk...");
    const usersResponse = await clerkClient.users.getUserList({ limit: 100 });

    console.log(`Found ${usersResponse.data.length} users in Clerk`);

    let synced = 0;
    let skipped = 0;
    let errors = 0;

    for (const clerkUser of usersResponse.data) {
      try {
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        console.log(`\n🔄 Processing: ${email}`);

        // Extract role from public metadata, default to PUBLIC if not set
        const role = clerkUser.publicMetadata?.role || "PUBLIC";

        // Check if user already exists in Convex
        const existingUsers = await convexClient.query("users:getUsers", {});
        const existingUser = existingUsers.find((u) => u.email === email);

        if (existingUser) {
          console.log(`   ⚠️  User already exists in Convex, skipping`);
          skipped++;
          continue;
        }

        // Create user in Convex
        const userData = {
          name:
            [clerkUser.firstName, clerkUser.lastName]
              .filter(Boolean)
              .join(" ") ||
            clerkUser.username ||
            email,
          email: email,
          role: role,
          image: clerkUser.imageUrl,
          provider: "clerk",
          isOAuthUser: true,
          status: "ACTIVE",
        };

        await convexClient.mutation("users:createUser", userData);

        // Now update the user with Clerk ID
        const createdUsers = await convexClient.query("users:getUsers", {});
        const newUser = createdUsers.find((u) => u.email === email);

        if (newUser) {
          await convexClient.mutation("users:linkClerkIdentity", {
            userId: newUser._id,
            clerkId: clerkUser.id,
          });
        }

        console.log(`   ✅ Synced`);
        synced++;
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        errors++;
      }
    }

    console.log(`\n📊 Sync Complete:`);
    console.log(`   ✅ Synced: ${synced}`);
    console.log(`   ⚠️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📋 Total: ${usersResponse.data.length}`);
  } catch (error) {
    console.error("❌ Sync failed:", error.message);
  }
}

syncClerkUsers();
