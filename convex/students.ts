/**
 * Student Queries and Mutations
 */

import { v } from "convex/values";
import { tenantMutation, tenantQuery, ensureInstitutionMatch } from "./tenancy";
import type { Doc } from "./_generated/dataModel";

// ==================== QUERIES ====================

export const getStudents = tenantQuery({
  args: {
    teacherId: v.optional(v.id("users")),
    parentId: v.optional(v.id("users")),
    grade: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { teacherId, parentId, grade, isActive }, tenancy) => {
    let queryBuilder = ctx.db
      .query("students")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      );

    const enforcedTeacherId =
      tenancy.membershipRole === "PROFESOR" ? tenancy.user._id : teacherId;

    if (enforcedTeacherId) {
      queryBuilder = queryBuilder.filter((q: any) =>
        q.eq("teacherId", enforcedTeacherId),
      );
    }

    const enforcedParentId =
      tenancy.membershipRole === "PARENT" ? tenancy.user._id : parentId;

    if (enforcedParentId) {
      queryBuilder = queryBuilder.filter((q: any) =>
        q.eq("parentId", enforcedParentId),
      );
    }

    if (grade) {
      queryBuilder = queryBuilder.filter((q: any) => q.eq("grade", grade));
    }

    let allStudents = (await queryBuilder.collect()) as Doc<"students">[];

    if (isActive !== undefined) {
      allStudents = allStudents.filter(
        (s: Doc<"students">) => s.isActive === isActive,
      );
    }

    return allStudents.sort((a: Doc<"students">, b: Doc<"students">) =>
      a.lastName.localeCompare(b.lastName),
    );
  },
});

export const getStudentById = tenantQuery({
  args: { id: v.id("students") },
  handler: async (ctx, { id }, tenancy) => {
    const student = await ctx.db.get(id);
    return ensureInstitutionMatch(student, tenancy, "Student not found");
  },
});

// ==================== MUTATIONS ====================

export const createStudent = tenantMutation({
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
  roles: ["ADMIN", "STAFF", "MASTER"],
  handler: async (ctx, args, tenancy) => {
    const now = Date.now();
    return await ctx.db.insert("students", {
      ...args,
      institutionId: tenancy.institution._id,
      attendanceRate: 0,
      academicProgress: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateStudent = tenantMutation({
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
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, { id, ...updates }, tenancy) => {
    const existing = ensureInstitutionMatch(
      await ctx.db.get(id),
      tenancy,
      "Student not found",
    );

    const canEditAll =
      tenancy.isMaster ||
      tenancy.membershipRole === "ADMIN" ||
      tenancy.membershipRole === "STAFF";

    if (!canEditAll && existing.teacherId !== tenancy.user._id) {
      throw new Error("No permission to update this student");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const deleteStudent = tenantMutation({
  args: { id: v.id("students") },
  roles: ["ADMIN", "STAFF", "MASTER"],
  handler: async (ctx, { id }, tenancy) => {
    ensureInstitutionMatch(await ctx.db.get(id), tenancy, "Student not found");

    if (
      !(
        tenancy.isMaster ||
        tenancy.membershipRole === "ADMIN" ||
        tenancy.membershipRole === "STAFF"
      )
    ) {
      throw new Error("No permission to delete students");
    }

    await ctx.db.delete(id);
  },
});
