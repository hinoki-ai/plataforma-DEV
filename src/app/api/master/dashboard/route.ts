import { NextRequest } from "next/server";
import { getAuthenticatedConvexClient } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";
import { createApiRoute, REQUIRED_ROLES } from "@/lib/api-validation";
import { createSuccessResponse } from "@/lib/api-error";

// GET /api/master/dashboard - MASTER system overview
export const GET = createApiRoute(
  async (request, validated) => {
    const client = await getAuthenticatedConvexClient();

    // Parallel system metrics queries for maximum performance
    // Add error handling to identify which query is failing
    const queryPromises = [
      // System health metrics
      Promise.resolve({
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV,
      }),

      // User analytics - wrapped for error tracking
      client.query(api.users.getUsers, { isActive: true }).catch((error) => {
        console.error("Dashboard: getUsers query failed:", error);
        throw new Error(`getUsers query failed: ${error.message}`);
      }),

      // Content metrics - wrapped for error tracking
      client.query(api.calendar.getCalendarEvents, {}).catch((error) => {
        console.error("Dashboard: getCalendarEvents query failed:", error);
        throw new Error(`getCalendarEvents query failed: ${error.message}`);
      }),
      client.query(api.planning.getPlanningDocuments, {}).catch((error) => {
        console.error("Dashboard: getPlanningDocuments query failed:", error);
        throw new Error(`getPlanningDocuments query failed: ${error.message}`);
      }),
      client.query(api.meetings.getMeetings, {}).catch((error) => {
        console.error("Dashboard: getMeetings query failed:", error);
        throw new Error(`getMeetings query failed: ${error.message}`);
      }),
      client.query(api.media.getPhotos, {}).catch((error) => {
        console.error("Dashboard: getPhotos query failed:", error);
        throw new Error(`getPhotos query failed: ${error.message}`);
      }),
      client.query(api.media.getVideos, {}).catch((error) => {
        console.error("Dashboard: getVideos query failed:", error);
        throw new Error(`getVideos query failed: ${error.message}`);
      }),

      // Error tracking (will work once ErrorLog model is added)
      Promise.resolve({
        totalErrors: 0,
        criticalErrors: 0,
        recentErrors: 0,
      }),
    ];

    const [
      systemMetrics,
      allUsers,
      allEvents,
      allDocuments,
      allMeetings,
      allPhotos,
      allVideos,
      errorMetrics,
    ] = await Promise.all(queryPromises);

    // Performance metrics - not available (would need proper monitoring infrastructure)
    const performanceMetrics = {
      // These would be populated from actual monitoring tools like New Relic, DataDog, etc.
      avgResponseTime: null,
      throughput: null,
      activeConnections: null,
    };

    // Transform user metrics for easy consumption
    const usersByRole = allUsers.reduce(
      (acc: Record<string, number>, user: any) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Active users is the same as allUsers since we filter for active users
    const activeUsers = allUsers;

    const totalEvents = Array.isArray(allEvents)
      ? allEvents.length
      : (allEvents as any).events?.length || 0;
    const totalDocuments = allDocuments.length;
    const totalMeetings = (allMeetings as any).meetings?.length || 0;
    const totalPhotos = allPhotos.length;
    const totalVideos = allVideos.length;

    const masterDashboard = {
      timestamp: new Date().toISOString(),
      system: {
        status: "healthy",
        uptime: systemMetrics.uptime,
        memory: {
          used: Math.round(systemMetrics.memory.heapUsed / 1024 / 1024),
          total: Math.round(systemMetrics.memory.heapTotal / 1024 / 1024),
          external: Math.round(systemMetrics.memory.external / 1024 / 1024),
        },
        nodeVersion: systemMetrics.nodeVersion,
        environment: systemMetrics.environment,
      },

      users: {
        total: Object.values(usersByRole).reduce(
          (a: number, b: number) => a + b,
          0,
        ),
        breakdown: {
          master: usersByRole.MASTER || 0,
          admin: usersByRole.ADMIN || 0,
          profesor: usersByRole.PROFESOR || 0,
          parent: usersByRole.PARENT || 0,
        },
      },

      content: {
        events: totalEvents,
        documents: totalDocuments,
        meetings: totalMeetings,
        photos: totalPhotos,
        videos: totalVideos,
        total:
          totalEvents +
          totalDocuments +
          totalMeetings +
          totalPhotos +
          totalVideos,
      },

      errors: errorMetrics,

      // Note: Performance, security, and detailed database metrics require proper monitoring infrastructure
      // These would be populated from tools like New Relic, DataDog, CloudWatch, etc.
      performance: {
        avgResponseTime: null,
        throughput: null,
        activeConnections: null,
      },

      security: {
        // Real security metrics would come from security monitoring systems
        activeThreats: null,
        blockedAttempts: null,
        securityScore: null,
      },

      database: {
        status: "connected", // Basic connection status from Convex
        // Detailed metrics would require database monitoring tools
        connectionPoolSize: null,
        queryPerformance: null,
      },
    };

    return createSuccessResponse(masterDashboard);
  },
  {
    requiredRole: "MASTER_ONLY",
  },
);

export const runtime = "nodejs";
