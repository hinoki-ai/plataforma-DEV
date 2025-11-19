/**
 * Verify Master Account Login
 * Tests that the master account credentials are valid
 */

import bcryptjs from "bcryptjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

if (!CONVEX_URL) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL is not set");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const MASTER_CREDENTIALS = {
  email: "agustin@astral.cl",
  password: process.env.MASTER_PASSWORD || "",
};

if (!MASTER_CREDENTIALS.password) {
  console.error("❌ MASTER_PASSWORD environment variable is not set");
  console.log(
    "Usage: MASTER_PASSWORD='your-password' npx tsx scripts/verify-master-login.ts",
  );
  process.exit(1);
}

async function verifyLogin() {
  console.log("🔐 Verifying master account login...\n");

  try {
    // Get user by email
    const user = await client.query(api.users.getUserByEmail, {
      email: MASTER_CREDENTIALS.email,
    });

    if (!user) {
      console.error("❌ User not found!");
      return false;
    }

    console.log("✅ User found:");
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   ID: ${user._id}`);

    // Verify password
    if (!user.password) {
      console.error("\n❌ User has no password set!");
      return false;
    }

    const isValidPassword = await bcryptjs.compare(
      MASTER_CREDENTIALS.password,
      user.password,
    );

    if (!isValidPassword) {
      console.error("\n❌ Password is incorrect!");
      return false;
    }

    console.log("\n✅ Password is correct!");
    console.log("\n🎉 Login verification successful!");
    return true;
  } catch (error) {
    console.error("❌ Error verifying login:", error);
    return false;
  }
}

verifyLogin()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch(() => {
    process.exit(1);
  });
