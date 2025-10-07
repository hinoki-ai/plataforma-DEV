#!/usr/bin/env tsx
/**
 * Verify Test Users Script
 * Checks if test users exist in the database
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyUsers() {
  console.log("🔍 Verifying test users in database...");

  const testEmails = [
    "admin@manitospintadas.cl",
    "profesor@manitospintadas.cl",
    "admina@manitospintadas.cl",
    "profesora@manitospintadas.cl",
    "apoderado@manitospintadas.cl",
    "apoderada@manitospintadas.cl",
  ];

  try {
    for (const email of testEmails) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (user) {
        console.log(`✅ ${user.name} (${user.email})`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log("");
      } else {
        console.log(`❌ User not found: ${email}`);
        console.log("");
      }
    }

    // Count total users
    const totalUsers = await prisma.user.count();
    console.log(`📊 Total users in database: ${totalUsers}`);
  } catch (error) {
    console.error("❌ Error verifying users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUsers();
