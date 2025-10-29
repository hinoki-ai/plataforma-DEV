/**
 * Courses/Class Book Management
 * Chilean Educational System - Libro de Clases
 * Handles course creation, enrollment, and management
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ==================== QUERIES ====================

/**
 * Get all courses for a teacher, optionally filtered by academic year
 */
export const getCourses = query({
  args: {
    teacherId: v.optional(v.id("users")),
    academicYear: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { teacherId, academicYear, isActive }) => {
    let courses;

    if (teacherId) {
      courses = await ctx.db
        .query("courses")
        .withIndex("by_teacherId", (q) => q.eq("teacherId", teacherId))
        .collect();
    } else {
      courses = await ctx.db.query("courses").collect();
    }

    // Filter by academic year if provided
    if (academicYear !== undefined) {
      courses = courses.filter((c) => c.academicYear === academicYear);
    }

    // Filter by active status if provided
    if (isActive !== undefined) {
      courses = courses.filter((c) => c.isActive === isActive);
    }

    // Sort by academic year (descending) and then by grade
    return courses.sort((a, b) => {
      if (a.academicYear !== b.academicYear) {
        return b.academicYear - a.academicYear;
      }
      return a.grade.localeCompare(b.grade);
    });
  },
});

/**
 * Get a single course by ID with enrolled students
 */
export const getCourseById = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, { courseId }) => {
    const course = await ctx.db.get(courseId);
    if (!course) {
      return null;
    }

    // Get enrolled students
    const enrollments = await ctx.db
      .query("courseStudents")
      .withIndex("by_courseId_isActive", (q) =>
        q.eq("courseId", courseId).eq("isActive", true),
      )
      .collect();

    const students = await Promise.all(
      enrollments.map(async (enrollment) => {
        const student = await ctx.db.get(enrollment.studentId);
        return {
          ...enrollment,
          student: student,
        };
      }),
    );

    // Get teacher info
    const teacher = await ctx.db.get(course.teacherId);

    return {
      ...course,
      students: students.filter((s) => s.student),
      teacher: teacher,
    };
  },
});

/**
 * Get courses by academic year and grade
 */
export const getCoursesByGrade = query({
  args: {
    academicYear: v.number(),
    grade: v.string(),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { academicYear, grade, isActive }) => {
    let courses = await ctx.db
      .query("courses")
      .withIndex("by_academicYear_grade", (q) =>
        q.eq("academicYear", academicYear).eq("grade", grade),
      )
      .collect();

    if (isActive !== undefined) {
      courses = courses.filter((c) => c.isActive === isActive);
    }

    return courses.sort((a, b) => a.section.localeCompare(b.section));
  },
});

/**
 * Get all active courses for the current academic year
 */
export const getActiveCourses = query({
  args: {
    academicYear: v.optional(v.number()),
  },
  handler: async (ctx, { academicYear }) => {
    const currentYear = academicYear ?? new Date().getFullYear();
    const allCourses = await ctx.db
      .query("courses")
      .withIndex("by_academicYear", (q) => q.eq("academicYear", currentYear))
      .collect();

    const courses = allCourses.filter((c) => c.isActive);

    return courses.sort((a, b) => a.grade.localeCompare(b.grade));
  },
});

// ==================== MUTATIONS ====================

/**
 * Create a new course/class
 */
