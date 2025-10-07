#!/usr/bin/env tsx
/**
 * User Count Script
 * Counts and displays all users in the database
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function countUsers() {
  const format = process.argv.includes("--json") ? "json" : "text";
  const showDetails =
    process.argv.includes("--details") || process.env.DEBUG === "true";

  try {
    // Get total count
    const totalUsers = await prisma.user.count();

    // Get count by role
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: {
        role: true,
      },
    });

    if (format === "json") {
      console.log(
        JSON.stringify(
          {
            total: totalUsers,
            byRole: usersByRole.reduce(
              (acc, group) => {
                acc[group.role] = group._count.role;
                return acc;
              },
              {} as Record<string, number>,
            ),
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        ),
      );
      return { totalUsers, usersByRole };
    }

    // Text format output
    console.log(`👥 ${totalUsers} users in database`);

    if (showDetails) {
      console.log("\n📊 By Role:");
      usersByRole.forEach((group) => {
        console.log(`  ${group.role}: ${group._count.role}`);
      });

      console.log("\n📋 Recent Users:");
      const recentUsers = await prisma.user.findMany({
        select: {
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      });

      recentUsers.forEach((user, index) => {
        const status = user.isActive ? "✅" : "❌";
        const date = user.createdAt.toLocaleDateString("es-CL");
        console.log(
          `  ${status} ${user.name} (${user.email}) - ${user.role} [${date}]`,
        );
      });

      if (totalUsers > 10) {
        console.log(`  ... and ${totalUsers - 10} more users`);
      }
    }

    return { totalUsers, usersByRole };
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
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
