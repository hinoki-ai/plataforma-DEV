/**
 * Grades and Evaluation Management
 * Chilean Educational System - Libro de Clases
 * Handles grade recording with Chilean 1.0-7.0 scale
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Chilean grade scale constants
const MIN_GRADE = 1.0;
const MAX_GRADE = 7.0;
const PASSING_GRADE = 4.0;

/**
 * Validate grade is within Chilean scale (1.0 - 7.0)
 */
function validateGrade(grade: number): void {
  if (grade < MIN_GRADE || grade > MAX_GRADE) {
    throw new Error(
      `Grade must be between ${MIN_GRADE} and ${MAX_GRADE} (Chilean scale)`,
    );
  }
}

/**
 * Validate percentage is between 0 and 100
 */
function validatePercentage(percentage: number | undefined): void {
  if (percentage !== undefined && (percentage < 0 || percentage > 100)) {
    throw new Error("Percentage must be between 0 and 100");
  }
}

// ==================== QUERIES ====================

/**
 * Get grades for a student, optionally filtered by subject and period
 */
export const getStudentGrades = query({
  args: {
    studentId: v.id("students"),
    courseId: v.optional(v.id("courses")),
    subject: v.optional(v.string()),
    period: v.optional(
      v.union(
        v.literal("PRIMER_SEMESTRE"),
        v.literal("SEGUNDO_SEMESTRE"),
        v.literal("ANUAL"),
      ),
    ),
  },
  handler: async (ctx, { studentId, courseId, subject, period }) => {
    let grades = await ctx.db
      .query("classGrades")
      .withIndex("by_studentId_subject", (q) => q.eq("studentId", studentId))
      .collect();

    // Filter by course if provided
    if (courseId) {
      grades = grades.filter((g) => g.courseId === courseId);
    }

    // Filter by subject if provided
    if (subject) {
      grades = grades.filter((g) => g.subject === subject);
    }

    // Filter by period if provided
    if (period) {
      grades = grades.filter((g) => g.period === period);
    }

    // Get teacher and course info
    const gradesWithDetails = await Promise.all(
      grades.map(async (grade) => {
        const teacher = await ctx.db.get(grade.teacherId);
        const course = await ctx.db.get(grade.courseId);
        return {
          ...grade,
          teacher: teacher,
          course: course,
        };
      }),
    );

    // Sort by date descending
    return gradesWithDetails.sort((a, b) => b.date - a.date);
  },
});

/**
 * Get grades for a course
 */
export const getCourseGrades = query({
  args: {
    courseId: v.id("courses"),
    subject: v.optional(v.string()),
    period: v.optional(
      v.union(
        v.literal("PRIMER_SEMESTRE"),
        v.literal("SEGUNDO_SEMESTRE"),
        v.literal("ANUAL"),
      ),
    ),
  },
  handler: async (ctx, { courseId, subject, period }) => {
    let grades = await ctx.db
      .query("classGrades")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();

    // Filter by subject if provided
    if (subject) {
      grades = grades.filter((g) => g.subject === subject);
    }

    // Filter by period if provided
    if (period) {
      grades = grades.filter((g) => g.period === period);
    }

    // Get student and teacher info
    const gradesWithDetails = await Promise.all(
      grades.map(async (grade) => {
        const student = await ctx.db.get(grade.studentId);
        const teacher = await ctx.db.get(grade.teacherId);
        return {
          ...grade,
          student: student,
          teacher: teacher,
        };
      }),
    );

    // Sort by date descending
    return gradesWithDetails.sort((a, b) => b.date - a.date);
  },
});

/**
 * Calculate period average for a student
 */
export const calculatePeriodAverage = query({
  args: {
    studentId: v.id("students"),
    courseId: v.id("courses"),
    subject: v.string(),
    period: v.union(
      v.literal("PRIMER_SEMESTRE"),
      v.literal("SEGUNDO_SEMESTRE"),
      v.literal("ANUAL"),
    ),
  },
  handler: async (ctx, { studentId, courseId, subject, period }) => {
    const grades = await ctx.db
      .query("classGrades")
      .withIndex("by_studentId_subject", (q) => q.eq("studentId", studentId))
      .collect();

    // Filter by course, subject, and period
    const relevantGrades = grades.filter(
      (g) =>
        g.courseId === courseId && g.subject === subject && g.period === period,
    );

    if (relevantGrades.length === 0) {
      return {
        average: null,
        count: 0,
        weightedAverage: null,
        passing: null,
      };
    }

    // Calculate simple average
    const sum = relevantGrades.reduce((acc, g) => acc + g.grade, 0);
    const average = sum / relevantGrades.length;

    // Calculate weighted average if percentages are provided
    let weightedSum = 0;
    let totalWeight = 0;
    let hasWeights = false;

    for (const grade of relevantGrades) {
      if (grade.percentage !== undefined) {
        weightedSum += grade.grade * (grade.percentage / 100);
        totalWeight += grade.percentage / 100;
        hasWeights = true;
      }
    }

    const weightedAverage =
      hasWeights && totalWeight > 0 ? weightedSum / totalWeight : null;

    return {
      average: Math.round(average * 100) / 100,
      weightedAverage: weightedAverage
        ? Math.round(weightedAverage * 100) / 100
        : null,
      count: relevantGrades.length,
      passing: average >= PASSING_GRADE,
      grades: relevantGrades,
    };
  },
});

