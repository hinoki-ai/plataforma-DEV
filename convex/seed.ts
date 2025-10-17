/**
 * Convex Seed Script
 * Creates initial test users and data for development
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedDatabase = mutation({
  args: {
    skipIfUsersExist: v.optional(v.boolean()),
  },
  handler: async (ctx, { skipIfUsersExist = true }) => {
    // PRODUCTION SAFETY: Check if users already exist
    if (skipIfUsersExist) {
      const existingUsers = await ctx.db.query("users").first();
      if (existingUsers) {
        throw new Error(
          "⚠️ PRODUCTION SAFETY: Users already exist in database. " +
            "This seed script is for NEW databases only. " +
            "To force seed (will create duplicate users), pass skipIfUsersExist: false",
        );
      }
    }

    const now = Date.now();

    // Password: master123, admin123, profesor123, parent123
    // Pre-hashed with bcrypt (10 rounds) - CORRECTED HASHES
    const hashedMasterPassword =
      "$2b$10$.CMNqsxLIY3X9LAunrPvaOG1GIGmvwNi70Ksth1hHOlMrqQyp9UOy";
    const hashedAdminPassword =
      "$2b$10$07JuDiQUuQj9AQYD7k7KSeNbPVSx0n6cA8N17biZ95Qroq3owdtRm";
    const hashedProfesorPassword =
      "$2b$10$cd7.dEqS/9KNbYaG7DSgmeKUXOBvKN4qNzNXHK1TGdYaRf26xqtAu";
    const hashedParentPassword =
      "$2b$10$F1C0aQWCrE59er8wB0p94OThHCBMPrpxRA3esWSW0UuPS/Aa0FLZS";

    // Create Master User (Supreme Access)
    const masterId = await ctx.db.insert("users", {
      name: "Master Administrator",
      email: "master@plataforma-astral.com",
      password: hashedMasterPassword,
      role: "MASTER",
      isActive: true,
      isOAuthUser: false,
      status: "ACTIVE",
      phone: "+56900000000",
      emailVerified: now,
      createdAt: now,
      updatedAt: now,
    });

    // Create Admin User
    const adminId = await ctx.db.insert("users", {
      name: "Administrador Principal",
      email: "admin@plataforma-astral.com",
      password: hashedAdminPassword,
      role: "ADMIN",
      isActive: true,
      isOAuthUser: false,
      status: "ACTIVE",
      phone: "+56912345678",
      emailVerified: now,
      createdAt: now,
      updatedAt: now,
    });

    // Create Profesor User
    const profesorId = await ctx.db.insert("users", {
      name: "Profesor de Prueba",
      email: "profesor@plataforma-astral.com",
      password: hashedProfesorPassword,
      role: "PROFESOR",
      isActive: true,
      isOAuthUser: false,
      status: "ACTIVE",
      phone: "+56987654321",
      emailVerified: now,
      createdAt: now,
      updatedAt: now,
    });

    // Create Parent User
    const parentId = await ctx.db.insert("users", {
      name: "Padre/Madre de Prueba",
      email: "parent@plataforma-astral.com",
      password: hashedParentPassword,
      role: "PARENT",
      isActive: true,
      isOAuthUser: false,
      status: "ACTIVE",
      phone: "+56911223344",
      emailVerified: now,
      createdAt: now,
      updatedAt: now,
    });

    // Create School Info
    await ctx.db.insert("institutionInfo", {
      name: "Plataforma Astral Demo School",
      mission: "Proporcionar educación de calidad para todos los niños",
      vision: "Ser líderes en innovación educativa",
      address: "Santiago, Chile",
      phone: "+56912345678",
      email: "contacto@plataforma-astral.com",
      website: "https://plataforma-astral.com",
      institutionType: "PRESCHOOL",
      createdAt: now,
      updatedAt: now,
    });

    // Create a sample student
    const studentId = await ctx.db.insert("students", {
      firstName: "Juan",
      lastName: "Pérez",
      birthDate: new Date("2018-01-15").getTime(),
      grade: "Pre-Kinder",
      enrollmentDate: now,
      teacherId: profesorId,
      parentId: parentId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Create a sample meeting
    const tomorrow = now + 24 * 60 * 60 * 1000;
    await ctx.db.insert("meetings", {
      title: "Reunión de Apoderados",
      description: "Reunión mensual para discutir progreso",
      studentName: "Juan Pérez",
      studentGrade: "Pre-Kinder",
      guardianName: "Padre/Madre de Prueba",
      guardianEmail: "parent@plataforma-astral.com",
      guardianPhone: "+56911223344",
      scheduledDate: tomorrow,
      scheduledTime: "15:00",
      duration: 30,
      location: "Sala 1",
      status: "SCHEDULED",
      type: "PARENT_TEACHER",
      assignedTo: profesorId,
      followUpRequired: false,
      source: "STAFF_CREATED",
      parentRequested: false,
      studentId,
      createdAt: now,
      updatedAt: now,
    });

    // Create sample calendar event
    await ctx.db.insert("calendarEvents", {
      title: "Inicio del Año Escolar",
      description: "Primer día de clases",
      startDate: now,
      endDate: now + 8 * 60 * 60 * 1000, // 8 hours later
      category: "ACADEMIC",
      priority: "HIGH",
      level: "Pre-Kinder",
      isRecurring: false,
      isAllDay: false,
      isActive: true,
      createdBy: adminId,
      updatedBy: adminId,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      message: "Database seeded successfully!",
      users: {
        master: masterId,
        admin: adminId,
        profesor: profesorId,
        parent: parentId,
      },
      student: studentId,
    };
  },
});

export const clearDatabase = mutation({
  args: { confirm: v.boolean(), safetyCode: v.optional(v.string()) },
  handler: async (ctx, { confirm, safetyCode }) => {
    if (!confirm) {
      throw new Error("Must confirm to clear database");
    }

    // PRODUCTION SAFETY: Require special code to clear database
    const SAFETY_CODE = "DELETE_ALL_DATA_PERMANENTLY_2024";
    if (safetyCode !== SAFETY_CODE) {
      throw new Error(
        "⚠️ PRODUCTION SAFETY: This will delete ALL data including real users. " +
          "To proceed, you must provide the correct safetyCode parameter. " +
          "DO NOT run this in production unless you're absolutely sure!",
      );
    }

    // Clear all tables (in reverse order of dependencies)
    const tables = [
      "voteResponses",
      "voteOptions",
      "votes",
      "videoCapsules",
      "videos",
      "photos",
      "notifications",
      "activities",
      "studentProgressReports",
      "recurrenceRules",
      "calendarEventTemplates",
      "calendarEvents",
      "meetingTemplates",
      "meetings",
      "students",
      "teamMembers",
      "institutionInfo",
      "planningDocuments",
      "users",
    ] as const;

    for (const table of tables) {
      const records = await ctx.db.query(table).collect();
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
    }

    return {
      success: true,
      message: "Database cleared successfully!",
    };
  },
});
