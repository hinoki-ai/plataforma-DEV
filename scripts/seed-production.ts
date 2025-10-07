#!/usr/bin/env tsx

/**
 * Production Database Seeding Script
 * Seeds PostgreSQL database with essential data for Manitos Pintadas
 * Includes Andreina Giovanna Salazar Nuñez as primary admin user
 */

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/crypto";

const prisma = new PrismaClient();

async function seedProduction() {
  console.log("🌱 Starting production database seeding...");

  try {
    // 1. Create Andreina as primary admin user
    console.log("👤 Creating primary admin user (Andreina)...");
    const andreinaPassword = await hashPassword("lilo1308");

    await prisma.user.upsert({
      where: { email: "inacorgan@gmail.com" },
      update: {},
      create: {
        email: "inacorgan@gmail.com",
        name: "Andreina Giovanna Salazar Nuñez",
        password: andreinaPassword,
        role: "ADMIN",
        isActive: true,
        phone: "+56912345678",
      },
    });
    console.log("✅ Primary admin user (Andreina) created");

    // 2. Create backup admin user
    console.log("👤 Creating backup admin user...");
    const adminPassword = await hashPassword("admin123");

    await prisma.user.upsert({
      where: { email: "admin@manitospintadas.cl" },
      update: {},
      create: {
        email: "admin@manitospintadas.cl",
        name: "Administrador Backup",
        password: adminPassword,
        role: "ADMIN",
        isActive: true,
        phone: "+56912345679",
      },
    });
    console.log("✅ Backup admin user created");

    // 3. Create teacher user
    console.log("👨‍🏫 Creating teacher user...");
    const teacherPassword = await hashPassword("profesor123");

    await prisma.user.upsert({
      where: { email: "profesor@manitospintadas.cl" },
      update: {},
      create: {
        email: "profesor@manitospintadas.cl",
        name: "Profesor Demo",
        password: teacherPassword,
        role: "PROFESOR",
        isActive: true,
        phone: "+56987654321",
      },
    });
    console.log("✅ Teacher user created");

    // 4. Create school information
    console.log("🏫 Creating school information...");
    await prisma.schoolInfo.upsert({
      where: { id: "school-info" },
      update: {},
      create: {
        id: "school-info",
        name: "Escuela Manitos Pintadas",
        mission:
          "Formar niños y niñas integrales a través del arte y la creatividad",
        vision: "Ser la escuela líder en educación artística en Chile",
        address: "Santiago, Chile",
        phone: "+56224567890",
        email: "contacto@manitospintadas.cl",
        website: "https://manitospintadas.cl",
        logoUrl: "/manitos-favicon.png",
      },
    });
    console.log("✅ School information created");

    // 5. Create team members
    console.log("👥 Creating team members...");
    const teamMembers = [
      {
        name: "María González",
        title: "Directora",
        description:
          "Directora con 15 años de experiencia en educación inicial",
        specialties: ["Liderazgo Educativo", "Gestión Escolar"],
        order: 1,
      },
      {
        name: "Carlos Rodríguez",
        title: "Profesor de Arte",
        description: "Especialista en artes plásticas y creatividad infantil",
        specialties: ["Artes Plásticas", "Creatividad"],
        order: 2,
      },
    ];

    for (const member of teamMembers) {
      const existing = await prisma.teamMember.findFirst({
        where: {
          name: member.name,
          title: member.title,
        },
      });

      if (!existing) {
        await prisma.teamMember.create({
          data: member,
        });
      }
    }
    console.log("✅ Team members created");

    // 5. Verify seeding
    const userCount = await prisma.user.count();
    const schoolInfoCount = await prisma.schoolInfo.count();
    const teamMemberCount = await prisma.teamMember.count();

    console.log("\n📊 Seeding Summary:");
    console.log(`   Users: ${userCount}`);
    console.log(`   School Info: ${schoolInfoCount}`);
    console.log(`   Team Members: ${teamMemberCount}`);

    console.log("\n🎉 Production seeding completed successfully!");
    console.log("\n🔑 Login Credentials:");
    console.log("   Primary Admin (Andreina): inacorgan@gmail.com / lilo1308");
    console.log("   Backup Admin: admin@manitospintadas.cl / admin123");
    console.log("   Teacher: profesor@manitospintadas.cl / profesor123");
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding
seedProduction();
