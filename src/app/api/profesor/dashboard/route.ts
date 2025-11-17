import { NextRequest } from "next/server";
import { getAuthenticatedConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { createApiRoute } from "@/lib/api-validation";
import { createSuccessResponse } from "@/lib/api-error";
import { Id, type Doc } from "@/convex/_generated/dataModel";

// GET /api/profesor/dashboard - Teacher dashboard metrics
export const GET = createApiRoute(
  async (request, validated) => {
    const session = validated.session;

    // Validate teacherId - must be present and non-empty
    if (!session?.user?.id) {
      throw new Error("User ID is required");
    }

    const teacherId = session.user.id as unknown as Id<"users">;
    const client = await getAuthenticatedConvexClient();

    // Optimized parallel queries for teacher data with error handling
    const [teacherInfo, studentsData, planningData, meetingsData, coursesData] =
      await Promise.allSettled([
        // Teacher basic info
        client.query(api.users.getUserById, { userId: teacherId }),

        // Students managed by teacher
        client.query(api.students.getStudents, {
          teacherId,
          isActive: true,
        }),

        // All planning documents by teacher
        client.query(api.planning.getPlanningDocuments, {
          authorId: teacherId,
        }),

        // All meetings assigned to teacher
        client.query(api.meetings.getMeetingsByTeacher, {
          teacherId,
        }),

        // All courses taught by teacher
        client.query(api.courses.getCourses, {
          teacherId,
          isActive: true,
        }),
      ]);

    // Extract results and handle errors
    const teacherResult =
      teacherInfo.status === "fulfilled" ? teacherInfo.value : null;
    const studentsResult =
      studentsData.status === "fulfilled" ? studentsData.value : [];
    const planningResult =
      planningData.status === "fulfilled" ? planningData.value : [];
    const meetingsResult =
      meetingsData.status === "fulfilled" ? meetingsData.value : [];
    const coursesResult =
      coursesData.status === "fulfilled" ? coursesData.value : [];

    // Log any errors for debugging
    if (teacherInfo.status === "rejected") {
      console.error("Error fetching teacher info:", teacherInfo.reason);
    }
    if (studentsData.status === "rejected") {
      console.error("Error fetching students data:", studentsData.reason);
    }
    if (planningData.status === "rejected") {
      console.error("Error fetching planning data:", planningData.reason);
    }
    if (meetingsData.status === "rejected") {
      console.error("Error fetching meetings data:", meetingsData.reason);
    }
    if (coursesData.status === "rejected") {
      console.error("Error fetching courses data:", coursesData.reason);
    }

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Filter meetings
    const upcomingMeetings = meetingsResult.filter(
      (m) => m.scheduledDate >= now,
    ).length;
    const recentMeetings = meetingsResult.filter(
      (m) => m.createdAt >= sevenDaysAgo,
    ).length;

    // Get recent planning documents
    const planningDocuments = planningResult as Doc<"planningDocuments">[];
    const recentActivity = planningDocuments.slice(0, 5); // Already sorted by updatedAt desc

    // Get OA coverage statistics for all teacher's courses
    const coverageStatsByCourse = await Promise.all(
      coursesResult.map(async (course) => {
        try {
          const stats = await client.query(
            api.learningObjectives.getCoverageStatistics,
            { courseId: course._id },
          );
          return {
            courseId: course._id,
            courseName: course.name,
            ...stats,
          };
        } catch (error) {
          console.error(
            `Error getting coverage stats for course ${course._id}:`,
            error,
          );
          return {
            courseId: course._id,
            courseName: course.name,
            total: 0,
            noIniciado: 0,
            enProgreso: 0,
            cubierto: 0,
            reforzado: 0,
            percentage: 0,
          };
        }
      }),
    );

    // Aggregate OA statistics across all courses
    const totalOA = coverageStatsByCourse.reduce(
      (sum, stats) => sum + stats.total,
      0,
    );
    const totalNoIniciado = coverageStatsByCourse.reduce(
      (sum, stats) => sum + stats.noIniciado,
      0,
    );
    const totalEnProgreso = coverageStatsByCourse.reduce(
      (sum, stats) => sum + stats.enProgreso,
      0,
    );
    const totalCubierto = coverageStatsByCourse.reduce(
      (sum, stats) => sum + stats.cubierto,
      0,
    );
    const totalReforzado = coverageStatsByCourse.reduce(
      (sum, stats) => sum + stats.reforzado,
      0,
    );
    const overallCoveragePercentage =
      totalOA > 0
        ? Math.round(((totalCubierto + totalReforzado) / totalOA) * 100 * 100) /
          100
        : 0;

    // Calculate student statistics
    const activeStudents = studentsResult;
    const averageAttendance =
      activeStudents.length > 0
        ? activeStudents.reduce((sum, s) => sum + (s.attendanceRate || 0), 0) /
          activeStudents.length
        : 0;
    const averageProgress =
      activeStudents.length > 0
        ? activeStudents.reduce(
            (sum, s) => sum + (s.academicProgress || 0),
            0,
          ) / activeStudents.length
        : 0;

    // Group students by grade for overview
    const studentsByGrade = activeStudents.reduce(
      (acc, student) => {
        const grade = student.grade || "Sin Grado";
        if (!acc[grade]) {
          acc[grade] = [];
        }
        acc[grade].push(student);
        return acc;
      },
      {} as Record<string, typeof activeStudents>,
    );

    const profesorDashboard = {
      teacher: teacherResult
        ? {
            id: teacherResult._id,
            name: teacherResult.name,
            email: teacherResult.email,
            createdAt: new Date(teacherResult.createdAt).toISOString(),
          }
        : null,

      overview: {
        totalStudents: activeStudents.length,
        totalGrades: Object.keys(studentsByGrade).length,
        planningDocuments: planningResult.length,
        upcomingMeetings,
        averageAttendance: Math.round(averageAttendance * 100) / 100,
        averageProgress: Math.round(averageProgress * 100) / 100,
      },

      students: {
        total: activeStudents.length,
        byGrade: Object.entries(studentsByGrade).map(
          ([gradeName, students]) => ({
            grade: gradeName,
            count: students.length,
            averageAttendance:
              students.length > 0
                ? Math.round(
                    (students.reduce(
                      (sum, s) => sum + (s.attendanceRate || 0),
                      0,
                    ) /
                      students.length) *
                      100,
                  ) / 100
                : 0,
            averageProgress:
              students.length > 0
                ? Math.round(
                    (students.reduce(
                      (sum, s) => sum + (s.academicProgress || 0),
                      0,
                    ) /
                      students.length) *
                      100,
                  ) / 100
                : 0,
          }),
        ),
        recentlyAdded: activeStudents
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 3)
          .map((s) => ({
            name: `${s.firstName} ${s.lastName}`,
            grade: s.grade || "Sin Grado",
          })),
      },

      planning: {
        totalDocuments: planningResult.length,
        recentDocuments: recentActivity.map(
          (doc: Doc<"planningDocuments">) => ({
            id: doc._id,
            title: doc.title,
            subject: doc.subject || "Sin Materia",
            grade: doc.grade || "Sin Grado",
            lastUpdated: new Date(doc.updatedAt).toISOString(),
            isRecent: doc.updatedAt > sevenDaysAgo,
          }),
        ),
      },

      meetings: {
        upcoming: upcomingMeetings,
        recent: recentMeetings,
        needsAttention: upcomingMeetings > 5, // Alert if too many upcoming meetings
      },

      quickStats: {
        studentsNeedingAttention: activeStudents.filter(
          (s) =>
            (s.attendanceRate || 0) < 0.8 || (s.academicProgress || 0) < 60,
        ).length,
        documentsThisWeek: recentActivity.filter(
          (doc: Doc<"planningDocuments">) => doc.updatedAt > sevenDaysAgo,
        ).length,
        averageClassSize:
          activeStudents.length /
          Math.max(Object.keys(studentsByGrade).length, 1),
      },

      learningObjectives: {
        totalCourses: coursesResult.length,
        overallCoverage: overallCoveragePercentage,
        totalOA,
        coverageByStatus: {
          noIniciado: totalNoIniciado,
          enProgreso: totalEnProgreso,
          cubierto: totalCubierto,
          reforzado: totalReforzado,
        },
        byCourse: coverageStatsByCourse.map((stats) => ({
          courseId: stats.courseId,
          courseName: stats.courseName,
          total: stats.total,
          coverage: stats.percentage,
          cubierto: stats.cubierto,
          reforzado: stats.reforzado,
        })),
      },

      lastUpdated: new Date().toISOString(),
    };

    return createSuccessResponse(profesorDashboard);
  },
  {
    requiredRole: "TEACHER_PLUS",
  },
);

export const runtime = "nodejs";
