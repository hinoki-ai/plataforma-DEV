/**
 * Courses/Class Book Management
 * Chilean Educational System - Libro de Clases
 * Handles course creation, enrollment, and management
 */

import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { ensureInstitutionMatch, tenantMutation, tenantQuery } from "./tenancy";

interface CourseFilters {
  academicYear?: number;
  isActive?: boolean;
}

type AnyCtx = QueryCtx | MutationCtx;
type CourseDoc = Doc<"courses">;
type EnrollmentDoc = Doc<"courseStudents">;
type StudentDoc = Doc<"students">;

async function userInInstitution(
  ctx: AnyCtx,
  userId: Id<"users">,
  institutionId: Id<"institutionInfo">,
): Promise<boolean> {
  const membership = await ctx.db
    .query("institutionMemberships")
    .withIndex("by_user_institution", (q: any) =>
      q.eq("userId", userId).eq("institutionId", institutionId),
    )
    .first();
  return membership !== null;
}

async function validateTeacherMembership(
  ctx: AnyCtx,
  teacherId: Id<"users">,
  institutionId: Id<"institutionInfo">,
  allowMasterBypass: boolean,
): Promise<void> {
  const teacher = await ctx.db.get(teacherId);
  if (!teacher) {
    throw new Error("Teacher not found");
  }
  if (teacher.role !== "PROFESOR") {
    throw new Error("User is not a teacher");
  }

  if (
    !allowMasterBypass &&
    !(await userInInstitution(ctx, teacherId, institutionId))
  ) {
    throw new Error("Teacher is not part of this institution");
  }
}

async function validateStudentInInstitution(
  ctx: AnyCtx,
  studentId: Id<"students">,
  institutionId: Id<"institutionInfo">,
): Promise<StudentDoc> {
  const student = await ctx.db.get(studentId);
  if (!student || student.institutionId !== institutionId) {
    throw new Error("Student not found for this institution");
  }
  return student;
}

function filterCourses(
  courses: CourseDoc[],
  { academicYear, isActive }: CourseFilters,
) {
  let result = courses;
  if (academicYear !== undefined) {
    result = result.filter(
      (course: any) => course.academicYear === academicYear,
    );
  }
  if (isActive !== undefined) {
    result = result.filter((course: any) => course.isActive === isActive);
  }
  return result.sort((a: any, b: any) => {
    if (a.academicYear !== b.academicYear) {
      return b.academicYear - a.academicYear;
    }
    return a.grade.localeCompare(b.grade);
  });
}

// ==================== QUERIES ====================

export const getCourses = tenantQuery({
  args: {
    teacherId: v.optional(v.id("users")),
    academicYear: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { teacherId, academicYear, isActive }, tenancy) => {
    let courses = await ctx.db
      .query("courses")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .collect();

    const enforcedTeacherId =
      tenancy.membershipRole === "PROFESOR" && !tenancy.isMaster
        ? tenancy.user._id
        : teacherId;

    if (enforcedTeacherId) {
      courses = courses.filter(
        (course: any) => course.teacherId === enforcedTeacherId,
      );
    }

    return filterCourses(courses, { academicYear, isActive });
  },
});

export const getCourseById = tenantQuery({
  args: { courseId: v.id("courses") },
  handler: async (ctx, { courseId }, tenancy) => {
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

    let enrollments = await ctx.db
      .query("courseStudents")
      .withIndex("by_courseId_isActive", (q: any) =>
        q.eq("courseId", courseId).eq("isActive", true),
      )
      .collect();

    enrollments = enrollments.filter(
      (enrollment: any) => enrollment.institutionId === tenancy.institution._id,
    );

    const students = (
      await Promise.all(
        enrollments.map(async (enrollment: any) => {
          const student = await ctx.db.get(enrollment.studentId);
          if (!student || student.institutionId !== tenancy.institution._id) {
            return null;
          }
          return {
            ...enrollment,
            student,
          };
        }),
      )
    ).filter(
      (value): value is EnrollmentDoc & { student: StudentDoc } =>
        value !== null,
    );

    if (
      tenancy.membershipRole === "PARENT" &&
      !tenancy.isMaster &&
      !students.some(
        (record: any) => record.student.parentId === tenancy.user._id,
      )
    ) {
      throw new Error("No permission to access this course");
    }

    const teacher = await ctx.db.get(course.teacherId);

    return {
      ...course,
      students,
      teacher,
    };
  },
});

export const getCoursesByGrade = tenantQuery({
  args: {
    academicYear: v.number(),
    grade: v.string(),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { academicYear, grade, isActive }, tenancy) => {
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .filter((q: any) => q.eq("academicYear", academicYear))
      .filter((q: any) => q.eq("grade", grade))
      .collect();

    return filterCourses(courses, { isActive });
  },
});

export const getActiveCourses = tenantQuery({
  args: {
    academicYear: v.optional(v.number()),
  },
  handler: async (ctx, { academicYear }, tenancy) => {
    const targetYear = academicYear ?? new Date().getFullYear();

    const courses = await ctx.db
      .query("courses")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .filter((q: any) => q.eq("academicYear", targetYear))
      .filter((q: any) => q.eq("isActive", true))
      .collect();

    return courses.sort((a: any, b: any) => a.grade.localeCompare(b.grade));
  },
});

