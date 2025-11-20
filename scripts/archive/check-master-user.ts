#!/usr/bin/env tsx
/**
 * Check Master User Script
 * Verifies that the master user exists and has correct credentials using Convex
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

async function checkMasterUser() {
  try {
    const deploymentUrl = process.env.CONVEX_URL;
    if (!deploymentUrl) {
      throw new Error("CONVEX_URL environment variable is not set");
    }

    const client = new ConvexHttpClient(deploymentUrl);
    const masterUser = await client.query(api.users.getUserByEmail, {
      email: "master@plataforma-astral.com",
    });

    if (!masterUser) {
      return false;
    }

    if (masterUser.role !== "MASTER") {
      return false;
    }

    if (!masterUser.isActive) {
      return false;
    }

    if (!masterUser.password) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

checkMasterUser().catch((error) => {
  process.exit(1);
});
