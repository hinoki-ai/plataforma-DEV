#!/usr/bin/env tsx
/**
 * Seed Production Convex Database
 * Creates all 5 users in PRODUCTION with correct bcrypt hashes
 */

import { ConvexHttpClient } from "convex/browser";
import bcryptjs from "bcryptjs";
import { api } from "../convex/_generated/api";

// PRODUCTION Convex URL
const PRODUCTION_CONVEX_URL = "https://industrious-manatee-7.convex.cloud";

const client = new ConvexHttpClient(PRODUCTION_CONVEX_URL);

interface UserToCreate {
  email: string;
  name: string;
  password: string;
  role: "MASTER" | "ADMIN" | "PROFESOR" | "PARENT";
}

const USERS: UserToCreate[] = [
  {
    email: "agustin@astral.cl",
    name: "Agustin - Master Admin",
    password: "59163476a",
    role: "MASTER",
  },
  {
    email: "admin@astral.cl",
    name: "Administrador de prueba",
    password: "demo123",
    role: "ADMIN",
  },
  {
    email: "loreto@astral.cl",
    name: "Loreto",
    password: "demo123",
    role: "ADMIN",
  },
  {
    email: "profesor@astral.cl",
    name: "Profesor de Prueba",
    password: "demo123",
    role: "PROFESOR",
  },
  {
    email: "apoderado@astral.cl",
    name: "Apoderado de Prueba",
    password: "demo123",
    role: "PARENT",
  },
];

async function seedProduction() {
  console.log("🚀 SEEDING PRODUCTION DATABASE");
  console.log(`📍 Convex: ${PRODUCTION_CONVEX_URL}`);
  console.log(`👥 Creating ${USERS.length} users...\n`);

  const results = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  for (const userData of USERS) {
    try {
      console.log(`\n👤 Processing: ${userData.email} (${userData.role})`);

      // Check if user exists
      const existingUser = await client.query(api.users.getUserByEmail, {
        email: userData.email,
      });

      // Hash password with bcrypt
      const hashedPassword = await bcryptjs.hash(userData.password, 10);

      if (existingUser) {
        console.log(`   ⚠️  User exists, updating password...`);
        await client.mutation(api.users.updateUser, {
          id: existingUser._id,
          password: hashedPassword,
          name: userData.name,
        });
        console.log(`   ✅ Updated: ${userData.email}`);
        results.updated++;
      } else {
        console.log(`   🆕 Creating new user...`);
        await client.mutation(api.users.createUser, {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
          isOAuthUser: false,
        });
        console.log(`   ✅ Created: ${userData.email}`);
        results.created++;
      }

      // Verify password
      const isValid = await bcryptjs.compare(userData.password, hashedPassword);
      console.log(
        `   🔐 Password verification: ${isValid ? "✅ PASS" : "❌ FAIL"}`,
      );
    } catch (error: any) {
      console.error(`   ❌ Error with ${userData.email}:`, error.message);
      results.errors++;
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("📊 SEEDING RESULTS:");
  console.log("=".repeat(70));
  console.log(`✅ Created: ${results.created}`);
  console.log(`🔄 Updated: ${results.updated}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`❌ Errors: ${results.errors}`);
  console.log("=".repeat(70));

  console.log("\n🔐 PRODUCTION LOGIN CREDENTIALS:");
  console.log("=".repeat(70));
  USERS.forEach((user) => {
    const roleEmoji = {
      MASTER: "👑",
      ADMIN: "👨‍💼",
      PROFESOR: "👨‍🏫",
      PARENT: "👨‍👩‍👧‍👦",
    }[user.role];
    console.log(
      `${roleEmoji} ${user.role.padEnd(8)} ${user.email.padEnd(25)} / ${user.password}`,
    );
  });
  console.log("=".repeat(70));
  console.log("\n🌐 Login at: https://plataforma.aramac.dev/login\n");
}

seedProduction()
  .then(() => {
    console.log("✨ Production seeding completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Production seeding failed:", error);
    process.exit(1);
  });
