#!/usr/bin/env tsx
/**
 * Create Master User Script
 * Creates a master user for testing the master login functionality using Convex
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { hashUserPassword, logUserCreation } from "../src/lib/user-creation";

async function createMasterUser() {
  try {
    const deploymentUrl = process.env.CONVEX_URL;
    if (!deploymentUrl) {
      throw new Error("CONVEX_URL environment variable is not set");
    }

    const client = new ConvexHttpClient(deploymentUrl);
    const masterEmail = "master@plataforma-astral.com";
    const masterPassword = "master123";

    // Hash the password using standardized function
    const masterPasswordHash = await hashUserPassword(masterPassword);

    try {
      // Try to create the master user
      const result = await client.action(api.users.createUserAction, {
        email: masterEmail,
        name: "Master Administrator",
        password: masterPasswordHash,
        role: "MASTER",
        isActive: true,
      });

      // Log successful creation
      logUserCreation(
        "createMasterUserScript",
        {
          email: masterEmail,
          role: "MASTER",
          name: "Master Administrator",
        },
        "system",
        true,
      );

      return result;
    } catch (error: any) {
      // If user already exists, try to update it
      if (error.message?.includes("already exists")) {
        // Get the user first
        const existingUser = await client.query(api.users.getUserByEmail, {
          email: masterEmail,
        });
        if (existingUser) {
          // Update the user with new password
          const updatedUser = await client.mutation(api.users.updateUser, {
            id: existingUser._id,
            password: masterPasswordHash,
            isActive: true,
            name: "Master Administrator",
          });

          return updatedUser;
        }
      }
      throw error;
    }
  } catch (error) {
    throw error;
  }
}

createMasterUser().catch((error) => {
  process.exit(1);
});
