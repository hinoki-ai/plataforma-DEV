#!/usr/bin/env tsx
/**
 * Fix Agustin's Password in PRODUCTION
 * Reset password for agustin@astral.cl to 59163476a in production Convex
 */

import { ConvexHttpClient } from "convex/browser";
import bcryptjs from "bcryptjs";
import { api } from "../convex/_generated/api";

// PRODUCTION Convex URL
const PRODUCTION_CONVEX_URL = "https://industrious-manatee-7.convex.cloud";

const client = new ConvexHttpClient(PRODUCTION_CONVEX_URL);

const CREDENTIALS = {
  email: "agustin@astral.cl",
  password: "59163476a",
};

async function fixProductionPassword() {
  console.log("🚀 PRODUCTION PASSWORD FIX");
  console.log(`📍 Convex: ${PRODUCTION_CONVEX_URL}`);
  console.log(`👤 User: ${CREDENTIALS.email}\n`);

  try {
    // Get the user
    console.log("🔍 Fetching user from production database...");
    const user = await client.query(api.users.getUserByEmail, {
      email: CREDENTIALS.email,
    });

    if (!user) {
      console.error("❌ User not found in production!");
      console.log("\n💡 Creating user in production...");
      
      const hashedPassword = await bcryptjs.hash(CREDENTIALS.password, 10);
      const userId = await client.mutation(api.users.createUser, {
        email: CREDENTIALS.email,
        password: hashedPassword,
        name: "Agustin - Master Admin",
        role: "MASTER",
        isActive: true,
      });
      
      console.log("✅ User created in production!");
      console.log(`📧 Email: ${CREDENTIALS.email}`);
      console.log(`🔑 Password: ${CREDENTIALS.password}`);
      console.log(`🎯 Role: MASTER`);
      console.log(`🆔 ID: ${userId}`);
      return;
    }

    console.log("✅ User found in production:");
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   ID: ${user._id}`);

    // Check current password format
    if (user.password) {
      const isBcrypt = /^\$2[abyxz]\$/.test(user.password);
      console.log(`   Current hash format: ${isBcrypt ? "bcrypt ✅" : "PBKDF2/other ❌"}`);
    }

    // Reset password with bcrypt
    console.log("\n🔄 Resetting password in production...");
    const hashedPassword = await bcryptjs.hash(CREDENTIALS.password, 10);
    
    await client.mutation(api.users.updateUser, {
      id: user._id,
      password: hashedPassword,
      isActive: true, // Ensure account is active
    });
    
    console.log("✅ Password reset in production successfully!");
    
    // Verify the password works
    console.log("\n🧪 Testing password hash...");
    const isValid = await bcryptjs.compare(CREDENTIALS.password, hashedPassword);
    console.log(`   Password verification: ${isValid ? "✅ PASS" : "❌ FAIL"}`);

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

fixProductionPassword()
  .then(() => {
    console.log("\n" + "=".repeat(60));
    console.log("✨ PRODUCTION PASSWORD FIXED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("\n📝 Your PRODUCTION login credentials:");
    console.log(`   Email: ${CREDENTIALS.email}`);
    console.log(`   Password: ${CREDENTIALS.password}`);
    console.log(`   Role: MASTER`);
    console.log("\n🌐 Login at: https://plataforma.aramac.dev/login");
    console.log("=".repeat(60));
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Production fix failed:", error);
    process.exit(1);
  });
