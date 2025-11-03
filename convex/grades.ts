/**
 * Grades and Evaluation Management
 * Chilean Educational System - Libro de Clases
 * Handles grade recording with Chilean 1.0-7.0 scale
 */

import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  ensureInstitutionMatch,
  tenantMutation,
  tenantQuery,
  type TenancyContext,
} from "./tenancy";

// Chilean grade scale constants
const MIN_GRADE = 1.0;
const MAX_GRADE = 7.0;
const PASSING_GRADE = 4.0;

type AnyCtx = QueryCtx | MutationCtx;
type GradeDoc = Doc<"classGrades">;
type CourseDoc = Doc<"courses">;
type StudentDoc = Doc<"students">;

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

async function ensureStudentAccess(
  ctx: AnyCtx,
  tenancy: TenancyContext,
  studentId: Id<"students">,
): Promise<StudentDoc> {
  const student = ensureInstitutionMatch(
    await ctx.db.get(studentId),
    tenancy,
    "Student not found",
  );

  if (
    tenancy.membershipRole === "PARENT" &&
    !tenancy.isMaster &&
    student.parentId !== tenancy.user._id
  ) {
    throw new Error("No permission to access grades for this student");
  }

  if (
    tenancy.membershipRole === "PROFESOR" &&
    !tenancy.isMaster &&
    student.teacherId !== tenancy.user._id
  ) {
    throw new Error("No permission to access grades for this student");
  }

  return student;
}

async function ensureCourseAccess(
  ctx: AnyCtx,
  tenancy: TenancyContext,
  courseId: Id<"courses">,
): Promise<CourseDoc> {
  const course = ensureInstitutionMatch(
    await ctx.db.get(courseId),
    tenancy,
    "Course not found",
  );

  if (
    tenancy.membershipRole === "PROFESOR" &&
    !tenancy.isMaster &&
    course.teacherId !== tenancy.user._id
  ) {
    throw new Error("No permission to access this course");
  }

  return course;
}

async function ensureTeacherMembership(
  ctx: AnyCtx,
  teacherId: Id<"users">,
  institutionId: Id<"institutionInfo">,
): Promise<void> {
  const teacher = await ctx.db.get(teacherId);
  if (!teacher || teacher.role !== "PROFESOR") {
    throw new Error("Teacher not found");
  }

  const membership = await ctx.db
    .query("institutionMemberships")
    .withIndex("by_user_institution", (q: any) =>
      q.eq("userId", teacherId).eq("institutionId", institutionId),
    )
    .first();

  if (!membership) {
    throw new Error("Teacher is not part of this institution");
  }
}

function filterInstitutionGrades(grades: GradeDoc[], tenancy: TenancyContext) {
  return grades.filter(
    (grade: any) => grade.institutionId === tenancy.institution._id,
  );
}

function sortGradesByDate(grades: GradeDoc[]) {
  return grades.sort((a: any, b: any) => b.date - a.date);
}

// ==================== QUERIES ====================

export const getStudentGrades = tenantQuery({
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
  handler: async (ctx, { studentId, courseId, subject, period }, tenancy) => {
    await ensureStudentAccess(ctx, tenancy, studentId);

    let grades = await ctx.db
      .query("classGrades")
      .withIndex("by_studentId_subject", (q: any) => q.eq("studentId", studentId))
      .collect();

    grades = filterInstitutionGrades(grades, tenancy);

    if (subject) {
      grades = grades.filter((grade: any) => grade.subject === subject);
    }

    if (courseId) {
      grades = grades.filter((grade: any) => grade.courseId === courseId);
    }

    if (period) {
      grades = grades.filter((grade: any) => grade.period === period);
    }

    const detailed = (
      await Promise.all(
        grades.map(async (grade: any) => {
          const teacher = await ctx.db.get(grade.teacherId);
          const course = await ctx.db.get(grade.courseId);
          if (!course || course.institutionId !== tenancy.institution._id) {
            return null;
          }
          return {
            ...grade,
            teacher,
            course,
          };
        }),
      )
    ).filter(
      (
        value,
      ): value is GradeDoc & {
        teacher: Doc<"users"> | null;
        course: CourseDoc;
      } => value !== null,
    );

    return sortGradesByDate(detailed);
  },
});

