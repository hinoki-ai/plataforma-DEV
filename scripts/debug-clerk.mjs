#!/usr/bin/env node
/**
 * Clerk Authentication Flow Debugger
 * Tests Clerk integration and identifies issues
 */

import { createClerkClient } from "@clerk/backend";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

console.log("╔═══════════════════════════════════════════════════════════╗");
console.log("║         CLERK AUTHENTICATION DEBUG TOOL                  ║");
console.log("╚═══════════════════════════════════════════════════════════╝\n");

async function testClerkIntegration() {
  try {
    console.log("🔧 Step 1: Environment Check\n");

    const clerkSecret = process.env.CLERK_SECRET_KEY;
    const clerkPublishable = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    console.log(
      `   CLERK_SECRET_KEY: ${clerkSecret ? "✅ Set" : "❌ Missing"}`,
    );
    console.log(
      `   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${clerkPublishable ? "✅ Set" : "❌ Missing"}`,
    );
    console.log(
      `   CLERK_WEBHOOK_SECRET: ${webhookSecret ? "✅ Set" : "❌ Missing"}`,
    );
    console.log(
      `   NEXT_PUBLIC_CONVEX_URL: ${convexUrl ? "✅ Set" : "❌ Missing"}`,
    );

    if (!clerkSecret || !clerkPublishable) {
      console.log("\n❌ Missing required Clerk environment variables!");
      console.log(
        "   Please check your .env.local file and ensure Clerk variables are set.",
      );
      return;
    }

    console.log("\n🔍 Step 2: Clerk Connection Test\n");

    try {
      const clerkClient = createClerkClient({ secretKey: clerkSecret });

      // Try to get users (this will test if the API key works)
      const usersResponse = await clerkClient.users.getUserList({ limit: 5 });
      console.log(`   ✅ Clerk API Connected!`);
      console.log(`   Found ${usersResponse.data.length} users in Clerk`);

      if (usersResponse.data.length > 0) {
        console.log("\n👥 Step 3: Sample Users\n");
        usersResponse.data.forEach((user, index) => {
          const email =
            user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
              ?.emailAddress || "No email";
          const role = user.publicMetadata?.role || "No role";
          console.log(`   ${index + 1}. ${email} - Role: ${role}`);
        });
      }

      console.log("\n📋 Step 4: Current User Roles\n");
      const roleCounts = {
        MASTER: 0,
        ADMIN: 0,
        PROFESOR: 0,
        PARENT: 0,
        PUBLIC: 0,
      };

      usersResponse.data.forEach((user) => {
        const role = user.publicMetadata?.role || "PUBLIC";
        if (role in roleCounts) {
          roleCounts[role]++;
        }
      });

      Object.entries(roleCounts).forEach(([role, count]) => {
        console.log(`   ${role}: ${count} users`);
      });
    } catch (error) {
      console.log(`   ❌ Clerk API Error: ${error.message}`);
      console.log("   This could mean:");
      console.log("   - Invalid API key");
      console.log("   - Network connectivity issues");
      console.log("   - Clerk service issues");
    }

    console.log("\n🔗 Step 5: Webhook Configuration Check\n");
    console.log(
      "   Webhook URL should be: https://plataforma.aramac.dev/api/clerk/webhook",
    );
    console.log(
      `   Webhook secret: ${webhookSecret ? "✅ Configured" : "❌ Missing"}`,
    );
    console.log(
      "   Events to monitor: user.created, user.updated, user.deleted",
    );

    console.log("\n📊 Step 6: Troubleshooting Guide\n");
    console.log("   If users can login but get redirected:");
    console.log("   1. Check if user has 'role' in publicMetadata in Clerk");
    console.log("   2. Verify webhook is receiving and processing events");
    console.log("   3. Check Convex database has user record");
    console.log("   4. Look for [AUTH-SUCCESS] logs in server console");
    console.log("   5. Check client-side useSession hook fallback logic");

    console.log("\n✅ Diagnostic Complete!\n");
  } catch (error) {
    console.error("\n❌ Error during diagnostic:", error.message);
  }
}

testClerkIntegration();