export const createCourse = mutation({
  args: {
    name: v.string(),
    level: v.string(), // "BASICA" or "MEDIA"
    grade: v.string(), // e.g., "8vo", "1ro Medio"
    section: v.string(), // e.g., "A", "B", "C"
    academicYear: v.number(),
    teacherId: v.id("users"),
    subjects: v.array(v.string()),
    maxStudents: v.optional(v.number()),
    schedule: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Validate teacher exists and is a PROFESOR
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher) {
      throw new Error("Teacher not found");
    }
    if (teacher.role !== "PROFESOR") {
      throw new Error("User is not a teacher");
    }

    // Check if course with same name/year already exists
    const existingCourses = await ctx.db
      .query("courses")
      .withIndex("by_academicYear_grade", (q) =>
        q.eq("academicYear", args.academicYear).eq("grade", args.grade),
      )
      .collect();

    const duplicate = existingCourses.find(
      (c) => c.section === args.section && c.name === args.name,
    );
    if (duplicate) {
      throw new Error(
        `Course ${args.name} ${args.section} already exists for academic year ${args.academicYear}`,
      );
    }

    // Validate academic year (should be current or future year)
    const currentYear = new Date().getFullYear();
    if (args.academicYear < currentYear - 1) {
      throw new Error("Academic year cannot be more than 1 year in the past");
    }

    return await ctx.db.insert("courses", {
      name: args.name,
      level: args.level,
      grade: args.grade,
      section: args.section,
      academicYear: args.academicYear,
      teacherId: args.teacherId,
      subjects: args.subjects,
      maxStudents: args.maxStudents,
      schedule: args.schedule,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update course details
 */
export const updateCourse = mutation({
  args: {
    courseId: v.id("courses"),
    name: v.optional(v.string()),
    level: v.optional(v.string()),
    grade: v.optional(v.string()),
    section: v.optional(v.string()),
    teacherId: v.optional(v.id("users")),
    subjects: v.optional(v.array(v.string())),
    maxStudents: v.optional(v.number()),
    schedule: v.optional(v.any()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { courseId, ...updates }) => {
    const course = await ctx.db.get(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Validate teacher if being updated
    if (updates.teacherId) {
      const teacher = await ctx.db.get(updates.teacherId);
      if (!teacher || teacher.role !== "PROFESOR") {
        throw new Error("Invalid teacher");
      }
    }

    await ctx.db.patch(courseId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(courseId);
  },
});

/**
 * Soft delete course (deactivate)
 */
export const deleteCourse = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, { courseId }) => {
    const course = await ctx.db.get(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Soft delete: set isActive to false
    await ctx.db.patch(courseId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    // Also deactivate all student enrollments
    const enrollments = await ctx.db
      .query("courseStudents")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();

    for (const enrollment of enrollments) {
      await ctx.db.patch(enrollment._id, {
        isActive: false,
      });
    }

    return { success: true };
  },
});

/**
 * Enroll a student in a course
 */
export const enrollStudent = mutation({
  args: {
    courseId: v.id("courses"),
    studentId: v.id("students"),
  },
  handler: async (ctx, { courseId, studentId }) => {
    const course = await ctx.db.get(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    const student = await ctx.db.get(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Check if student is already enrolled
    const existingEnrollments = await ctx.db
      .query("courseStudents")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();

    const existing = existingEnrollments.find(
      (e) => e.studentId === studentId && e.isActive,
    );
    if (existing) {
      throw new Error("Student is already enrolled in this course");
    }

    // Check capacity if maxStudents is set
    const activeEnrollments = existingEnrollments.filter((e) => e.isActive);
    if (course.maxStudents && activeEnrollments.length >= course.maxStudents) {
      throw new Error("Course has reached maximum capacity");
    }

    return await ctx.db.insert("courseStudents", {
      courseId,
      studentId,
      enrollmentDate: Date.now(),
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

/**
 * Remove a student from a course
 */
export const removeStudent = mutation({
  args: {
    courseId: v.id("courses"),
    studentId: v.id("students"),
  },
  handler: async (ctx, { courseId, studentId }) => {
    const enrollments = await ctx.db
      .query("courseStudents")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();

    const enrollment = enrollments.find(
      (e) => e.studentId === studentId && e.isActive,
    );

    if (!enrollment) {
      throw new Error("Student is not enrolled in this course");
    }

    // Soft delete: deactivate enrollment
    await ctx.db.patch(enrollment._id, {
      isActive: false,
    });

    return { success: true };
  },
});

/**
 * Bulk enroll students in a course
 */
export const bulkEnrollStudents = mutation({
  args: {
    courseId: v.id("courses"),
    studentIds: v.array(v.id("students")),
  },
  handler: async (ctx, { courseId, studentIds }) => {
    const course = await ctx.db.get(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    const results = [];
    const errors = [];

    for (const studentId of studentIds) {
      try {
        const enrollmentId = await ctx.db.insert("courseStudents", {
          courseId,
          studentId,
          enrollmentDate: Date.now(),
          isActive: true,
          createdAt: Date.now(),
        });
        results.push({ studentId, enrollmentId, success: true });
      } catch (error: any) {
        errors.push({ studentId, error: error.message });
      }
    }

    return { results, errors };
  },
});