export const getCourseGrades = tenantQuery({
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
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, { courseId, subject, period }, tenancy) => {
    const course = await ensureCourseAccess(ctx, tenancy, courseId);

    let grades = await ctx.db
      .query("classGrades")
      .withIndex("by_courseId", (q: any) => q.eq("courseId", courseId))
      .collect();

    grades = filterInstitutionGrades(grades, tenancy);

    if (subject) {
      grades = grades.filter((grade: any) => grade.subject === subject);
    }

    if (period) {
      grades = grades.filter((grade: any) => grade.period === period);
    }

    const detailed = await Promise.all(
      grades.map(async (grade: any) => {
        const student = await ctx.db.get(grade.studentId);
        if (!student || student.institutionId !== tenancy.institution._id) {
          return null;
        }
        const teacher = await ctx.db.get(grade.teacherId);
        return {
          ...grade,
          student,
          teacher,
        };
      }),
    );

    return sortGradesByDate(
      detailed.filter(
        (value): value is ReturnType<(typeof detailed)[number]> =>
          value !== null,
      ),
    );
  },
});

export const calculatePeriodAverage = tenantQuery({
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
  handler: async (ctx, { studentId, courseId, subject, period }, tenancy) => {
    await ensureStudentAccess(ctx, tenancy, studentId);
    await ensureCourseAccess(ctx, tenancy, courseId);

    const grades = filterInstitutionGrades(
      await ctx.db
        .query("classGrades")
        .withIndex("by_studentId_subject", (q: any) =>
          q.eq("studentId", studentId).eq("subject", subject),
        )
        .collect(),
      tenancy,
    ).filter((grade: any) => grade.courseId === courseId && grade.period === period);

    if (grades.length === 0) {
      return {
        average: null,
        count: 0,
        weightedAverage: null,
        passing: null,
      };
    }

    const sum = grades.reduce((acc, grade) => acc + grade.grade, 0);
    const average = sum / grades.length;

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
      average: Math.round(average * 100) / 100,
      weightedAverage: weightedAverage
        ? Math.round(weightedAverage * 100) / 100
        : null,
      count: grades.length,
      passing: average >= PASSING_GRADE,
      grades,
    };
  },
});

export const getSubjectAverages = tenantQuery({
  args: {
    courseId: v.id("courses"),
    subject: v.string(),
    period: v.union(
      v.literal("PRIMER_SEMESTRE"),
      v.literal("SEGUNDO_SEMESTRE"),
      v.literal("ANUAL"),
    ),
  },
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, { courseId, subject, period }, tenancy) => {
    await ensureCourseAccess(ctx, tenancy, courseId);

    const grades = filterInstitutionGrades(
      await ctx.db
        .query("classGrades")
        .withIndex("by_courseId", (q: any) => q.eq("courseId", courseId))
        .collect(),
      tenancy,
    ).filter((grade: any) => grade.subject === subject && grade.period === period);

    const studentGradesMap = new Map<Id<"students">, GradeDoc[]>();
    for (const grade of grades) {
      const existing = studentGradesMap.get(grade.studentId) ?? [];
      existing.push(grade);
      studentGradesMap.set(grade.studentId, existing);
    }

    const averages = await Promise.all(
      Array.from(studentGradesMap.entries()).map(
        async ([studentId, studentGrades]) => {
          const student = await ctx.db.get(studentId);
          if (!student || student.institutionId !== tenancy.institution._id) {
            return null;
          }

          const sum = studentGrades.reduce(
            (acc, grade) => acc + grade.grade,
            0,
          );
          const average = sum / studentGrades.length;

          let weightedSum = 0;
          let totalWeight = 0;
          let hasWeights = false;

          for (const grade of studentGrades) {
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
            count: studentGrades.length,
            passing: average >= PASSING_GRADE,
          };
        },
      ),
    );

    return averages
      .filter((value): value is NonNullable<typeof value> => value !== null)
      .sort((a: any, b: any) => {
        const avgA = a.weightedAverage ?? a.average;
        const avgB = b.weightedAverage ?? b.average;
        return avgB - avgA;
      });
  },
});