export const getCoursesForParent = tenantQuery({
  args: {
    parentId: v.id("users"),
    academicYear: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  roles: ["ADMIN", "STAFF", "PROFESOR", "PARENT", "MASTER"],
  handler: async (ctx, { parentId, academicYear, isActive }, tenancy) => {
    const effectiveParentId =
      tenancy.membershipRole === "PARENT" && !tenancy.isMaster
        ? tenancy.user._id
        : parentId;

    if (
      !tenancy.isMaster &&
      tenancy.membershipRole !== "PARENT" &&
      !(await userInInstitution(
        ctx,
        effectiveParentId,
        tenancy.institution._id as Id<"institutionInfo">,
      ))
    ) {
      throw new Error("Parent is not part of this institution");
    }

    const students = await ctx.db
      .query("students")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .filter((q: any) => q.eq("parentId", effectiveParentId))
      .collect();

    if (students.length === 0) {
      return [];
    }

    const studentIds = new Set(students.map((student: any) => student._id));

    const enrollments = await ctx.db
      .query("courseStudents")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .filter((q: any) => q.eq("isActive", true))
      .collect();

    const relevantCourseIds = new Set(
      enrollments
        .filter((enrollment: any) => studentIds.has(enrollment.studentId))
        .map((enrollment: any) => enrollment.courseId),
    );

    if (relevantCourseIds.size === 0) {
      return [];
    }

    const courses = await Promise.all(
      Array.from(relevantCourseIds).map((courseId) => ctx.db.get(courseId)),
    );

    const filtered = courses.filter((course): course is CourseDoc => {
      if (!course || course.institutionId !== tenancy.institution._id) {
        return false;
      }
      if (academicYear !== undefined && course.academicYear !== academicYear) {
        return false;
      }
      if (isActive !== undefined && course.isActive !== isActive) {
        return false;
      }
      return true;
    });

    return filterCourses(filtered, {});
  },
});

// ==================== MUTATIONS ====================

export const createCourse = tenantMutation({
  args: {
    name: v.string(),
    level: v.string(),
    grade: v.string(),
    section: v.string(),
    academicYear: v.number(),
    teacherId: v.id("users"),
    subjects: v.array(v.string()),
    maxStudents: v.optional(v.number()),
    schedule: v.optional(v.any()),
  },
  roles: ["ADMIN", "STAFF", "MASTER"],
  handler: async (ctx, args, tenancy) => {
    await validateTeacherMembership(
      ctx,
      args.teacherId,
      tenancy.institution._id as Id<"institutionInfo">,
      tenancy.isMaster,
    );

    const existingCourses = await ctx.db
      .query("courses")
      .withIndex("by_institutionId", (q: any) =>
        q.eq("institutionId", tenancy.institution._id),
      )
      .filter((q: any) => q.eq("academicYear", args.academicYear))
      .filter((q: any) => q.eq("grade", args.grade))
      .collect();

    const duplicate = existingCourses.find(
      (course: any) =>
        course.section === args.section && course.name === args.name,
    );
    if (duplicate) {
      throw new Error(
        `Course ${args.name} ${args.section} already exists for academic year ${args.academicYear}`,
      );
    }

    const currentYear = new Date().getFullYear();
    if (args.academicYear < currentYear - 1) {
      throw new Error("Academic year cannot be more than 1 year in the past");
    }

    const now = Date.now();
    return await ctx.db.insert("courses", {
      ...args,
      institutionId: tenancy.institution._id,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateCourse = tenantMutation({
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
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, { courseId, ...updates }, tenancy) => {
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
      throw new Error("No permission to update this course");
    }

    if (updates.teacherId) {
      await validateTeacherMembership(
        ctx,
        updates.teacherId,
        tenancy.institution._id as Id<"institutionInfo">,
        tenancy.isMaster,
      );
    }

    await ctx.db.patch(courseId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(courseId);
  },
});

export const deleteCourse = tenantMutation({
  args: { courseId: v.id("courses") },
  roles: ["ADMIN", "STAFF", "MASTER"],
  handler: async (ctx, { courseId }, tenancy) => {
    const course = ensureInstitutionMatch(
      await ctx.db.get(courseId),
      tenancy,
      "Course not found",
    );

    await ctx.db.patch(course._id, {
      isActive: false,
      updatedAt: Date.now(),
    });

    const enrollments = await ctx.db
      .query("courseStudents")
      .withIndex("by_courseId", (q: any) => q.eq("courseId", courseId))
      .collect();

    await Promise.all(
      enrollments
        .filter(
          (enrollment: any) =>
            enrollment.institutionId === tenancy.institution._id,
        )
        .map((enrollment: any) =>
          ctx.db.patch(enrollment._id, {
            isActive: false,
          }),
        ),
    );

    return { success: true };
  },
});

export const enrollStudent = tenantMutation({
  args: {
    courseId: v.id("courses"),
    studentId: v.id("students"),
  },
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, { courseId, studentId }, tenancy) => {
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
      throw new Error("No permission to modify this course");
    }

    await validateStudentInInstitution(
      ctx,
      studentId,
      tenancy.institution._id as Id<"institutionInfo">,
    );

    const enrollments = await ctx.db
      .query("courseStudents")
      .withIndex("by_courseId", (q: any) => q.eq("courseId", courseId))
      .collect();

    const activeEnrollment = enrollments.find(
      (enrollment: any) =>
        enrollment.institutionId === tenancy.institution._id &&
        enrollment.studentId === studentId &&
        enrollment.isActive,
    );

    if (activeEnrollment) {
      throw new Error("Student is already enrolled in this course");
    }

    const activeCount = enrollments.filter(
      (enrollment: any) =>
        enrollment.institutionId === tenancy.institution._id &&
        enrollment.isActive,
    ).length;

    if (course.maxStudents && activeCount >= course.maxStudents) {
      throw new Error("Course has reached maximum capacity");
    }

    const now = Date.now();
    return await ctx.db.insert("courseStudents", {
      institutionId: tenancy.institution._id,
      courseId,
      studentId,
      enrollmentDate: now,
      isActive: true,
      createdAt: now,
    });
  },
});

export const removeStudent = tenantMutation({
  args: {
    courseId: v.id("courses"),
    studentId: v.id("students"),
  },
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, { courseId, studentId }, tenancy) => {
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
      throw new Error("No permission to modify this course");
    }

    const enrollments = await ctx.db
      .query("courseStudents")
      .withIndex("by_courseId", (q: any) => q.eq("courseId", courseId))
      .collect();

    const enrollment = enrollments.find(
      (record: any) =>
        record.institutionId === tenancy.institution._id &&
        record.studentId === studentId &&
        record.isActive,
    );

    if (!enrollment) {
      throw new Error("Student is not enrolled in this course");
    }

    await ctx.db.patch(enrollment._id, {
      isActive: false,
    });

    return { success: true };
  },
});

export const bulkEnrollStudents = tenantMutation({
  args: {
    courseId: v.id("courses"),
    studentIds: v.array(v.id("students")),
  },
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, { courseId, studentIds }, tenancy) => {
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
      throw new Error("No permission to modify this course");
    }

    const results: Array<
      | {
          studentId: Id<"students">;
          enrollmentId?: Id<"courseStudents">;
          success: boolean;
        }
      | { studentId: Id<"students">; error: string }
    > = [];

    for (const studentId of studentIds) {
      try {
        await validateStudentInInstitution(
          ctx,
          studentId,
          tenancy.institution._id as Id<"institutionInfo">,
        );

        const existingEnrollment = await ctx.db
          .query("courseStudents")
          .withIndex("by_courseId", (q: any) => q.eq("courseId", courseId))
          .filter((q: any) => q.eq("studentId", studentId))
          .first();

        if (existingEnrollment && existingEnrollment.isActive) {
          throw new Error("Student is already enrolled in this course");
        }

        if (course.maxStudents) {
          const activeCount = await ctx.db
            .query("courseStudents")
            .withIndex("by_courseId", (q: any) => q.eq("courseId", courseId))
            .filter((q: any) => q.eq("isActive", true))
            .collect();

          const scopedActive = activeCount.filter(
            (record: any) => record.institutionId === tenancy.institution._id,
          ).length;

          if (scopedActive >= course.maxStudents) {
            throw new Error("Course has reached maximum capacity");
          }
        }

        const now = Date.now();
        const enrollmentId = await ctx.db.insert("courseStudents", {
          institutionId: tenancy.institution._id,
          courseId,
          studentId,
          enrollmentDate: now,
          isActive: true,
          createdAt: now,
        });

        results.push({ studentId, enrollmentId, success: true });
      } catch (error: any) {
        results.push({ studentId, error: error.message });
      }
    }

    return { results };
  },
});

export const bulkRemoveStudents = tenantMutation({
  args: {
    courseId: v.id("courses"),
    studentIds: v.array(v.id("students")),
  },
  roles: ["ADMIN", "STAFF", "PROFESOR", "MASTER"],
  handler: async (ctx, { courseId, studentIds }, tenancy) => {
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
      throw new Error("No permission to modify this course");
    }

    const results: Array<
      | { studentId: Id<"students">; success: boolean }
      | { studentId: Id<"students">; error: string }
    > = [];

    for (const studentId of studentIds) {
      try {
        const enrollment = await ctx.db
          .query("courseStudents")
          .withIndex("by_courseId", (q: any) => q.eq("courseId", courseId))
          .filter((q: any) => q.eq("studentId", studentId))
          .first();

        if (
          !enrollment ||
          enrollment.institutionId !== tenancy.institution._id ||
          !enrollment.isActive
        ) {
          throw new Error("Student not enrolled in this course");
        }

        await ctx.db.patch(enrollment._id, {
          isActive: false,
        });

        results.push({ studentId, success: true });
      } catch (error: any) {
        results.push({ studentId, error: error.message });
      }
    }

    return { results };
  },
});
