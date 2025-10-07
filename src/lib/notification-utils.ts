// Notification utility functions for Server-Sent Events
// Store active connections for cleanup
const clients = new Map<
  string,
  { controller: ReadableStreamDefaultController; userId: string }
>();

export { clients };

// Function to send notifications to specific users
export async function sendNotificationToUser(
  userId: string,
  notification: any,
) {
  const client = clients.get(userId);
  if (client) {
    try {
      const encoder = new TextEncoder();
      const data = `data: ${JSON.stringify({
        type: "notification",
        ...notification,
        timestamp: new Date().toISOString(),
      })}\n\n`;

      client.controller.enqueue(encoder.encode(data));
    } catch (error) {
      // Client connection might be closed
      clients.delete(userId);
    }
  }
}

// Function to broadcast to all connected users (for system-wide notifications)
export async function broadcastNotification(notification: any) {
  const encoder = new TextEncoder();
  const data = `data: ${JSON.stringify({
    type: "notification",
    ...notification,
    timestamp: new Date().toISOString(),
  })}\n\n`;

  for (const [userId, client] of clients.entries()) {
    try {
      client.controller.enqueue(encoder.encode(data));
    } catch (error) {
      // Client connection might be closed
      clients.delete(userId);
    }
  }
}

// Function to register a client connection
export function registerClient(
  userId: string,
  controller: ReadableStreamDefaultController,
) {
  clients.set(userId, { controller, userId });
}

// Function to unregister a client connection
export function unregisterClient(userId: string) {
  clients.delete(userId);
}