/**
 * Get subject averages for all students in a course
 */
export const getSubjectAverages = query({
  args: {
    courseId: v.id("courses"),
    subject: v.string(),
    period: v.union(
      v.literal("PRIMER_SEMESTRE"),
      v.literal("SEGUNDO_SEMESTRE"),
      v.literal("ANUAL"),
    ),
  },
  handler: async (ctx, { courseId, subject, period }) => {
    // Get all grades for this course/subject/period
    const grades = await ctx.db
      .query("classGrades")
      .withIndex("by_courseId", (q) => q.eq("courseId", courseId))
      .collect();

    const relevantGrades = grades.filter(
      (g) => g.subject === subject && g.period === period,
    );

    // Group by student
    const studentGradesMap = new Map<Id<"students">, typeof relevantGrades>();
    for (const grade of relevantGrades) {
      const existing = studentGradesMap.get(grade.studentId) || [];
      existing.push(grade);
      studentGradesMap.set(grade.studentId, existing);
    }

    // Calculate averages for each student
    const averages = await Promise.all(
      Array.from(studentGradesMap.entries()).map(
        async ([studentId, grades]) => {
          const student = await ctx.db.get(studentId);
          if (!student) return null;

          const sum = grades.reduce((acc, g) => acc + g.grade, 0);
          const average = sum / grades.length;

          // Calculate weighted average
          let weightedSum = 0;
          let totalWeight = 0;
          let hasWeights = false;

          for (const grade of grades) {
            if (grade.percentage !== undefined) {
              weightedSum += grade.grade * (grade.percentage / 100);
              totalWeight += grade.percentage / 100;
              hasWeights = true;
            }
          }

          const weightedAverage =
            hasWeights && totalWeight > 0 ? weightedSum / totalWeight : null;

          return {
            studentId,
            student: {
              firstName: student.firstName,
              lastName: student.lastName,
            },
            average: Math.round(average * 100) / 100,
            weightedAverage: weightedAverage
              ? Math.round(weightedAverage * 100) / 100
              : null,
            count: grades.length,
            passing: average >= PASSING_GRADE,
          };
        },
      ),
    );

    return averages
      .filter((a) => a !== null)
      .sort((a, b) => {
        const avgA = a!.weightedAverage ?? a!.average;
        const avgB = b!.weightedAverage ?? b!.average;
        return avgB - avgA; // Sort descending
      });
  },
});

// ==================== MUTATIONS ====================

/**
 * Create a new grade/evaluation record
 */
