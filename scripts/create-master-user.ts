#!/usr/bin/env tsx
/**
 * Create Master User Script
 * Creates a master user for testing the master login functionality
 */

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/crypto";

const prisma = new PrismaClient();

async function createMasterUser() {
  console.log("🔑 Creating master user...");

  try {
    const masterEmail = "master@plataforma-astral.com";
    const masterPassword = "master123";

    // Hash the password
    const masterPasswordHash = await hashPassword(masterPassword);

    // Create/update master user
    const master = await prisma.user.upsert({
      where: { email: masterEmail },
      update: {
        password: masterPasswordHash,
        isActive: true,
        name: "Master Administrator",
      },
      create: {
        email: masterEmail,
        name: "Master Administrator",
        password: masterPasswordHash,
        role: "MASTER",
        isActive: true,
      },
    });

    console.log("✅ Master user created/updated:");
    console.log(`📧 Email: ${masterEmail}`);
    console.log(`🔑 Password: ${masterPassword}`);
    console.log(`👤 Role: ${master.role}`);
    console.log("🔒 Password is securely hashed in database");

    return master;
  } catch (error) {
    console.error("❌ Failed to create master user:", error);
    throw error;
  }
}

createMasterUser()
  .catch((error) => {
    console.error("Fatal error during master user creation:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
