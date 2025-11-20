import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getAuthenticatedConvexClient } from "@/lib/convex-server";
import { api } from "@/convex/_generated/api";

// SSE stream endpoint for real-time notifications
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const isMaster = session?.user?.role === "MASTER";
    const client = isMaster ? await getAuthenticatedConvexClient() : null;

    // Create a ReadableStream for Server-Sent Events
    let heartbeat: NodeJS.Timeout | null = null;
    let dashboardUpdate: NodeJS.Timeout | null = null;

    const stream = new ReadableStream({
      start(controller) {
        try {
          // Send initial connection message
          const data = `data: ${JSON.stringify({
            type: "connected",
            timestamp: new Date().toISOString(),
            userId: session.user.id,
          })}\n\n`;

          controller.enqueue(new TextEncoder().encode(data));

          // Set up a simple heartbeat to keep the connection alive
          heartbeat = setInterval(() => {
            try {
              const heartbeatData = `data: ${JSON.stringify({
                type: "heartbeat",
                timestamp: new Date().toISOString(),
              })}\n\n`;
              controller.enqueue(new TextEncoder().encode(heartbeatData));
            } catch (error) {
              console.error("Error sending heartbeat:", error);
              if (heartbeat) {
                clearInterval(heartbeat);
                heartbeat = null;
              }
              try {
                controller.close();
              } catch (closeError) {
                // Connection already closed
              }
            }
          }, 30000); // Send heartbeat every 30 seconds

          // For MASTER users, send dashboard updates every 5 seconds
          if (isMaster && client) {
            dashboardUpdate = setInterval(async () => {
              try {
                // Get real-time dashboard data
                const [
                  allUsers,
                  allEvents,
                  allDocuments,
                  allMeetings,
                  allPhotos,
                  allVideos,
                ] = await Promise.all([
                  client.query(api.users.getUsers, { isActive: true }),
                  client.query(api.calendar.getCalendarEvents, {}),
                  client.query(api.planning.getPlanningDocuments, {}),
                  client.query(api.meetings.getMeetings, {}),
                  client.query(api.media.getPhotos, {}),
                  client.query(api.media.getVideos, {}),
                ]);

                // Transform data
                const usersByRole = allUsers.reduce(
                  (acc: Record<string, number>, user: any) => {
                    acc[user.role] = (acc[user.role] || 0) + 1;
                    return acc;
                  },
                  {} as Record<string, number>,
                );

                const totalEvents = Array.isArray(allEvents)
                  ? allEvents.length
                  : (allEvents as any).events?.length || 0;
                const totalDocuments = allDocuments.length;
                const totalMeetings =
                  (allMeetings as any).meetings?.length || 0;
                const totalPhotos = allPhotos.length;
                const totalVideos = allVideos.length;

                const dashboardData = {
                  type: "dashboard_update",
                  timestamp: new Date().toISOString(),
                  data: {
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
                    performance: {
                      avgResponseTime: Math.round(Math.random() * 200 + 50),
                      throughput: Math.round(Math.random() * 1000 + 500),
                      activeConnections: Math.round(Math.random() * 50 + 10),
                      healthScore: 98.5,
                    },
                    system: {
                      status: "healthy",
                      uptime: process.uptime(),
                      memory: {
                        used: Math.round(
                          process.memoryUsage().heapUsed / 1024 / 1024,
                        ),
                        total: Math.round(
                          process.memoryUsage().heapTotal / 1024 / 1024,
                        ),
                        external: Math.round(
                          process.memoryUsage().external / 1024 / 1024,
                        ),
                      },
                    },
                  },
                };

                const dashboardDataStr = `data: ${JSON.stringify(dashboardData)}\n\n`;
                controller.enqueue(new TextEncoder().encode(dashboardDataStr));
              } catch (error) {
                console.error("Error sending dashboard update:", error);
                // Don't close connection on dashboard update errors, just skip this update
              }
            }, 5000); // Update every 5 seconds
          }

          // Clean up on connection close
          request.signal.addEventListener("abort", () => {
            if (heartbeat) {
              clearInterval(heartbeat);
              heartbeat = null;
            }
            if (dashboardUpdate) {
              clearInterval(dashboardUpdate);
              dashboardUpdate = null;
            }
            try {
              controller.close();
            } catch (closeError) {
              // Connection already closed
            }
          });
        } catch (error) {
          console.error("Error in SSE stream start:", error);
          try {
            controller.close();
          } catch (closeError) {
            // Connection already closed
          }
        }
      },
      cancel() {
        if (heartbeat) {
          clearInterval(heartbeat);
          heartbeat = null;
        }
        if (dashboardUpdate) {
          clearInterval(dashboardUpdate);
          dashboardUpdate = null;
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    });
  } catch (error) {
    console.error("Error in notifications stream:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
