import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma, checkDatabaseConnection } from '@/lib/db';
import { createSuccessResponse, handleApiError } from '@/lib/api-error';

export const runtime = 'nodejs';

// GET /api/admin/dashboard - Get dashboard metrics for admin
export async function GET() {
  try {
    // Verify database connection health
    const isDbHealthy = await checkDatabaseConnection();
    if (!isDbHealthy) {
      return handleApiError(new Error('Database connection failed'), 'GET /api/admin/dashboard');
    }

    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return handleApiError(new Error('Unauthorized access'), 'GET /api/admin/dashboard');
    }

    // Get user statistics
    const [
      totalUsers,
      activeUsers,
      adminUsers,
      profesorUsers,
      parentUsers,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'PROFESOR' } }),
      prisma.user.count({ where: { role: 'PARENT' } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    // Get meeting statistics
    const [totalMeetings, upcomingMeetings, recentMeetings] = await Promise.all(
      [
        prisma.meeting.count(),
        prisma.meeting.count({
          where: {
            scheduledDate: {
              gte: new Date(),
            },
          },
        }),
        prisma.meeting.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
      ]
    );

    // Get document statistics
    const [totalDocuments, recentDocuments] = await Promise.all([
      prisma.planningDocument.count(),
      prisma.planningDocument.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    // Get team member statistics
    const [totalTeamMembers, activeTeamMembers] = await Promise.all([
      prisma.teamMember.count(),
      prisma.teamMember.count({ where: { isActive: true } }),
    ]);

    // Get recent calendar events
    const upcomingEvents = await prisma.calendarEvent.findMany({
      where: {
        startDate: {
          gte: new Date(),
        },
      },
      take: 5,
      orderBy: {
        startDate: 'asc',
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        category: true,
      },
    });

    // Get recent planning documents
    const recentPlannings = await prisma.planningDocument.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    const dashboardData = {
      users: {
        total: totalUsers,
        active: activeUsers,
        admins: adminUsers,
        profesores: profesorUsers,
        parents: parentUsers,
        recent: recentUsers,
      },
      meetings: {
        total: totalMeetings,
        upcoming: upcomingMeetings,
        recent: recentMeetings,
      },
      documents: {
        total: totalDocuments,
        recent: recentDocuments,
      },
      team: {
        total: totalTeamMembers,
        active: activeTeamMembers,
      },
      calendar: {
        upcomingEvents,
      },
      planning: {
        recent: recentPlannings,
      },
      system: {
        status: 'healthy',
        lastUpdated: new Date().toISOString(),
      },
    };

    return createSuccessResponse(dashboardData);
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/dashboard');
  }
}
