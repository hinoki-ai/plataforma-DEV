#!/usr/bin/env node
/**
 * Create admin user in Convex
 */

import { ConvexHttpClient } from "convex/browser";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const deploymentUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!deploymentUrl) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL not found in environment");
  process.exit(1);
}

async function createAdmin() {
  const client = new ConvexHttpClient(deploymentUrl);

  console.log("🔍 Creating admin user...\n");

  const email = "admin@astra.cl";
  const password = "admin123";
  const name = "Admin Astra";

  try {
    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);
    console.log("🔐 Password hashed");

    // First check if user exists
    console.log(`📧 Checking if ${email} exists...`);

    // Create the user using internal function (we'll use fetch to call Convex directly)
    const createUserUrl = `${deploymentUrl}/api/mutation`;

    const response = await fetch(createUserUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: "users:createUser",
        args: {
          email: email,
          password: hashedPassword,
          name: name,
          role: "ADMIN",
          isOAuthUser: false,
        },
        format: "json",
      }),
    });

    const result = await response.json();

    if (response.ok && result.status === "success") {
      console.log("✅ Admin user created successfully!");
      console.log(`\n🔑 Login Credentials:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Role: ADMIN`);
    } else {
      console.error("❌ Error creating user:", result);
      if (result.errorMessage?.includes("already exists")) {
        console.log(
          "\n⚠️  User already exists. Try logging in with these credentials:",
        );
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createAdmin();