export const getCourseGradeOverview = tenantQuery({
  args: {
    courseId: v.id("courses"),
    period: v.union(
      v.literal("PRIMER_SEMESTRE"),
      v.literal("SEGUNDO_SEMESTRE"),
      v.literal("ANUAL"),
    ),
  },
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, { courseId, period }, tenancy) => {
    const course = await ensureCourseAccess(ctx, tenancy, courseId);

    const courseStudents = await ctx.db
      .query("courseStudents")
      .withIndex("by_courseId_isActive", (q: any) =>
        q.eq("courseId", courseId).eq("isActive", true),
      )
      .collect();

    const allGrades = filterInstitutionGrades(
      await ctx.db
        .query("classGrades")
        .withIndex("by_courseId", (q: any) => q.eq("courseId", courseId))
        .collect(),
      tenancy,
    ).filter((grade: any) => grade.period === period);

    const studentSubjectGrades = new Map<
      Id<"students">,
      Map<string, GradeDoc[]>
    >();

    for (const grade of allGrades) {
      if (!studentSubjectGrades.has(grade.studentId)) {
        studentSubjectGrades.set(grade.studentId, new Map());
      }
      const subjectMap = studentSubjectGrades.get(grade.studentId)!;
      if (!subjectMap.has(grade.subject)) {
        subjectMap.set(grade.subject, []);
      }
      subjectMap.get(grade.subject)!.push(grade);
    }

    const report = await Promise.all(
      courseStudents.map(async (enrollment: any) => {
        const student = await ctx.db.get(enrollment.studentId);
        if (!student || student.institutionId !== tenancy.institution._id) {
          return null;
        }

        const subjectAverages: Record<
          string,
          {
            average: number;
            weightedAverage: number | null;
            count: number;
            passing: boolean;
            grades: GradeDoc[];
          }
        > = {};

        let overallSum = 0;
        let overallCount = 0;
        let overallWeightedSum = 0;
        let overallWeight = 0;
        let hasOverallWeights = false;

        for (const subject of course.subjects) {
          const subjectGrades =
            studentSubjectGrades.get(enrollment.studentId)?.get(subject) ?? [];

          if (subjectGrades.length === 0) {
            subjectAverages[subject] = {
              average: 0,
              weightedAverage: null,
              count: 0,
              passing: false,
              grades: [],
            };
            continue;
          }

          const sum = subjectGrades.reduce(
            (acc, grade) => acc + grade.grade,
            0,
          );
          const average = sum / subjectGrades.length;

          let weightedSum = 0;
          let totalWeight = 0;
          let hasWeights = false;

          for (const grade of subjectGrades) {
            if (grade.percentage !== undefined) {
              weightedSum += grade.grade * (grade.percentage / 100);
              totalWeight += grade.percentage / 100;
              hasWeights = true;
            }
          }

          const weightedAverage =
            hasWeights && totalWeight > 0 ? weightedSum / totalWeight : null;

          subjectAverages[subject] = {
            average: Math.round(average * 100) / 100,
            weightedAverage: weightedAverage
              ? Math.round(weightedAverage * 100) / 100
              : null,
            count: subjectGrades.length,
            passing: average >= PASSING_GRADE,
            grades: subjectGrades,
          };

          overallSum += sum;
          overallCount += subjectGrades.length;
          if (hasWeights) {
            overallWeightedSum += weightedSum;
            overallWeight += totalWeight;
            hasOverallWeights = true;
          }
        }

        const overallAverage = overallCount > 0 ? overallSum / overallCount : 0;
        const overallWeightedAverage =
          hasOverallWeights && overallWeight > 0
            ? overallWeightedSum / overallWeight
            : null;

        return {
          studentId: enrollment.studentId,
          student: {
            firstName: student.firstName,
            lastName: student.lastName,
            grade: student.grade,
          },
          subjectAverages,
          overallAverage: Math.round(overallAverage * 100) / 100,
          overallWeightedAverage: overallWeightedAverage
            ? Math.round(overallWeightedAverage * 100) / 100
            : null,
          totalGrades: overallCount,
          passingSubjects: Object.values(subjectAverages).filter(
            (subject) => subject.passing,
          ).length,
          totalSubjects: course.subjects.length,
        };
      }),
    );

    return report
      .filter((value): value is NonNullable<typeof value> => value !== null)
      .sort((a: any, b: any) => {
        const avgA = a.overallWeightedAverage ?? a.overallAverage;
        const avgB = b.overallWeightedAverage ?? b.overallAverage;
        return avgB - avgA;
      });
  },
});

// ==================== MUTATIONS ====================

