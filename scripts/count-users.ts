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
      console.log(
        JSON.stringify(
          {
            total: userCounts.total,
            byRole: {
              MASTER: userCounts.MASTER,
              ADMIN: userCounts.ADMIN,
              PROFESOR: userCounts.PROFESOR,
              PARENT: userCounts.PARENT,
              PUBLIC: userCounts.PUBLIC,
            },
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        ),
      );
      return userCounts;
    }

    // Text format output
    console.log(`👥 ${userCounts.total} users in Convex database`);

    if (showDetails) {
      console.log("\n📊 By Role:");
      console.log(`  MASTER: ${userCounts.MASTER}`);
      console.log(`  ADMIN: ${userCounts.ADMIN}`);
      console.log(`  PROFESOR: ${userCounts.PROFESOR}`);
      console.log(`  PARENT: ${userCounts.PARENT}`);
      console.log(`  PUBLIC: ${userCounts.PUBLIC}`);

      console.log("\n📋 Recent Users:");
      // Get all users and sort by createdAt desc to get recent ones
      const allUsers = await client.query(api.users.getUsers, {});
      const recentUsers = allUsers
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 10);

      recentUsers.forEach((user) => {
        const status = user.isActive ? "✅" : "❌";
        const date = new Date(user.createdAt).toLocaleDateString("es-CL");
        console.log(
          `  ${status} ${user.name || 'N/A'} (${user.email}) - ${user.role} [${date}]`,
        );
      });

      if (userCounts.total > 10) {
        console.log(`  ... and ${userCounts.total - 10} more users`);
      }
    }

    return userCounts;
  } catch (error) {
    console.error(
      "❌ Failed to count users:",
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}

countUsers()
  .catch((error) => {
    console.error("Fatal error during user count:", error);
    process.exit(1);
  });
