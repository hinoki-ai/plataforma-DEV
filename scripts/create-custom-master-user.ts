#!/usr/bin/env tsx
/**
 * Create Custom Master User Script
 * Creates a master user with the specified credentials using Convex
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { hashPassword } from "../src/lib/crypto";

async function createCustomMasterUser() {
  console.log("🔑 Creating custom master user...");

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

      console.log("✅ Custom master user created:");
      console.log(`📧 Email: ${masterEmail}`);
      console.log(`👤 Name: ${masterName}`);
      console.log(`🔰 Role: MASTER`);
      console.log(`✅ Active: true`);
      console.log(`🔒 Password: ${masterPassword}`);
      console.log("🔒 Password is securely hashed in database");

      return result;
    } catch (error: any) {
      // If user already exists, try to update it
      if (error.message?.includes("already exists")) {
        console.log("⚠️  Custom master user already exists, updating...");

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

          console.log("✅ Custom master user updated:");
          console.log(`📧 Email: ${masterEmail}`);
          console.log(`👤 Name: ${masterName}`);
          console.log(`🔰 Role: MASTER`);
          console.log(`✅ Active: true`);
          console.log(`🔒 Password: ${masterPassword}`);
          console.log("🔒 Password is securely hashed in database");

          return updatedUser;
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("❌ Failed to create custom master user:", error);
    throw error;
  }
}

createCustomMasterUser().catch((error) => {
  console.error("Fatal error during custom master user creation:", error);
  process.exit(1);
});
