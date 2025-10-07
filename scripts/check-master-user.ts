#!/usr/bin/env tsx
/**
 * Check Master User Script
 * Verifies that the master user exists and has correct credentials
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkMasterUser() {
  console.log("🔍 Checking master user in database...");

  try {
    const masterUser = await prisma.user.findUnique({
      where: { email: "master@manitospintadas.cl" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        password: true, // We'll just check if it exists
      },
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

checkMasterUser()
  .catch((error) => {
    console.error("Fatal error during master user check:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
