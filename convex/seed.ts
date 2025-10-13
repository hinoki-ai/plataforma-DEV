/**
 * Convex Seed Script
 * Creates initial test users and data for development
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Password: master123, admin123, profesor123, parent123
    // Pre-hashed with bcrypt (10 rounds)
    const hashedMasterPassword =
      "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
    const hashedAdminPassword =
      "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
    const hashedProfesorPassword =
      "$2a$10$F4P0HmYqZWp6K0YlxY1EJ.QQZJ4p6qXO.JJ4wYZOLQQYZlYqZWp6K";
    const hashedParentPassword =
      "$2a$10$rVEyGPNjGj8bLqTaHhHjYeYqZWp6K0YlxY1EJ.QQZJ4p6qXO.JJ4w";

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
    await ctx.db.insert("schoolInfo", {
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
  args: { confirm: v.boolean() },
  handler: async (ctx, { confirm }) => {
    if (!confirm) {
      throw new Error("Must confirm to clear database");
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
      "schoolInfo",
      "planningDocuments",
      "verificationTokens",
      "sessions",
      "accounts",
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
