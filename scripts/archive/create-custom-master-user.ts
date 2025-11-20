#!/usr/bin/env tsx
/**
 * Create Custom Master User Script
 * Creates a master user with the specified credentials using Convex
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { hashPassword } from "../src/lib/crypto";

async function createCustomMasterUser() {
  try {
    const deploymentUrl = process.env.CONVEX_URL;
    if (!deploymentUrl) {
      throw new Error("CONVEX_URL environment variable is not set");
    }

    const client = new ConvexHttpClient(deploymentUrl);
    const masterEmail = "agustinaramac@gmail.com";
    const masterPassword = "madmin123";
    const masterName = "Agustin Arancibia Mac-Guire - Master Deity";

    // Hash the password
    const masterPasswordHash = await hashPassword(masterPassword);

    try {
      // Try to create the custom master user
      const result = await client.action(api.users.createUserAction, {
        email: masterEmail,
        name: masterName,
        password: masterPasswordHash,
        role: "MASTER",
        isActive: true,
      });

      return result;
    } catch (error: any) {
      // If user already exists, try to update it
      if (error.message?.includes("already exists")) {
        // Get the user first
        const existingUser = await client.query(api.users.getUserByEmail, {
          email: masterEmail,
        });
        if (existingUser) {
          // Update the user with new password and details
          const updatedUser = await client.mutation(api.users.updateUser, {
            id: existingUser._id,
            password: masterPasswordHash,
            isActive: true,
            name: masterName,
            role: "MASTER",
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

createCustomMasterUser().catch((error) => {
  process.exit(1);
});
