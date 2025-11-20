import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAuthenticatedConvexClient } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import { createSuccessResponse, handleApiError } from "@/lib/api-error";

export const runtime = "nodejs";

// GET /api/admin/dashboard - Get dashboard metrics for admin
export async function GET() {
  try {
    const client = await getAuthenticatedConvexClient();
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return handleApiError(
        new Error("Unauthorized access"),
        "GET /api/admin/dashboard",
      );
    }

    // Get user statistics
    const userStats = await client.query(api.users.getUserStats, {});

    // Get meeting statistics
    const meetingStats = await client.query(api.meetings.getMeetingStats, {});

    // Get document statistics
    const documentStats = await client.query(api.planning.getDocumentStats, {});

    // Get team member statistics
    const teamStats = await client.query(
      api.teamMembers.getTeamMemberStats,
      {},
    );

    // Get recent calendar events
    const upcomingEvents = await client.query(api.calendar.getUpcomingEvents, {
      limit: 5,
    });

    // Get recent planning documents
    const recentPlannings = await client.query(
      api.planning.getRecentDocumentsCount,
      {},
    );

    // Get all active courses for OA statistics
    const allCourses = await client.query(api.courses.getCourses, {
      isActive: true,
    });

    // Get OA coverage statistics for all courses
    const coverageStatsByCourse = await Promise.all(
      allCourses.map(async (course) => {
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

    const dashboardData = {
      users: userStats,
      meetings: meetingStats,
      documents: documentStats,
      team: teamStats,
      calendar: {
        upcomingEvents,
      },
      planning: {
        recent: recentPlannings,
      },
      learningObjectives: {
        totalCourses: allCourses.length,
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
      system: {
        status: "healthy",
        lastUpdated: new Date().toISOString(),
      },
    };

    return createSuccessResponse(dashboardData);
  } catch (error) {
    return handleApiError(error, "GET /api/admin/dashboard");
  }
}