export const createGrade = tenantMutation({
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
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, args, tenancy) => {
    validateGrade(args.grade);
    validateGrade(args.maxGrade);
    validatePercentage(args.percentage);

    if (args.grade > args.maxGrade) {
      throw new Error("Grade cannot exceed maximum grade");
    }

    if (!tenancy.isMaster && tenancy.membershipRole === "PROFESOR") {
      if (args.teacherId !== tenancy.user._id) {
        throw new Error("Teachers can only record grades for themselves");
      }
    }

    await ensureTeacherMembership(ctx, args.teacherId, tenancy.institution._id);

    const student = await ensureStudentAccess(ctx, tenancy, args.studentId);
    const course = await ensureCourseAccess(ctx, tenancy, args.courseId);

    if (!course.subjects.includes(args.subject)) {
      throw new Error("Subject is not part of this course");
    }

    // Ensure student is enrolled in course
    const enrollment = await ctx.db
      .query("courseStudents")
      .query("courseStudents")
      .withIndex("by_courseId", (q: any) => q.eq("courseId", args.courseId))
      .filter((q: any) => q.eq("studentId", args.studentId))
      .filter((q: any) => q.eq("isActive", true))
      .first();

    if (!enrollment) {
      throw new Error("Student is not enrolled in this course");
    }

    const now = Date.now();
    return await ctx.db.insert("classGrades", {
      institutionId: tenancy.institution._id,
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

export const updateGrade = tenantMutation({
  args: {
    gradeId: v.id("classGrades"),
    grade: v.optional(v.float64()),
    maxGrade: v.optional(v.float64()),
    percentage: v.optional(v.float64()),
    comments: v.optional(v.string()),
    evaluationName: v.optional(v.string()),
    date: v.optional(v.number()),
    subject: v.optional(v.string()),
    evaluationType: v.optional(
      v.union(
        v.literal("PRUEBA"),
        v.literal("TRABAJO"),
        v.literal("EXAMEN"),
        v.literal("PRESENTACION"),
        v.literal("PROYECTO"),
        v.literal("TAREA"),
        v.literal("PARTICIPACION"),
        v.literal("OTRO"),
      ),
    ),
  },
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, { gradeId, ...updates }, tenancy) => {
    const grade = ensureInstitutionMatch(
      await ctx.db.get(gradeId),
      tenancy,
      "Grade record not found",
    );

    if (
      tenancy.membershipRole === "PROFESOR" &&
      !tenancy.isMaster &&
      grade.teacherId !== tenancy.user._id
    ) {
      throw new Error("No permission to update this grade");
    }

    if (updates.grade !== undefined) {
      validateGrade(updates.grade);
      if (updates.maxGrade !== undefined && updates.grade > updates.maxGrade) {
        throw new Error("Grade cannot exceed maximum grade");
      }
    }

    if (updates.maxGrade !== undefined) {
      validateGrade(updates.maxGrade);
      if (grade.grade > updates.maxGrade) {
        throw new Error("Existing grade exceeds new maximum grade");
      }
    }

    if (updates.percentage !== undefined) {
      validatePercentage(updates.percentage);
    }

    await ctx.db.patch(gradeId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(gradeId);
  },
});

export const deleteGrade = tenantMutation({
  args: { gradeId: v.id("classGrades") },
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, { gradeId }, tenancy) => {
    const grade = ensureInstitutionMatch(
      await ctx.db.get(gradeId),
      tenancy,
      "Grade record not found",
    );

    if (
      tenancy.membershipRole === "PROFESOR" &&
      !tenancy.isMaster &&
      grade.teacherId !== tenancy.user._id
    ) {
      throw new Error("No permission to delete this grade");
    }

    await ctx.db.delete(gradeId);
    return { success: true };
  },
});

export const bulkCreateGrades = tenantMutation({
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
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, args, tenancy) => {
    validateGrade(args.maxGrade);
    validatePercentage(args.percentage);

    if (!tenancy.isMaster && tenancy.membershipRole === "PROFESOR") {
      if (args.teacherId !== tenancy.user._id) {
        throw new Error("Teachers can only record grades for themselves");
      }
    }

    await ensureTeacherMembership(ctx, args.teacherId, tenancy.institution._id);

    const course = await ensureCourseAccess(ctx, tenancy, args.courseId);
    if (!course.subjects.includes(args.subject)) {
      throw new Error("Subject is not part of this course");
    }

    const now = Date.now();
    const results: Array<
      | { studentId: Id<"students">; gradeId: Id<"classGrades">; success: true }
      | { studentId: Id<"students">; error: string }
    > = [];

    for (const gradeData of args.grades) {
      try {
        validateGrade(gradeData.grade);
        if (gradeData.grade > args.maxGrade) {
          throw new Error("Grade cannot exceed maximum grade");
        }

        await ensureStudentAccess(ctx, tenancy, gradeData.studentId);

        const enrollment = await ctx.db
          .query("courseStudents")
          .withIndex("by_courseId", (q: any) => q.eq("courseId", args.courseId))
          .filter((q: any) => q.eq("studentId", gradeData.studentId))
          .filter((q: any) => q.eq("isActive", true))
          .first();

        if (!enrollment) {
          throw new Error("Student is not enrolled in this course");
        }

        const gradeId = await ctx.db.insert("classGrades", {
          institutionId: tenancy.institution._id,
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
        results.push({ studentId: gradeData.studentId, error: error.message });
      }
    }

    return { results };
  },
});
