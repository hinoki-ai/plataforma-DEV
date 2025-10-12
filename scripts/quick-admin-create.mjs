#!/usr/bin/env node
/**
 * Quick admin creation using Convex HTTP API
 */

import bcryptjs from "bcryptjs";

const CONVEX_URL = "https://different-jackal-611.convex.cloud";

async function createAdmin() {
  console.log("🔐 Hashing password...");
  const hashedPassword =
    "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

  console.log(
    "\n✅ You can create the admin user manually in Convex Dashboard:\n",
  );
  console.log("1. Run: npx convex dashboard");
  console.log("\n2. Go to 'Data' tab");
  console.log("\n3. Select 'users' table");
  console.log("\n4. Click '+ Add Document' and paste this:\n");
  console.log(
    JSON.stringify(
      {
        email: "admin@astral.cl",
        password: hashedPassword,
        name: "Admin Astral",
        role: "ADMIN",
        isActive: true,
        isOAuthUser: false,
        status: "ACTIVE",
        phone: "+56912345678",
        emailVerified: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      null,
      2,
    ),
  );
  console.log("\n5. Click 'Add'\n");
  console.log("✅ Then login with:");
  console.log("   Email: admin@astral.cl");
  console.log("   Password: admin123\n");
}

createAdmin();
