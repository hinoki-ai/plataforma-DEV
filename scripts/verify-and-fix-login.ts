#!/usr/bin/env tsx
/**
 * Verify and Fix Login Script
 * Checks if agustin@astral.cl can log in and fixes password if needed
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

const TEST_CREDENTIALS = {
  email: "agustin@astral.cl",
  password: "master123",
};

async function verifyAndFixLogin() {
  console.log("🔍 Checking login for agustin@astral.cl...\n");

  try {
    // 1. Get the user from database
    console.log("📋 Step 1: Fetching user from database...");
    const user = await client.query(api.users.getUserByEmail, {
      email: TEST_CREDENTIALS.email,
    });

    if (!user) {
      console.error("❌ User not found!");
      console.log("\n💡 Creating user with demo password...");
      
      const hashedPassword = await bcryptjs.hash(TEST_CREDENTIALS.password, 10);
      await client.mutation(api.users.createUser, {
        email: TEST_CREDENTIALS.email,
        password: hashedPassword,
        name: "Agustin - Master Admin",
        role: "MASTER",
      });
      
      console.log("✅ User created successfully!");
      console.log(`📧 Email: ${TEST_CREDENTIALS.email}`);
      console.log(`🔑 Password: ${TEST_CREDENTIALS.password}`);
      return;
    }

    console.log("✅ User found:");
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);

    // 2. Test password verification
    console.log("\n🔐 Step 2: Testing password verification...");
    
    if (!user.password) {
      console.error("❌ User has no password set!");
      console.log("🔄 Setting password...");
      
      const hashedPassword = await bcryptjs.hash(TEST_CREDENTIALS.password, 10);
      await client.mutation(api.users.updateUser, {
        id: user._id,
        password: hashedPassword,
      });
      
      console.log("✅ Password set successfully!");
      console.log(`🔑 Password: ${TEST_CREDENTIALS.password}`);
      return;
    }

    // Check if password is bcrypt format
    const isBcryptHash = /^\$2[abyxz]\$/.test(user.password);
    console.log(`   Hash format: ${isBcryptHash ? "bcrypt" : "PBKDF2/other"}`);
    console.log(`   Hash preview: ${user.password.substring(0, 20)}...`);

    // Try to verify with bcryptjs
    try {
      const isValid = await bcryptjs.compare(TEST_CREDENTIALS.password, user.password);
      
      if (isValid) {
        console.log("\n✅ Password verification SUCCESSFUL!");
        console.log(`📧 Email: ${TEST_CREDENTIALS.email}`);
        console.log(`🔑 Password: ${TEST_CREDENTIALS.password}`);
        console.log("\n🎉 Login should work correctly!");
        return;
      } else {
        console.log("\n❌ Password verification FAILED!");
        console.log("🔄 Resetting password with correct hash...");
        
        const hashedPassword = await bcryptjs.hash(TEST_CREDENTIALS.password, 10);
        await client.mutation(api.users.updateUser, {
          id: user._id,
          password: hashedPassword,
        });
        
        console.log("✅ Password reset successfully!");
        console.log(`📧 Email: ${TEST_CREDENTIALS.email}`);
        console.log(`🔑 Password: ${TEST_CREDENTIALS.password}`);
        console.log("\n🎉 Login should now work!");
      }
    } catch (error) {
      console.error("❌ Error during password verification:", error);
      console.log("🔄 Resetting password...");
      
      const hashedPassword = await bcryptjs.hash(TEST_CREDENTIALS.password, 10);
      await client.mutation(api.users.updateUser, {
        id: user._id,
        password: hashedPassword,
      });
      
      console.log("✅ Password reset successfully!");
      console.log(`📧 Email: ${TEST_CREDENTIALS.email}`);
      console.log(`🔑 Password: ${TEST_CREDENTIALS.password}`);
    }

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

verifyAndFixLogin()
  .then(() => {
    console.log("\n✨ Verification complete!");
    console.log("\n📝 Login credentials:");
    console.log(`   Email: ${TEST_CREDENTIALS.email}`);
    console.log(`   Password: ${TEST_CREDENTIALS.password}`);
    console.log("\n🌐 Test at: http://localhost:3000/login");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Verification failed:", error);
    process.exit(1);
  });
