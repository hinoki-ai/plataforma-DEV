#!/usr/bin/env tsx
/**
 * Verify Test Users Script
 * Checks if test users exist in the Convex database
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

async function verifyUsers() {
  const testEmails = [
    "admin@plataforma-astral.com",
    "profesor@plataforma-astral.com",
    "admina@plataforma-astral.com",
    "profesora@plataforma-astral.com",
    "apoderado@plataforma-astral.com",
    "apoderada@plataforma-astral.com",
  ];

  try {
    const deploymentUrl = process.env.CONVEX_URL;
    if (!deploymentUrl) {
      throw new Error("CONVEX_URL environment variable is not set");
    }

    const client = new ConvexHttpClient(deploymentUrl);

    for (const email of testEmails) {
      const user = await client.query(api.users.getUserByEmail, { email });

      if (user) {
      } else {
      }
    }

    // Count total users
    const userCounts = await client.query(api.users.getUserCountByRole);
  } catch (error) {}
}

verifyUsers();
