import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { createSuccessResponse, handleApiError } from '@/lib/api-error';

export const runtime = 'nodejs';

// GET /api/admin/dashboard - Get dashboard metrics for admin
export async function GET() {
  try {
    const client = getConvexClient();
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return handleApiError(new Error('Unauthorized access'), 'GET /api/admin/dashboard');
    }

    // Get user statistics
    const userStats = await client.query(api.users.getUserStats, {});

    // Get meeting statistics
    const meetingStats = await client.query(api.meetings.getMeetingStats, {});

    // Get document statistics
    const documentStats = await client.query(api.planning.getDocumentStats, {});

    // Get team member statistics
    const teamStats = await client.query(api.teamMembers.getTeamMemberStats, {});

    // Get recent calendar events
    const upcomingEvents = await client.query(api.calendar.getUpcomingEvents, {
      limit: 5,
    });

    // Get recent planning documents
    const recentPlannings = await client.query(api.planning.getRecentDocumentsCount, {});

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
