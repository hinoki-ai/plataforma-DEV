#!/usr/bin/env tsx
/**
 * Create Master User Script
 * Creates a master user for testing the master login functionality using Convex
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { hashPassword } from "../src/lib/crypto";

async function createMasterUser() {
  console.log("🔑 Creating master user...");

  try {
    const deploymentUrl = process.env.CONVEX_URL;
    if (!deploymentUrl) {
      throw new Error("CONVEX_URL environment variable is not set");
    }

    const client = new ConvexHttpClient(deploymentUrl);
    const masterEmail = "master@plataforma-astral.com";
    const masterPassword = "master123";

    // Hash the password
    const masterPasswordHash = await hashPassword(masterPassword);

    try {
      // Try to create the master user
      const result = await client.action(api.users.createUserAction, {
        email: masterEmail,
        name: "Master Administrator",
        password: masterPasswordHash,
        role: "MASTER",
        isActive: true,
      });

      console.log("✅ Master user created:");
      console.log(`📧 Email: ${masterEmail}`);
      console.log(`🔑 Password: ${masterPassword}`);
      console.log(`👤 Role: MASTER`);
      console.log("🔒 Password is securely hashed in database");

      return result;
    } catch (error: any) {
      // If user already exists, try to update it
      if (error.message?.includes("already exists")) {
        console.log("⚠️  Master user already exists, updating password...");

        // Get the user first
        const existingUser = await client.query(api.users.getUserByEmail, { email: masterEmail });
        if (existingUser) {
          // Update the user with new password
          const updatedUser = await client.mutation(api.users.updateUser, {
            id: existingUser._id,
            password: masterPasswordHash,
            isActive: true,
            name: "Master Administrator",
          });

          console.log("✅ Master user updated:");
          console.log(`📧 Email: ${masterEmail}`);
          console.log(`🔑 Password: ${masterPassword}`);
          console.log(`👤 Role: ${existingUser.role}`);
          console.log("🔒 Password is securely hashed in database");

          return updatedUser;
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("❌ Failed to create master user:", error);
    throw error;
  }
}

createMasterUser()
  .catch((error) => {
    console.error("Fatal error during master user creation:", error);
    process.exit(1);
  });
