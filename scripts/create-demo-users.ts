#!/usr/bin/env tsx
/**
 * Create Demo Users Script
 * Creates the specific demo users requested
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { hashPassword } from "../src/lib/crypto";

async function createDemoUsers() {
  console.log("🔑 Creating demo users...");

  try {
    const deploymentUrl = process.env.CONVEX_URL;
    if (!deploymentUrl) {
      throw new Error("CONVEX_URL environment variable is not set");
    }

    const client = new ConvexHttpClient(deploymentUrl);

    // Master user password
    const masterPassword = "master123";
    const masterPasswordHash = await hashPassword(masterPassword);

    // Demo account password
    const demoPassword = "demo123";
    const demoPasswordHash = await hashPassword(demoPassword);

    console.log("\n👤 Creating MASTER user...");
    await client.action(api.users.createUserAction, {
      email: "agustin@astral.cl",
      name: "Agustin - Master Admin",
      password: masterPasswordHash,
      role: "MASTER",
      status: "ACTIVE",
    });
    console.log("✅ Created: Agustin - Master Admin (agustin@astral.cl)");

    console.log("\n👨‍💼 Creating ADMIN users...");
    await client.action(api.users.createUserAction, {
      email: "admin@astral.cl",
      name: "Administrador de prueba",
      password: demoPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
    });
    console.log("✅ Created: Administrador de prueba (admin@astral.cl)");

    await client.action(api.users.createUserAction, {
      email: "loreto@astral.cl",
      name: "Loreto",
      password: demoPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
    });
    console.log("✅ Created: Loreto (loreto@astral.cl)");

    console.log("\n👨‍🏫 Creating PROFESOR user...");
    await client.action(api.users.createUserAction, {
      email: "profesor@astral.cl",
      name: "Profesor de Prueba",
      password: demoPasswordHash,
      role: "PROFESOR",
      status: "ACTIVE",
    });
    console.log("✅ Created: Profesor de Prueba (profesor@astral.cl)");

    console.log("\n👨‍👩‍👧‍👦 Creating PARENT user...");
    await client.action(api.users.createUserAction, {
      email: "apoderado@astral.cl",
      name: "Apoderado de Prueba",
      password: demoPasswordHash,
      role: "PARENT",
      status: "ACTIVE",
    });
    console.log("✅ Created: Apoderado de Prueba (apoderado@astral.cl)");

    console.log("\n🎉 All demo users created successfully!");
    console.log("\n🔐 Demo Account Credentials:");
    console.log("   MASTER: agustin@astral.cl / master123");
    console.log("   ADMINS: admin@astral.cl / demo123");
    console.log("           loreto@astral.cl / demo123");
    console.log("   PROFESOR: profesor@astral.cl / demo123");
    console.log("   PARENT: apoderado@astral.cl / demo123");

  } catch (error) {
    console.error("❌ Failed to create demo users:", error);
    throw error;
  }
}

createDemoUsers().catch((error) => {
  console.error("Fatal error during demo user creation:", error);
  process.exit(1);
});
