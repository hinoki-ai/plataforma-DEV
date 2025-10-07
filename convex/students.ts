/**
 * Student Queries and Mutations
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ==================== QUERIES ====================

export const getStudents = query({
  args: {
    teacherId: v.optional(v.id("users")),
    parentId: v.optional(v.id("users")),
    grade: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { teacherId, parentId, grade, isActive }) => {
    let allStudents;

    if (teacherId) {
      allStudents = await ctx.db
        .query("students")
        .withIndex("by_teacherId", (q) => q.eq("teacherId", teacherId))
        .collect();
    } else if (parentId) {
      allStudents = await ctx.db
        .query("students")
        .withIndex("by_parentId", (q) => q.eq("parentId", parentId))
        .collect();
    } else if (grade) {
      allStudents = await ctx.db
        .query("students")
        .withIndex("by_grade", (q) => q.eq("grade", grade))
        .collect();
    } else {
      allStudents = await ctx.db.query("students").collect();
    }

    if (isActive !== undefined) {
      allStudents = allStudents.filter((s) => s.isActive === isActive);
    }

    return allStudents.sort((a, b) => a.lastName.localeCompare(b.lastName));
  },
});

export const getStudentById = query({
  args: { id: v.id("students") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// ==================== MUTATIONS ====================

export const createStudent = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    birthDate: v.number(),
    grade: v.string(),
    enrollmentDate: v.number(),
    teacherId: v.id("users"),
    parentId: v.id("users"),
    medicalInfo: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    allergies: v.optional(v.string()),
    specialNeeds: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("students", {
      ...args,
      attendanceRate: 0,
      academicProgress: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateStudent = mutation({
  args: {
    id: v.id("students"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    grade: v.optional(v.string()),
    teacherId: v.optional(v.id("users")),
    parentId: v.optional(v.id("users")),
    medicalInfo: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    allergies: v.optional(v.string()),
    specialNeeds: v.optional(v.string()),
    attendanceRate: v.optional(v.float64()),
    academicProgress: v.optional(v.float64()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const deleteStudent = mutation({
  args: { id: v.id("students") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
