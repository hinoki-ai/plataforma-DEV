#!/usr/bin/env tsx
/**
 * User Creation Script
 * Environment-aware user creation for Manitos Pintadas School Management System
 *
 * Production (manitospintadas.cl): Creates only real users (Agustin + Adrina)
 * Development (school.aramac.dev): Creates real users + 3 tourist test accounts
 *
 * Environment detection via APP_ENV variable:
 * - prod/main: Production mode (real users only)
 * - dev: Development mode (real users + tourists)
 */

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/crypto";

// Create a new Prisma client instance to avoid prepared statement conflicts
const prisma = new PrismaClient({
  log: ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Real users (always created)
const realUsers = [
  // Master Developer (Full Access)
  {
    email: "agustinaramac@gmail.com",
    password: "madmin123",
    name: "Agustin Arancibia Mac-Guire",
    role: "MASTER" as const,
    gender: "male",
  },

  // Real Admin User (Adrina)
  {
    email: "inacorgan@gmail.com",
    password: "lilo1308",
    name: "Andreina Giovanna Salazar Nuñez",
    role: "ADMIN" as const,
    gender: "female",
  },
];

// Tourist test users (only created in development)
const touristUsers = [
  {
    email: "tourist.admin@manitospintadas.com",
    password: "tourist123",
    name: "Tourist Administrator",
    role: "ADMIN" as const,
    gender: "male",
  },
  {
    email: "tourist.teacher@manitospintadas.com",
    password: "tourist123",
    name: "Tourist Teacher",
    role: "PROFESOR" as const,
    gender: "female",
  },
  {
    email: "tourist.parent@manitospintadas.com",
    password: "tourist123",
    name: "Tourist Parent",
    role: "PARENT" as const,
    gender: "male",
  },
];

// Determine which users to create based on environment
function getUsersForEnvironment(): Array<{
  email: string;
  password: string;
  name: string;
  role: "MASTER" | "ADMIN" | "PROFESOR" | "PARENT";
  gender: string;
}> {
  const appEnv = process.env.APP_ENV || process.env.NODE_ENV || "development";
  const isProduction = ["prod", "main", "production"].includes(
    appEnv.toLowerCase(),
  );

  if (isProduction) {
    console.log(
      "🏭 Production environment detected - creating only real users",
    );
    return realUsers;
  } else {
    console.log(
      "🧪 Development environment detected - creating real users + tourist accounts",
    );
    return [...realUsers, ...touristUsers];
  }
}

async function createAllTestUsers() {
  console.log("👥 Creating environment-specific users...");
  console.log(
    "🌍 Environment:",
    process.env.APP_ENV || process.env.NODE_ENV || "development",
  );

  try {
    const usersToCreate = getUsersForEnvironment();
    const createdUsers: Array<{
      id: string;
      email: string;
      password: string;
      name: string;
      role: string;
      gender: string;
    }> = [];

    // First, update the developer to MASTER role
    console.log("\n🔧 Updating developer to MASTER role...");
    const masterUser = await prisma.user.updateMany({
      where: { email: "agustinaramac@gmail.com" },
      data: { role: "MASTER" },
    });
    console.log(`✅ Updated ${masterUser.count} user(s) to MASTER role`);

    // Wait a moment to avoid connection issues
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Then create/update the other users based on environment
    for (const userData of usersToCreate.slice(1)) {
      // Skip the first user (developer)
      console.log(
        `\n🔧 Creating ${userData.role} (${userData.gender}): ${userData.name}`,
      );

      const hashedPassword = await hashPassword(userData.password);

      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          password: hashedPassword,
          isActive: true,
          name: userData.name,
          role: userData.role,
        },
        create: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          role: userData.role,
          isActive: true,
        },
      });

      createdUsers.push({ ...userData, id: user.id });
      console.log(`✅ Created: ${userData.name} (${userData.email})`);
    }

    console.log("\n📊 Users Summary:");
    console.log("=".repeat(50));

    const byRole = createdUsers.reduce(
      (acc, user) => {
        if (!acc[user.role]) acc[user.role] = [];
        acc[user.role].push(user);
        return acc;
      },
      {} as Record<string, Array<(typeof createdUsers)[0]>>,
    );

    // Add the MASTER user to the summary
    byRole["MASTER"] = [
      {
        id: "master-user-summary",
        name: "Agustin Arancibia Mac-Guire",
        email: "agustinaramac@gmail.com",
        password: "madmin123",
        gender: "male",
        role: "MASTER" as const,
      },
    ];

    Object.entries(byRole).forEach(([role, users]) => {
      console.log(`\n${role}:`);
      users.forEach((user) => {
        console.log(`  👤 ${user.name}`);
        console.log(`     📧 ${user.email}`);
        console.log(`     🔑 ${user.password}`);
        console.log(`     ⚧ ${user.gender}`);
      });
    });

    const totalUsers = Object.values(byRole).flat().length;
    const appEnv = process.env.APP_ENV || process.env.NODE_ENV || "development";
    const isProduction = ["prod", "main", "production"].includes(
      appEnv.toLowerCase(),
    );

    console.log(`\n🎯 Total Registered Users: ${totalUsers}`);
    console.log("👑 MASTER role created for developer (full access)");
    console.log(
      "👩‍💼 Real ADMIN user created for Andreina Giovanna Salazar Nuñez (Adrina)",
    );

    if (isProduction) {
      console.log("🏭 Production environment: Only real users created");
    } else {
      console.log(
        "🧪 Development environment: 3 Tourist test accounts created for navigation testing",
      );
    }

    console.log("🔒 All passwords are securely hashed in database");

    return createdUsers;
  } catch (error) {
    console.error("❌ Failed to create test users:", error);

    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        console.error(
          "🔍 Database connection refused. Check DATABASE_URL environment variable.",
        );
      } else if (error.message.includes("schema")) {
        console.error(
          "🔍 Database schema issue. Run: npm run db:generate && npm run db:push",
        );
      }
    }

    throw error;
  }
}

createAllTestUsers()
  .catch((error) => {
    console.error("Fatal error during user creation:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
