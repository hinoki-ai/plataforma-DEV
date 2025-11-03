/**
 * Libro de Clases Export Queries
 * Aggregates all libro de clases data for PDF export
 */

import { v } from "convex/values";
import { tenantQuery } from "./tenancy";
import { Id, Doc } from "./_generated/dataModel";

// ==================== QUERIES ====================

/**
 * Get libro de clases data for PDF export
 * Aggregates attendance, grades, observations, content, and meetings
 */
export const getLibroClasesForExport = tenantQuery({
  args: {
    courseId: v.id("courses"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    period: v.optional(
      v.union(
        v.literal("PRIMER_SEMESTRE"),
        v.literal("SEGUNDO_SEMESTRE"),
        v.literal("ANUAL"),
      ),
    ),
  },
  handler: async (ctx, { courseId, startDate, endDate, period }, tenancy) => {
    // Get course details
    const course = await ctx.db.get(courseId);
    if (!course || course.institutionId !== tenancy.institution._id) {
      throw new Error("Course not found");
    }

    // Get teacher info
    const teacher = await ctx.db.get(course.teacherId);
    const teacherName = teacher?.name || "Sin asignar";

    // Get enrolled students
    const enrollments = await ctx.db
      .query("courseStudents")
      .withIndex("by_courseId_isActive", (q: any) =>
        q.eq("courseId", courseId).eq("isActive", true),
      )
      .collect();

    const studentsData = await Promise.all(
      enrollments.map(async (enrollment: Doc<"courseStudents">) => {
        const student = await ctx.db.get(enrollment.studentId);
        if (!student) return null;

        // Get attendance
        let attendance = await ctx.db
          .query("classAttendance")
          .withIndex("by_studentId_date", (q: any) =>
            q.eq("studentId", enrollment.studentId),
          )
          .collect();

        attendance = attendance.filter(
          (a: Doc<"classAttendance">) => a.courseId === courseId,
        );
        if (startDate)
          attendance = attendance.filter(
            (a: Doc<"classAttendance">) => a.date >= startDate,
          );
        if (endDate)
          attendance = attendance.filter(
            (a: Doc<"classAttendance">) => a.date <= endDate,
          );

        // Get grades
        let grades = await ctx.db
          .query("classGrades")
          .withIndex("by_studentId_subject", (q: any) =>
            q.eq("studentId", enrollment.studentId),
          )
          .collect();

        grades = grades.filter(
          (g: Doc<"classGrades">) => g.courseId === courseId,
        );
        if (startDate)
          grades = grades.filter(
            (g: Doc<"classGrades">) => g.date >= startDate,
          );
        if (endDate)
          grades = grades.filter((g: Doc<"classGrades">) => g.date <= endDate);
        if (period)
          grades = grades.filter(
            (g: Doc<"classGrades">) => g.period === period,
          );

        // Get observations
        let observations = await ctx.db
          .query("studentObservations")
          .withIndex("by_studentId_date", (q: any) =>
            q.eq("studentId", enrollment.studentId),
          )
          .collect();

        observations = observations.filter(
          (o: Doc<"studentObservations">) => o.courseId === courseId,
        );
        if (startDate)
          observations = observations.filter(
            (o: Doc<"studentObservations">) => o.date >= startDate,
          );
        if (endDate)
          observations = observations.filter(
            (o: Doc<"studentObservations">) => o.date <= endDate,
          );

        return {
          id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          attendance: attendance.map((a: Doc<"classAttendance">) => ({
            date: new Date(a.date).toISOString(),
            status: a.status,
            subject: a.subject,
            observation: a.observation,
          })),
          grades: grades.map((g: Doc<"classGrades">) => ({
            date: new Date(g.date).toISOString(),
            subject: g.subject,
            evaluationName: g.evaluationName,
            grade: g.grade,
            maxGrade: g.maxGrade,
            period: g.period,
          })),
          observations: observations.map((o: Doc<"studentObservations">) => ({
            date: new Date(o.date).toISOString(),
            type: o.type,
            category: o.category,
            observation: o.observation,
            severity: o.severity,
          })),
        };
      }),
    );

    // Get class content
    let classContent = await ctx.db
      .query("classContent")
      .withIndex("by_courseId_date", (q: any) => q.eq("courseId", courseId))
      .collect();

    if (startDate)
      classContent = classContent.filter(
        (c: Doc<"classContent">) => c.date >= startDate,
      );
    if (endDate)
      classContent = classContent.filter(
        (c: Doc<"classContent">) => c.date <= endDate,
      );

    const classContentData = await Promise.all(
      classContent.map(async (content: Doc<"classContent">) => {
        const teacherInfo = await ctx.db.get(content.teacherId);
        return {
          date: new Date(content.date).toISOString(),
          subject: content.subject,
          topic: content.topic,
          content: content.content,
          teacherName: teacherInfo?.name || "Sin asignar",
        };
      }),
    );

    // Get parent meetings attendance
    let meetings = await ctx.db.query("parentMeetingAttendance").collect();

    meetings = meetings.filter(
      (m: Doc<"parentMeetingAttendance">) => m.courseId === courseId,
    );
    if (startDate)
      meetings = meetings.filter(
        (m: Doc<"parentMeetingAttendance">) => m.meetingDate >= startDate,
      );
    if (endDate)
      meetings = meetings.filter(
        (m: Doc<"parentMeetingAttendance">) => m.meetingDate <= endDate,
      );

    // Aggregate meetings by date
    const meetingMap = new Map<
      number,
      {
        date: number;
        meetingNumber: number;
        studentsPresent: number;
      }
    >();

    meetings.forEach((meeting: Doc<"parentMeetingAttendance">) => {
      const existing = meetingMap.get(meeting.meetingDate);
      if (existing) {
        if (meeting.attended) {
          existing.studentsPresent++;
        }
      } else {
        meetingMap.set(meeting.meetingDate, {
          date: meeting.meetingDate,
          meetingNumber: meeting.meetingNumber,
          studentsPresent: meeting.attended ? 1 : 0,
        });
      }
    });

    const meetingsData = Array.from(meetingMap.values()).map((m) => ({
      date: new Date(m.date).toISOString(),
      meetingNumber: m.meetingNumber,
      studentsPresent: m.studentsPresent,
    }));

    // Return aggregated data
    return {
      institution: {
        name: tenancy.institution.name,
        address: tenancy.institution.address,
        phone: tenancy.institution.phone,
        email: tenancy.institution.email,
        logoUrl: tenancy.institution.logoUrl,
      },
      course: {
        name: course.name,
        level: course.level,
        grade: course.grade,
        section: course.section,
        academicYear: course.academicYear,
        teacherName,
      },
      students: studentsData.filter((s) => s !== null),
      classContent: classContentData,
      meetings: meetingsData,
      metadata: {
        exportDate: new Date().toISOString(),
        reportType: period
          ? `Período: ${period}`
          : startDate && endDate
            ? `Rango: ${new Date(startDate).toLocaleDateString("es-CL")} - ${new Date(endDate).toLocaleDateString("es-CL")}`
            : "Año Completo",
        academicYear: course.academicYear,
      },
    };
  },
});

/**
 * Get libro de clases data for a specific student
 */
export const getStudentLibroForExport = tenantQuery({
  args: {
    studentId: v.id("students"),
    courseId: v.optional(v.id("courses")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { studentId, courseId, startDate, endDate },
    tenancy,
  ) => {
    const student = await ctx.db.get(studentId);
    if (!student || student.institutionId !== tenancy.institution._id) {
      throw new Error("Student not found");
    }

    // Get courses
    const coursesList = courseId
      ? [await ctx.db.get(courseId)]
      : await ctx.db
          .query("courses")
          .withIndex("by_institutionId", (q: any) =>
            q.eq("institutionId", tenancy.institution._id),
          )
          .collect();

    const courses = coursesList.filter(
      (c: Doc<"courses"> | null): c is Doc<"courses"> => c !== null,
    );

    const allData = {
      institution: {
        name: tenancy.institution.name,
        address: tenancy.institution.address,
        phone: tenancy.institution.phone,
        email: tenancy.institution.email,
        logoUrl: tenancy.institution.logoUrl,
      },
      student: {
        firstName: student.firstName,
        lastName: student.lastName,
        grade: student.grade,
      },
      courses: [] as Array<{
        courseName: string;
        courseLevel: string;
        courseGrade: string;
        courseSection: string;
        teacherName: string;
        attendance: Array<{ date: string; status: string; subject: string }>;
        grades: Array<{
          date: string;
          subject: string;
          evaluationName: string;
          grade: number;
          maxGrade: number;
          period: string;
        }>;
        observations: Array<{
          date: string;
          type: string;
          category: string;
          observation: string;
          severity?: string;
        }>;
      }>,
    };

    for (const course of courses) {
      // Get enrollments to verify student is in course
      const enrollment = await ctx.db
        .query("courseStudents")
        .withIndex("by_courseId", (q: any) => q.eq("courseId", course._id))
        .collect();

      const isEnrolled = enrollment.some(
        (e: Doc<"courseStudents">) => e.studentId === studentId && e.isActive,
      );

      if (!isEnrolled) continue;

      const teacher = await ctx.db.get(course.teacherId);

      // Get attendance
      let attendance = await ctx.db
        .query("classAttendance")
        .withIndex("by_studentId_date", (q: any) =>
          q.eq("studentId", studentId),
        )
        .collect();

      attendance = attendance.filter(
        (a: Doc<"classAttendance">) => a.courseId === course._id,
      );
      if (startDate)
        attendance = attendance.filter(
          (a: Doc<"classAttendance">) => a.date >= startDate,
        );
      if (endDate)
        attendance = attendance.filter(
          (a: Doc<"classAttendance">) => a.date <= endDate,
        );

      // Get grades
      let grades = await ctx.db
        .query("classGrades")
        .withIndex("by_studentId_subject", (q: any) =>
          q.eq("studentId", studentId),
        )
        .collect();

      grades = grades.filter(
        (g: Doc<"classGrades">) => g.courseId === course._id,
      );
      if (startDate)
        grades = grades.filter((g: Doc<"classGrades">) => g.date >= startDate);
      if (endDate)
        grades = grades.filter((g: Doc<"classGrades">) => g.date <= endDate);

      // Get observations
      let observations = await ctx.db
        .query("studentObservations")
        .withIndex("by_studentId_date", (q: any) =>
          q.eq("studentId", studentId),
        )
        .collect();

      observations = observations.filter(
        (o: Doc<"studentObservations">) => o.courseId === course._id,
      );
      if (startDate)
        observations = observations.filter(
          (o: Doc<"studentObservations">) => o.date >= startDate,
        );
      if (endDate)
        observations = observations.filter(
          (o: Doc<"studentObservations">) => o.date <= endDate,
        );

      allData.courses.push({
        courseName: course.name,
        courseLevel: course.level,
        courseGrade: course.grade,
        courseSection: course.section,
        teacherName: teacher?.name || "Sin asignar",
        attendance: attendance.map((a: Doc<"classAttendance">) => ({
          date: new Date(a.date).toISOString(),
          status: a.status,
          subject: a.subject,
        })),
        grades: grades.map((g: Doc<"classGrades">) => ({
          date: new Date(g.date).toISOString(),
          subject: g.subject,
          evaluationName: g.evaluationName,
          grade: g.grade,
          maxGrade: g.maxGrade,
          period: g.period,
        })),
        observations: observations.map((o: Doc<"studentObservations">) => ({
          date: new Date(o.date).toISOString(),
          type: o.type,
          category: o.category,
          observation: o.observation,
          severity: o.severity,
        })),
      });
    }

    return allData;
  },
});
