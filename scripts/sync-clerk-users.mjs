#!/usr/bin/env node
/**
 * Sync Clerk Users to Convex
 * Manually sync all users from Clerk to Convex database
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
        console.log(
          `\n🔄 Processing: ${clerkUser.emailAddresses[0]?.emailAddress}`,
        );

        // Extract user data in the format expected by Convex
        const userData = {
          id: clerkUser.id,
          first_name: clerkUser.firstName,
          last_name: clerkUser.lastName,
          username: clerkUser.username,
          image_url: clerkUser.imageUrl,
          primary_email_address_id: clerkUser.primaryEmailAddressId,
          email_addresses: clerkUser.emailAddresses.map((email) => ({
            id: email.id,
            email_address: email.emailAddress,
            verification: {
              status: email.verification.status,
              strategy: email.verification.strategy,
            },
          })),
          public_metadata: clerkUser.publicMetadata,
          private_metadata: clerkUser.privateMetadata,
          banned: clerkUser.banned,
          created_at: clerkUser.createdAt,
          updated_at: clerkUser.updatedAt,
        };

        // Call the sync mutation
        await convexClient.mutation("users:syncFromClerk", {
          data: userData,
        });

        console.log(`   ✅ Synced`);
        synced++;
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        errors++;
      }
    }

    console.log(`\n📊 Sync Complete:`);
    console.log(`   ✅ Synced: ${synced}`);
    console.log(`   ⚠️  Errors: ${errors}`);
    console.log(`   📋 Total: ${usersResponse.data.length}`);
  } catch (error) {
    console.error("❌ Sync failed:", error.message);
  }
}

syncClerkUsers();
