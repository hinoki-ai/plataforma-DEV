#!/usr/bin/env tsx
/**
 * Fix Agustin's Password
 * Reset password for agustin@astral.cl to 59163476a
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

const CREDENTIALS = {
  email: "agustin@astral.cl",
  password: "59163476a",
};

async function fixPassword() {
  console.log("🔍 Checking user agustin@astral.cl...\n");

  try {
    // Get the user
    const user = await client.query(api.users.getUserByEmail, {
      email: CREDENTIALS.email,
    });

    if (!user) {
      console.error("❌ User not found!");
      console.log("💡 Creating user...");

      const hashedPassword = await bcryptjs.hash(CREDENTIALS.password, 10);
      const userId = await client.mutation(api.users.createUser, {
        email: CREDENTIALS.email,
        password: hashedPassword,
        name: "Agustin - Master Admin",
        role: "MASTER",
        isActive: true,
      });

      console.log("✅ User created successfully!");
      console.log(`📧 Email: ${CREDENTIALS.email}`);
      console.log(`🔑 Password: ${CREDENTIALS.password}`);
      console.log(`🎯 Role: MASTER`);
      return;
    }

    console.log("✅ User found:");
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);

    // Reset password with bcrypt
    console.log("\n🔄 Resetting password...");
    const hashedPassword = await bcryptjs.hash(CREDENTIALS.password, 10);

    await client.mutation(api.users.updateUser, {
      id: user._id,
      password: hashedPassword,
      isActive: true, // Ensure account is active
    });

    console.log("✅ Password reset successfully!");
    console.log(`📧 Email: ${CREDENTIALS.email}`);
    console.log(`🔑 Password: ${CREDENTIALS.password}`);
    console.log(`🎯 Role: ${user.role}`);

    // Verify the password works
    console.log("\n🧪 Testing password...");
    const isValid = await bcryptjs.compare(
      CREDENTIALS.password,
      hashedPassword,
    );
    console.log(`   Password verification: ${isValid ? "✅ PASS" : "❌ FAIL"}`);
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

fixPassword()
  .then(() => {
    console.log("\n✨ Password fixed successfully!");
    console.log("\n📝 Your login credentials:");
    console.log(`   Email: ${CREDENTIALS.email}`);
    console.log(`   Password: ${CREDENTIALS.password}`);
    console.log("\n🌐 Try logging in at: http://localhost:3000/login");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fix failed:", error);
    process.exit(1);
  });
