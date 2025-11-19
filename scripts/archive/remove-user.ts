#!/usr/bin/env tsx
/**
 * User Removal Script
 * Removes a specific user by email using Convex
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

async function removeUser(email: string) {
  console.log(`🗑️ Removing user: ${email}`);
  console.log("🌍 Environment:", process.env.NODE_ENV || "development");

  try {
    const deploymentUrl = process.env.CONVEX_URL;
    if (!deploymentUrl) {
      throw new Error("CONVEX_URL environment variable is not set");
    }

    const client = new ConvexHttpClient(deploymentUrl);

    // Find the user first
    const user = await client.query(api.users.getUserByEmail, { email });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return null;
    }

    console.log(`👤 Found user: ${user.name} (${user.role})`);

    // Delete the user
    await client.mutation(api.users.deleteUser, { id: user._id });

    console.log(`✅ Successfully removed: ${user.name} (${user.email})`);
    return user;
  } catch (error) {
    console.error("❌ Failed to remove user:", error);
    throw error;
  }
}

// Remove María López
removeUser("parent@plataforma-astral.com").catch((error) => {
  console.error("Fatal error during user removal:", error);
  process.exit(1);
});
