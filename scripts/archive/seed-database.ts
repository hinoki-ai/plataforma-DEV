/**
 * Seed Database Script
 * Creates initial test users and data
 * Run with: npx tsx scripts/seed-database.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

if (!CONVEX_URL) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL not found in environment");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function seedDatabase() {
  console.log("🌱 Seeding database...\n");

  try {
    const result = await client.mutation(api.seed.seedDatabase);
    console.log("✅ Database seeded successfully!");
    console.log("\nCreated users:");
    console.log(`  - Master: ${result.users.master}`);
    console.log(`  - Admin: ${result.users.admin}`);
    console.log(`  - Profesor: ${result.users.profesor}`);
    console.log(`  - Parent: ${result.users.parent}`);
    console.log(`\nCreated student: ${result.student}`);
    console.log("\n📝 Test credentials:");
    console.log("  - master@plataforma-astral.com / master123");
    console.log("  - admin@plataforma-astral.com / admin123");
    console.log("  - profesor@plataforma-astral.com / profesor123");
    console.log("  - parent@plataforma-astral.com / parent123");
  } catch (error: any) {
    if (error.message?.includes("already exists")) {
      console.log("⚠️  Users already exist. Skipping seed.");
      console.log(
        "\n💡 To reseed, first clear the database from Convex dashboard.",
      );
    } else {
      console.error("❌ Error seeding database:", error);
      throw error;
    }
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
