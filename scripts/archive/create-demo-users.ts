#!/usr/bin/env tsx
/**
 * Create Demo Users Script
 * Creates the specific demo users requested
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { hashPassword } from "../src/lib/crypto";

async function createDemoUsers() {
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

    await client.action(api.users.createUserAction, {
      email: "agustin@astral.cl",
      name: "Agustin - Master Admin",
      password: masterPasswordHash,
      role: "MASTER",
      status: "ACTIVE",
    });

    await client.action(api.users.createUserAction, {
      email: "admin@astral.cl",
      name: "Administrador de prueba",
      password: demoPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
    });

    await client.action(api.users.createUserAction, {
      email: "loreto@astral.cl",
      name: "Loreto",
      password: demoPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
    });

    await client.action(api.users.createUserAction, {
      email: "profesor@astral.cl",
      name: "Profesor de Prueba",
      password: demoPasswordHash,
      role: "PROFESOR",
      status: "ACTIVE",
    });

    await client.action(api.users.createUserAction, {
      email: "apoderado@astral.cl",
      name: "Apoderado de Prueba",
      password: demoPasswordHash,
      role: "PARENT",
      status: "ACTIVE",
    });
  } catch (error) {
    throw error;
  }
}

createDemoUsers().catch((error) => {
  process.exit(1);
});
