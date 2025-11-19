#!/usr/bin/env tsx
/**
 * Verify Custom Master User Script
 * Verifies that the custom master user exists and has correct credentials using Convex
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

async function verifyCustomMasterUser() {
  console.log("🔍 Verifying custom master user...");

  try {
    const deploymentUrl = process.env.CONVEX_URL;
    if (!deploymentUrl) {
      throw new Error("CONVEX_URL environment variable is not set");
    }

    const client = new ConvexHttpClient(deploymentUrl);
    const masterUser = await client.query(api.users.getUserByEmail, {
      email: "agustinaramac@gmail.com",
    });

    if (!masterUser) {
      console.log("❌ Custom master user not found!");
      return false;
    }

    console.log("✅ Custom master user found:");
    console.log(`📧 Email: ${masterUser.email}`);
    console.log(`👤 Name: ${masterUser.name}`);
    console.log(`🔰 Role: ${masterUser.role}`);
    console.log(`✅ Active: ${masterUser.isActive}`);
    console.log(`🔒 Has Password: ${!!masterUser.password}`);

    if (masterUser.role !== "MASTER") {
      console.log("❌ ERROR: User role is not MASTER!");
      return false;
    }

    if (!masterUser.isActive) {
      console.log("❌ ERROR: Master user is not active!");
      return false;
    }

    if (!masterUser.password) {
      console.log("❌ ERROR: Master user has no password!");
      return false;
    }

    console.log("🎉 Custom master user is properly configured!");
    console.log("💡 Login credentials: agustinaramac@gmail.com / madmin123");

    return true;
  } catch (error) {
    console.error("❌ Error verifying custom master user:", error);
    return false;
  }
}

verifyCustomMasterUser().catch((error) => {
  console.error("Fatal error during custom master user verification:", error);
  process.exit(1);
});
