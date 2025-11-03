/**
 * Student Observations Management
 * Chilean Educational System - Libro de Clases
 * Handles behavioral observations with parent notifications
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// ==================== QUERIES ====================

/**
 * Get observations for a student, optionally filtered by course and date range
 */
export const getStudentObservations = query({
  args: {
    studentId: v.id("students"),
    courseId: v.optional(v.id("courses")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    type: v.optional(
      v.union(
        v.literal("POSITIVA"),
        v.literal("NEGATIVA"),
        v.literal("NEUTRA"),
      ),
    ),
  },
  handler: async (ctx, { studentId, courseId, startDate, endDate, type }) => {
    let observations = await ctx.db
      .query("studentObservations")
      .withIndex("by_studentId_date", (q) => q.eq("studentId", studentId))
      .collect();

    // Filter by course if provided
    if (courseId) {
      observations = observations.filter((o) => o.courseId === courseId);
    }

    // Filter by date range if provided
    if (startDate !== undefined) {
      observations = observations.filter((o) => o.date >= startDate);
    }
    if (endDate !== undefined) {
      observations = observations.filter((o) => o.date <= endDate);
    }

    // Filter by type if provided
    if (type) {
      observations = observations.filter((o) => o.type === type);
    }

    // Get teacher and course info
    const observationsWithDetails = await Promise.all(
      observations.map(async (obs) => {
        const teacher = await ctx.db.get(obs.teacherId);
        const course = await ctx.db.get(obs.courseId);
        return {
          ...obs,
          teacher: teacher,
          course: course,
        };
      }),
    );

    // Sort by date descending
    return observationsWithDetails.sort((a, b) => b.date - a.date);
  },
});

/**
 * Get observations for a course
 */
export const getCourseObservations = query({
  args: {
    courseId: v.id("courses"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    type: v.optional(
      v.union(
        v.literal("POSITIVA"),
        v.literal("NEGATIVA"),
        v.literal("NEUTRA"),
      ),
    ),
  },
  handler: async (ctx, { courseId, startDate, endDate, type }) => {
    let observations = await ctx.db
      .query("studentObservations")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();

    // Filter by date range if provided
    if (startDate !== undefined) {
      observations = observations.filter((o) => o.date >= startDate);
    }
    if (endDate !== undefined) {
      observations = observations.filter((o) => o.date <= endDate);
    }

    // Filter by type if provided
    if (type) {
      observations = observations.filter((o) => o.type === type);
    }

    // Get student and teacher info
    const observationsWithDetails = await Promise.all(
      observations.map(async (obs) => {
        const student = await ctx.db.get(obs.studentId);
        const teacher = await ctx.db.get(obs.teacherId);
        return {
          ...obs,
          student: student,
          teacher: teacher,
        };
      }),
    );

    // Sort by date descending
    return observationsWithDetails.sort((a, b) => b.date - a.date);
  },
});

/**
 * Get observations requiring parent notification
 */
export const getPendingNotifications = query({
  args: {
    courseId: v.optional(v.id("courses")),
  },
  handler: async (ctx, { courseId }) => {
    let observations = await ctx.db
      .query("studentObservations")
      .withIndex("by_type", (q) => q.eq("type", "NEGATIVA"))
      .collect();

    // Filter by course if provided
    if (courseId) {
      observations = observations.filter((o) => o.courseId === courseId);
    }

    // Filter observations that need parent notification
    observations = observations.filter(
      (o) => o.notifyParent && !o.parentNotified,
    );

    // Get full details
    const observationsWithDetails = await Promise.all(
      observations.map(async (obs) => {
        const student = await ctx.db.get(obs.studentId);
        const course = await ctx.db.get(obs.courseId);
        const teacher = await ctx.db.get(obs.teacherId);
        return {
          ...obs,
          student: student,
          course: course,
          teacher: teacher,
        };
      }),
    );

    return observationsWithDetails.filter((o) => o.student !== null);
  },
});

// ==================== MUTATIONS ====================

/**
 * Create a new observation
 */
export const createObservation = mutation({
  args: {
    studentId: v.id("students"),
    courseId: v.id("courses"),
    date: v.number(),
    type: v.union(
      v.literal("POSITIVA"),
      v.literal("NEGATIVA"),
      v.literal("NEUTRA"),
    ),
    category: v.union(
      v.literal("COMPORTAMIENTO"),
      v.literal("RENDIMIENTO"),
      v.literal("ASISTENCIA"),
      v.literal("PARTICIPACION"),
      v.literal("RESPONSABILIDAD"),
      v.literal("CONVIVENCIA"),
      v.literal("OTRO"),
    ),
    observation: v.string(),
    subject: v.optional(v.string()),
    severity: v.optional(
      v.union(v.literal("LEVE"), v.literal("GRAVE"), v.literal("GRAVISIMA")),
    ),
    actionTaken: v.optional(v.string()),
    notifyParent: v.boolean(),
    teacherId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Validate date (cannot be in the future)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const recordDate = new Date(args.date);
    recordDate.setHours(0, 0, 0, 0);

    if (recordDate > today) {
      throw new Error("Cannot record observations for future dates");
    }

    // Validate student exists
    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Validate course exists
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    if (student.institutionId !== course.institutionId) {
      throw new Error("Student and course must belong to the same institution");
    }

    // Validate teacher exists and is PROFESOR
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher || teacher.role !== "PROFESOR") {
      throw new Error("Only teachers can create observations");
    }

    // Validate severity for negative observations
    if (args.type === "NEGATIVA" && !args.severity) {
      throw new Error(
        "Severity (LEVE/GRAVE/GRAVISIMA) is required for negative observations",
      );
    }

    // Validate actionTaken for GRAVE/GRAVISIMA observations
    if (
      args.severity &&
      (args.severity === "GRAVE" || args.severity === "GRAVISIMA") &&
      !args.actionTaken
    ) {
      throw new Error(
        "Action taken is required for GRAVE and GRAVISIMA observations",
      );
    }

    const now = Date.now();

    // Create observation
    const observationId = await ctx.db.insert("studentObservations", {
      institutionId: student.institutionId,
      studentId: args.studentId,
      courseId: args.courseId,
      date: args.date,
      type: args.type,
      category: args.category,
      observation: args.observation,
      subject: args.subject,
      severity: args.severity,
      actionTaken: args.actionTaken,
      notifyParent: args.notifyParent,
      parentNotified: false,
      teacherId: args.teacherId,
      createdAt: now,
      updatedAt: now,
    });

    // Send notification to parent if requested
    if (args.notifyParent && student.parentId) {
      await ctx.scheduler.runAfter(0, api.observations.notifyParent, {
        observationId,
        studentId: args.studentId,
      });
    }

    return observationId;
  },
});

/**
 * Update an observation
 */
export const updateObservation = mutation({
  args: {
    observationId: v.id("studentObservations"),
    observation: v.optional(v.string()),
    severity: v.optional(
      v.union(v.literal("LEVE"), v.literal("GRAVE"), v.literal("GRAVISIMA")),
    ),
    actionTaken: v.optional(v.string()),
    notifyParent: v.optional(v.boolean()),
    parentSignature: v.optional(v.string()),
  },
  handler: async (ctx, { observationId, ...updates }) => {
    const obs = await ctx.db.get(observationId);
    if (!obs) {
      throw new Error("Observation not found");
    }

    // If notifyParent is being set to true and parent hasn't been notified, send notification
    if (updates.notifyParent === true && !obs.parentNotified) {
      const student = await ctx.db.get(obs.studentId);
      if (student && student.parentId) {
        await ctx.scheduler.runAfter(0, api.observations.notifyParent, {
          observationId,
          studentId: obs.studentId,
        });
      }
    }

    await ctx.db.patch(observationId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(observationId);
  },
});

/**
 * Notify parent about an observation (called as action)
 */
export const notifyParent = mutation({
  args: {
    observationId: v.id("studentObservations"),
    studentId: v.id("students"),
  },
  handler: async (ctx, { observationId, studentId }) => {
    const observation = await ctx.db.get(observationId);
    if (!observation) {
      throw new Error("Observation not found");
    }

    const student = await ctx.db.get(studentId);
    if (!student || !student.parentId) {
      throw new Error("Student or parent not found");
    }

    const parent = await ctx.db.get(student.parentId);
    if (!parent) {
      throw new Error("Parent user not found");
    }

    const course = await ctx.db.get(observation.courseId);
    const teacher = await ctx.db.get(observation.teacherId);

    // Create notification for parent
    const notificationTitle =
      observation.type === "NEGATIVA"
        ? `Observación Negativa - ${student.firstName} ${student.lastName}`
        : `Observación - ${student.firstName} ${student.lastName}`;

    const severityText =
      observation.severity === "GRAVISIMA"
        ? "Gravísima"
        : observation.severity === "GRAVE"
          ? "Grave"
          : observation.severity === "LEVE"
            ? "Leve"
            : "";

    const notificationMessage = `Se ha registrado una observación ${observation.type.toLowerCase()} ${
      severityText ? `(${severityText})` : ""
    } para ${student.firstName} ${student.lastName} en el curso ${course?.name || "N/A"}.
    
Categoría: ${observation.category}
Fecha: ${new Date(observation.date).toLocaleDateString("es-CL")}
${observation.subject ? `Asignatura: ${observation.subject}` : ""}

Observación: ${observation.observation}
${observation.actionTaken ? `\nAcción tomada: ${observation.actionTaken}` : ""}

Profesor: ${teacher?.name || "N/A"}`;

    await ctx.db.insert("notifications", {
      institutionId: student.institutionId,
      title: notificationTitle,
      message: notificationMessage,
      type: observation.type === "NEGATIVA" ? "WARNING" : "INFO",
      category: "ACADEMIC",
      priority:
        observation.severity === "GRAVISIMA"
          ? "HIGH"
          : observation.severity === "GRAVE"
            ? "HIGH"
            : "MEDIUM",
      recipientId: student.parentId,
      senderId: observation.teacherId,
      actionUrl: `/estudiante/${studentId}/observaciones`,
      read: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Mark observation as parent notified
    await ctx.db.patch(observationId, {
      parentNotified: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Mark observation as acknowledged by parent (with signature)
 */
export const acknowledgeObservation = mutation({
  args: {
    observationId: v.id("studentObservations"),
    parentSignature: v.string(),
    parentId: v.id("users"),
  },
  handler: async (ctx, { observationId, parentSignature, parentId }) => {
    const observation = await ctx.db.get(observationId);
    if (!observation) {
      throw new Error("Observation not found");
    }

    const student = await ctx.db.get(observation.studentId);
    if (!student || student.parentId !== parentId) {
      throw new Error(
        "Unauthorized: Only the student's parent can acknowledge",
      );
    }

    await ctx.db.patch(observationId, {
      parentSignature,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(observationId);
  },
});
