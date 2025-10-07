import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// SSE stream endpoint for real-time notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Create a ReadableStream for Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const data = `data: ${JSON.stringify({
          type: "connected",
          timestamp: new Date().toISOString(),
          userId: session.user.id,
        })}\n\n`;

        controller.enqueue(new TextEncoder().encode(data));

        // Set up a simple heartbeat to keep the connection alive
        const heartbeat = setInterval(() => {
          try {
            const heartbeatData = `data: ${JSON.stringify({
              type: "heartbeat",
              timestamp: new Date().toISOString(),
            })}\n\n`;
            controller.enqueue(new TextEncoder().encode(heartbeatData));
          } catch (error) {
            console.error("Error sending heartbeat:", error);
            clearInterval(heartbeat);
            controller.close();
          }
        }, 30000); // Send heartbeat every 30 seconds

        // Clean up on connection close
        request.signal.addEventListener("abort", () => {
          clearInterval(heartbeat);
          controller.close();
        });
      },
      cancel() {
        console.log("SSE stream cancelled for user:", session.user.id);
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
