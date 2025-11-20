#!/usr/bin/env node
/**
 * Check Convex Users Script
 * Queries Convex database to see current user records
 */

import { ConvexHttpClient } from 'convex/browser';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function checkConvexUsers() {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!convexUrl) {
      console.log("❌ NEXT_PUBLIC_CONVEX_URL not set");
      return;
    }

    console.log("🔍 Connecting to Convex...");
    const client = new ConvexHttpClient(convexUrl);

    console.log("📊 Getting all users...");
    const users = await client.query("users:getUsers", {});

    console.log(`\n✅ Found ${users.length} users in Convex:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - Role: ${user.role} - Active: ${user.isActive}`);
      console.log(`   Clerk ID: ${user.clerkId || 'None'}`);
      console.log(`   Created: ${new Date(user.createdAt).toLocaleDateString()}`);
      console.log("");
    });

    console.log("🔍 Checking specific users from Clerk...");

    const clerkEmails = [
      'apoderado@astral.cl',
      'profesor@astral.cl',
      'admin@astral.cl',
      'riquelmeiturracatalina@gmail.com',
      'agustinarancibia@live.cl'
    ];

    console.log("\n📋 User sync status:\n");

    for (const email of clerkEmails) {
      try {
        const convexUser = users.find(u => u.email === email);
        const status = convexUser ? '✅ Synced' : '❌ Missing';
        const role = convexUser?.role || 'Unknown';
        console.log(`${status} ${email} - ${role}`);
      } catch (error) {
        console.log(`❌ Error checking ${email}: ${error.message}`);
      }
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkConvexUsers();
