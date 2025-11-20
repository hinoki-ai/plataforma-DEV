#!/usr/bin/env tsx
/**
 * User Count Script
 * Counts and displays all users in the Convex database
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

async function countUsers() {
  const format = process.argv.includes("--json") ? "json" : "text";
  const showDetails =
    process.argv.includes("--details") || process.env.DEBUG === "true";

  try {
    const deploymentUrl = process.env.CONVEX_URL;
    if (!deploymentUrl) {
      throw new Error("CONVEX_URL environment variable is not set");
    }

    const client = new ConvexHttpClient(deploymentUrl);

    // Get user count by role from Convex
    const userCounts = await client.query(api.users.getUserCountByRole);

    if (format === "json") {
      return userCounts;
    }

    // Text format output

    if (showDetails) {
      // Get all users and sort by createdAt desc to get recent ones
      const allUsers = await client.query(api.users.getUsers, {});
      const recentUsers = allUsers
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 10);

      recentUsers.forEach((user) => {
        const status = user.isActive ? "✅" : "❌";
        const date = new Date(user.createdAt).toLocaleDateString("es-CL");
      });

      if (userCounts.total > 10) {
      }
    }

    return userCounts;
  } catch (error) {
    throw error;
  }
}

countUsers().catch((error) => {
  process.exit(1);
});
