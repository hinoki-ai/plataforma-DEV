#!/usr/bin/env tsx
/**
 * User Removal Script
 * Removes a specific user by email using Convex
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

async function removeUser(email: string) {
  try {
    const deploymentUrl = process.env.CONVEX_URL;
    if (!deploymentUrl) {
      throw new Error("CONVEX_URL environment variable is not set");
    }

    const client = new ConvexHttpClient(deploymentUrl);

    // Find the user first
    const user = await client.query(api.users.getUserByEmail, { email });

    if (!user) {
      return null;
    }

    // Delete the user
    await client.mutation(api.users.deleteUser, { id: user._id });

    return user;
  } catch (error) {
    throw error;
  }
}

// Remove test user - email should be loaded from environment variable
const testUserEmail = process.env.TEST_USER_EMAIL || "test@example.com";
removeUser(testUserEmail).catch((error) => {
  process.exit(1);
});
