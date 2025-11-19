#!/usr/bin/env tsx
/**
 * Verify Test Users Script
 * Checks if test users exist in the Convex database
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

async function verifyUsers() {
  console.log("🔍 Verifying test users in Convex database...");

  const testEmails = [
    "admin@plataforma-astral.com",
    "profesor@plataforma-astral.com",
    "admina@plataforma-astral.com",
    "profesora@plataforma-astral.com",
    "apoderado@plataforma-astral.com",
    "apoderada@plataforma-astral.com",
  ];

  try {
    const deploymentUrl = process.env.CONVEX_URL;
    if (!deploymentUrl) {
      throw new Error("CONVEX_URL environment variable is not set");
    }

    const client = new ConvexHttpClient(deploymentUrl);

    for (const email of testEmails) {
      const user = await client.query(api.users.getUserByEmail, { email });

      if (user) {
        console.log(`✅ ${user.name} (${user.email})`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Created: ${new Date(user.createdAt).toISOString()}`);
        console.log("");
      } else {
        console.log(`❌ User not found: ${email}`);
        console.log("");
      }
    }

    // Count total users
    const userCounts = await client.query(api.users.getUserCountByRole);
    console.log(`📊 Total users in Convex database: ${userCounts.total}`);
  } catch (error) {
    console.error("❌ Error verifying users:", error);
  }
}

verifyUsers();
