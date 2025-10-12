/**
 * Setup Master Admin Account
 * Ensures the master admin account exists with correct credentials
 */

import { ConvexHttpClient } from "convex/browser";
import bcryptjs from "bcryptjs";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

if (!CONVEX_URL) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL is not set");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const MASTER_ACCOUNT = {
  email: "agustin@astral.cl",
  password: process.env.MASTER_PASSWORD || "",
  name: "Agustin - Master Admin",
  role: "MASTER" as const,
};

if (!MASTER_ACCOUNT.password) {
  console.error("❌ MASTER_PASSWORD environment variable is not set");
  console.log(
    "Usage: MASTER_PASSWORD='your-password' npx tsx scripts/setup-master-account.ts",
  );
  process.exit(1);
}

async function setupMasterAccount() {
  console.log("🔍 Checking for master account...");

  try {
    // Check if user exists
    const existingUser = await client.query(api.users.getUserByEmail, {
      email: MASTER_ACCOUNT.email,
    });

    if (existingUser) {
      console.log("✅ Master account already exists:");
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log(`   Active: ${existingUser.isActive}`);

      // Update password if needed
      const hashedPassword = await bcryptjs.hash(MASTER_ACCOUNT.password, 10);
      await client.mutation(api.users.updateUser, {
        id: existingUser._id,
        password: hashedPassword,
        role: MASTER_ACCOUNT.role,
        isActive: true,
      });

      console.log("🔄 Password and role updated successfully!");
      return;
    }

    // Create new master account
    console.log("🔨 Creating master account...");
    const hashedPassword = await bcryptjs.hash(MASTER_ACCOUNT.password, 10);

    const userId = await client.mutation(api.users.createUser, {
      email: MASTER_ACCOUNT.email,
      password: hashedPassword,
      name: MASTER_ACCOUNT.name,
      role: MASTER_ACCOUNT.role,
    });

    console.log("✅ Master account created successfully!");
    console.log(`   User ID: ${userId}`);
    console.log(`   Email: ${MASTER_ACCOUNT.email}`);
    console.log(`   Name: ${MASTER_ACCOUNT.name}`);
    console.log(`   Role: ${MASTER_ACCOUNT.role}`);
  } catch (error) {
    console.error("❌ Error setting up master account:", error);
    throw error;
  }
}

setupMasterAccount()
  .then(() => {
    console.log("\n✨ Master account setup complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Setup failed:", error);
    process.exit(1);
  });
