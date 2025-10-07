#!/usr/bin/env tsx
/**
 * Admin User Creation Script
 * Creates admin and teacher users for production deployment
 * Supports environment variables for flexibility
 */

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/crypto";

const prisma = new PrismaClient();

// Environment-aware configuration
const getCredentials = () => {
  const adminEmail =
    process.env.DEFAULT_ADMIN_EMAIL || "admin@manitospintadas.cl";
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";
  const teacherEmail =
    process.env.DEFAULT_TEACHER_EMAIL || "profesor@manitospintadas.cl";
  const teacherPassword = process.env.DEFAULT_TEACHER_PASSWORD || "profesor123";

  return {
    admin: { email: adminEmail, password: adminPassword },
    teacher: { email: teacherEmail, password: teacherPassword },
  };
};

async function createAdminUser() {
  console.log("🔑 Creating production test credentials...");
  console.log("🌍 Environment:", process.env.NODE_ENV || "development");
  const dbType =
    process.env.DATABASE_URL?.startsWith("postgresql://") ||
    process.env.DATABASE_URL?.startsWith("postgres://")
      ? "PostgreSQL"
      : "PostgreSQL";
  console.log("�� Database:", dbType);

  try {
    const credentials = getCredentials();

    // Hash passwords securely
    const adminPassword = await hashPassword(credentials.admin.password);
    const profesorPassword = await hashPassword(credentials.teacher.password);

    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: credentials.admin.email },
      update: {
        password: adminPassword,
        isActive: true,
        name: "Administrador Manitos Pintadas",
      },
      create: {
        email: credentials.admin.email,
        name: "Administrador Manitos Pintadas",
        password: adminPassword,
        role: "ADMIN",
        isActive: true,
      },
    });

    // Create profesor user
    const profesor = await prisma.user.upsert({
      where: { email: credentials.teacher.email },
      update: {
        password: profesorPassword,
        isActive: true,
        name: "María González - Profesora",
      },
      create: {
        email: credentials.teacher.email,
        name: "María González - Profesora",
        password: profesorPassword,
        role: "PROFESOR",
        isActive: true,
      },
    });

    console.log("✅ Test credentials created/updated:");
    console.log(
      `📧 Admin: ${credentials.admin.email} / ${credentials.admin.password}`,
    );
    console.log(
      `📧 Teacher: ${credentials.teacher.email} / ${credentials.teacher.password}`,
    );
    console.log("🔒 Passwords are securely hashed in database");

    return { admin, profesor };
  } catch (error) {
    console.error("❌ Failed to create admin user:", error);

    // Provide helpful debugging information
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

createAdminUser()
  .catch((error) => {
    console.error("Fatal error during admin creation:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
