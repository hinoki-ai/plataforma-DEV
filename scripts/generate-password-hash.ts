#!/usr/bin/env tsx
/**
 * Generate bcrypt hash for password
 */

import bcryptjs from "bcryptjs";

const password = "59163476a";

async function generateHash() {
  const hash = await bcryptjs.hash(password, 10);
  console.log("\n" + "=".repeat(70));
  console.log("🔐 PASSWORD HASH GENERATED");
  console.log("=".repeat(70));
  console.log(`\nPassword: ${password}`);
  console.log(`\nBcrypt Hash:\n${hash}`);
  console.log("\n" + "=".repeat(70));
  console.log("\n✅ Copy this hash to use in Convex dashboard");
  console.log("=".repeat(70) + "\n");
  
  // Verify it works
  const isValid = await bcryptjs.compare(password, hash);
  console.log(`✅ Verification test: ${isValid ? "PASS" : "FAIL"}\n`);
}

generateHash();
