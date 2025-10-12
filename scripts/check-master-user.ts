#!/usr/bin/env tsx
/**
 * Check Master User Script
 * Verifies that the master user exists and has correct credentials using Convex
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

async function checkMasterUser() {
  console.log("🔍 Checking master user in Convex database...");

  try {
    const deploymentUrl = process.env.CONVEX_URL;
    if (!deploymentUrl) {
      throw new Error("CONVEX_URL environment variable is not set");
    }

    const client = new ConvexHttpClient(deploymentUrl);
    const masterUser = await client.query(api.users.getUserByEmail, {
      email: "master@manitospintadas.cl",
    });

    if (!masterUser) {
      console.log("❌ Master user not found!");
      return false;
    }

    console.log("✅ Master user found:");
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

    console.log("🎉 Master user is properly configured!");
    console.log("💡 Login credentials: master@manitospintadas.cl / master123");

    return true;
  } catch (error) {
    console.error("❌ Error checking master user:", error);
    return false;
  }
}

checkMasterUser().catch((error) => {
  console.error("Fatal error during master user check:", error);
  process.exit(1);
});
