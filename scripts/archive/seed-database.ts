/**
 * Seed Database Script
 * Creates initial test users and data
 * Run with: npx tsx scripts/seed-database.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

if (!CONVEX_URL) {
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function seedDatabase() {
  try {
    const result = await client.mutation(api.seed.seedDatabase);
  } catch (error: any) {
    if (error.message?.includes("already exists")) {
    } else {
      throw error;
    }
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    process.exit(1);
  });
