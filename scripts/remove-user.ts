#!/usr/bin/env tsx
/**
 * User Removal Script
 * Removes a specific user by email
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function removeUser(email: string) {
  console.log(`🗑️ Removing user: ${email}`);
  console.log("🌍 Environment:", process.env.NODE_ENV || "development");

  try {
    // Find the user first
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return null;
    }

    console.log(`👤 Found user: ${user.name} (${user.role})`);

    // Delete the user
    await prisma.user.delete({
      where: { email },
    });

    console.log(`✅ Successfully removed: ${user.name} (${user.email})`);
    return user;
  } catch (error) {
    console.error("❌ Failed to remove user:", error);
    throw error;
  }
}

// Remove María López
removeUser("parent@manitospintadas.cl")
  .catch((error) => {
    console.error("Fatal error during user removal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