export const createGrade = mutation({
  args: {
    studentId: v.id("students"),
    courseId: v.id("courses"),
    subject: v.string(),
    evaluationType: v.union(
      v.literal("PRUEBA"),
      v.literal("TRABAJO"),
      v.literal("EXAMEN"),
      v.literal("PRESENTACION"),
      v.literal("PROYECTO"),
      v.literal("TAREA"),
      v.literal("PARTICIPACION"),
      v.literal("OTRO"),
    ),
    evaluationName: v.string(),
    date: v.number(),
    grade: v.float64(),
    maxGrade: v.float64(),
    percentage: v.optional(v.float64()),
    comments: v.optional(v.string()),
    period: v.union(
      v.literal("PRIMER_SEMESTRE"),
      v.literal("SEGUNDO_SEMESTRE"),
      v.literal("ANUAL"),
    ),
    teacherId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Validate grade is within Chilean scale
    validateGrade(args.grade);
    validateGrade(args.maxGrade);

    // Validate percentage if provided
    validatePercentage(args.percentage);

    // Validate date (cannot be in the future)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const recordDate = new Date(args.date);
    recordDate.setHours(0, 0, 0, 0);

    if (recordDate > today) {
      throw new Error("Cannot record grades for future dates");
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

    // Validate subject is in course subjects
    if (!course.subjects.includes(args.subject)) {
      throw new Error(
        `Subject ${args.subject} is not part of this course's subjects`,
      );
    }

    // Validate teacher exists and is PROFESOR
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher || teacher.role !== "PROFESOR") {
      throw new Error("Only teachers can record grades");
    }

    // Validate grade doesn't exceed maxGrade
    if (args.grade > args.maxGrade) {
      throw new Error(`Grade cannot exceed maximum grade (${args.maxGrade})`);
    }

    const now = Date.now();

    return await ctx.db.insert("classGrades", {
      studentId: args.studentId,
      courseId: args.courseId,
      subject: args.subject,
      evaluationType: args.evaluationType,
      evaluationName: args.evaluationName,
      date: args.date,
      grade: args.grade,
      maxGrade: args.maxGrade,
      percentage: args.percentage,
      comments: args.comments,
      period: args.period,
      teacherId: args.teacherId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update a grade record
 */
export const updateGrade = mutation({
  args: {
    gradeId: v.id("classGrades"),
    grade: v.optional(v.float64()),
    maxGrade: v.optional(v.float64()),
    percentage: v.optional(v.float64()),
    comments: v.optional(v.string()),
  },
  handler: async (ctx, { gradeId, ...updates }) => {
    const gradeRecord = await ctx.db.get(gradeId);
    if (!gradeRecord) {
      throw new Error("Grade record not found");
    }

    // Validate grades if being updated
    if (updates.grade !== undefined) {
      validateGrade(updates.grade);
    }
    if (updates.maxGrade !== undefined) {
      validateGrade(updates.maxGrade);
    }
    if (updates.percentage !== undefined) {
      validatePercentage(updates.percentage);
    }

    // Validate grade doesn't exceed maxGrade
    const finalGrade = updates.grade ?? gradeRecord.grade;
    const finalMaxGrade = updates.maxGrade ?? gradeRecord.maxGrade;
    if (finalGrade > finalMaxGrade) {
      throw new Error(`Grade cannot exceed maximum grade (${finalMaxGrade})`);
    }

    await ctx.db.patch(gradeId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(gradeId);
  },
});

/**
 * Delete a grade record
 */
export const deleteGrade = mutation({
  args: { gradeId: v.id("classGrades") },
  handler: async (ctx, { gradeId }) => {
    const grade = await ctx.db.get(gradeId);
    if (!grade) {
      throw new Error("Grade record not found");
    }

    await ctx.db.delete(gradeId);
    return { success: true };
  },
});

/**
 * Bulk create grades for multiple students
 */
export const bulkCreateGrades = mutation({
  args: {
    courseId: v.id("courses"),
    subject: v.string(),
    evaluationType: v.union(
      v.literal("PRUEBA"),
      v.literal("TRABAJO"),
      v.literal("EXAMEN"),
      v.literal("PRESENTACION"),
      v.literal("PROYECTO"),
      v.literal("TAREA"),
      v.literal("PARTICIPACION"),
      v.literal("OTRO"),
    ),
    evaluationName: v.string(),
    date: v.number(),
    maxGrade: v.float64(),
    percentage: v.optional(v.float64()),
    period: v.union(
      v.literal("PRIMER_SEMESTRE"),
      v.literal("SEGUNDO_SEMESTRE"),
      v.literal("ANUAL"),
    ),
    grades: v.array(
      v.object({
        studentId: v.id("students"),
        grade: v.float64(),
        comments: v.optional(v.string()),
      }),
    ),
    teacherId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Validate maxGrade
    validateGrade(args.maxGrade);
    validatePercentage(args.percentage);

    // Validate course and teacher
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher || teacher.role !== "PROFESOR") {
      throw new Error("Only teachers can record grades");
    }

    const now = Date.now();
    const results = [];
    const errors = [];

    for (const gradeData of args.grades) {
      try {
        // Validate grade
        validateGrade(gradeData.grade);
        if (gradeData.grade > args.maxGrade) {
          throw new Error(
            `Grade cannot exceed maximum grade (${args.maxGrade})`,
          );
        }

        const gradeId = await ctx.db.insert("classGrades", {
          studentId: gradeData.studentId,
          courseId: args.courseId,
          subject: args.subject,
          evaluationType: args.evaluationType,
          evaluationName: args.evaluationName,
          date: args.date,
          grade: gradeData.grade,
          maxGrade: args.maxGrade,
          percentage: args.percentage,
          comments: gradeData.comments,
          period: args.period,
          teacherId: args.teacherId,
          createdAt: now,
          updatedAt: now,
        });

        results.push({
          studentId: gradeData.studentId,
          gradeId,
          success: true,
        });
      } catch (error: any) {
        errors.push({ studentId: gradeData.studentId, error: error.message });
      }
    }

    return { results, errors };
  },
});
