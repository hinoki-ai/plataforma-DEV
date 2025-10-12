#!/usr/bin/env node
/**
 * Generate bcrypt hash for admin password and show Convex dashboard instructions
 */

import bcryptjs from "bcryptjs";

const email = "admin@astra.cl";
const password = "admin123";
const name = "Admin Astra";

async function generateHash() {
  console.log("🔐 Generating password hash...\n");

  const hashedPassword = await bcryptjs.hash(password, 10);

  console.log("✅ Hash generated successfully!\n");
  console.log("📋 Follow these steps to create the admin user:\n");
  console.log("1. Open Convex Dashboard:");
  console.log("   npx convex dashboard\n");
  console.log("2. Go to the 'Functions' tab\n");
  console.log("3. Find 'createAdmin:createAdminUser' function\n");
  console.log("4. Click 'Run' and paste these args:\n");
  console.log("```json");
  console.log(
    JSON.stringify(
      {
        email: email,
        password: hashedPassword,
        name: name,
      },
      null,
      2,
    ),
  );
  console.log("```\n");
  console.log("5. Click 'Run function'\n");
  console.log("✅ Then you can login with:");
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}\n`);
}

generateHash();
