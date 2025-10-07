import { NextRequest } from "next/server";
import {
  GET as getNotifications,
  POST as createNotification,
  PATCH as markAsRead,
} from "@/app/api/notifications/route";
import { GET as getStream } from "@/app/api/notifications/stream/route";

// Mock the auth function
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

// Mock the database
jest.mock("@/lib/db", () => ({
  prisma: {
    notification: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  },
}));

// Mock the stream functions
jest.mock("./stream/route", () => ({
  sendNotificationToUser: jest.fn(),
  broadcastNotification: jest.fn(),
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  sendNotificationToUser,
  broadcastNotification,
} from "@/app/api/notifications/stream/route";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockSendNotificationToUser =
  sendNotificationToUser as jest.MockedFunction<typeof sendNotificationToUser>;
const mockBroadcastNotification = broadcastNotification as jest.MockedFunction<
  typeof broadcastNotification
>;

describe("Notifications API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/notifications", () => {
    it("should return notifications for authenticated user", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          email: "user@test.com",
          role: "ADMIN",
          name: "Test User",
        },
      });

      const mockNotifications = [
        {
          id: "notif-1",
          title: "Test Notification",
          message: "This is a test",
          type: "INFO",
          category: "SYSTEM",
          priority: "MEDIUM",
          read: false,
          createdAt: new Date(),
        },
      ];

      mockPrisma.notification.findMany.mockResolvedValue(mockNotifications);
      mockPrisma.notification.count.mockResolvedValue(1);

      const request = new NextRequest(
        "http://localhost:3000/api/notifications",
      );
      const response = await getNotifications(request);

      expect(response).toBeDefined();
      expect(mockAuth).toHaveBeenCalled();
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            recipientId: "user-1",
          }),
          orderBy: { createdAt: "desc" },
          take: 50,
          skip: 0,
        }),
      );
    });

    it("should filter unread notifications", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          email: "user@test.com",
          role: "ADMIN",
        },
      });

      mockPrisma.notification.findMany.mockResolvedValue([]);
      mockPrisma.notification.count.mockResolvedValue(0);

      const request = new NextRequest(
        "http://localhost:3000/api/notifications?status=unread",
      );
      const response = await getNotifications(request);

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            recipientId: "user-1",
            read: false,
          }),
        }),
      );
    });

    it("should handle pagination", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          email: "user@test.com",
          role: "ADMIN",
        },
      });

      mockPrisma.notification.findMany.mockResolvedValue([]);
      mockPrisma.notification.count.mockResolvedValue(0);

      const request = new NextRequest(
        "http://localhost:3000/api/notifications?page=2&limit=10",
      );
      const response = await getNotifications(request);

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 10, // (page - 1) * limit = (2 - 1) * 10 = 10
        }),
      );
    });
  });

  describe("POST /api/notifications", () => {
    it("should create a broadcast notification for admin", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-1",
          email: "admin@test.com",
          role: "ADMIN",
          name: "Admin User",
        },
      });

      mockPrisma.user.findMany.mockResolvedValue([
        { id: "user-1" },
        { id: "user-2" },
        { id: "user-3" },
      ]);

      mockPrisma.notification.create
        .mockResolvedValueOnce({
          id: "notif-1",
          recipientId: "user-1",
          title: "Broadcast Test",
          message: "This is a broadcast",
          type: "INFO",
          senderId: "admin-1",
        })
        .mockResolvedValueOnce({
          id: "notif-2",
          recipientId: "user-2",
          title: "Broadcast Test",
          message: "This is a broadcast",
          type: "INFO",
          senderId: "admin-1",
        })
        .mockResolvedValueOnce({
          id: "notif-3",
          recipientId: "user-3",
          title: "Broadcast Test",
          message: "This is a broadcast",
          type: "INFO",
          senderId: "admin-1",
        });

      const request = new NextRequest(
        "http://localhost:3000/api/notifications",
        {
          method: "POST",
          body: JSON.stringify({
            title: "Broadcast Test",
            message: "This is a broadcast",
            type: "info",
            isBroadcast: true,
          }),
        },
      );

      const response = await createNotification(request);

      expect(response).toBeDefined();
      expect(mockPrisma.user.findMany).toHaveBeenCalled();
      expect(mockPrisma.notification.create).toHaveBeenCalledTimes(3);
      expect(mockBroadcastNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          title: "Broadcast Test",
          message: "This is a broadcast",
          type: "info",
        }),
      );
    });

    it("should create targeted notifications", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-1",
          email: "admin@test.com",
          role: "ADMIN",
        },
      });

      mockPrisma.notification.create
        .mockResolvedValueOnce({
          id: "notif-1",
          recipientId: "user-1",
          title: "Targeted Test",
          message: "This is targeted",
          type: "SUCCESS",
          senderId: "admin-1",
        })
        .mockResolvedValueOnce({
          id: "notif-2",
          recipientId: "user-2",
          title: "Targeted Test",
          message: "This is targeted",
          type: "SUCCESS",
          senderId: "admin-1",
        });

      const request = new NextRequest(
        "http://localhost:3000/api/notifications",
        {
          method: "POST",
          body: JSON.stringify({
            title: "Targeted Test",
            message: "This is targeted",
            type: "success",
            recipientIds: ["user-1", "user-2"],
          }),
        },
      );

      const response = await createNotification(request);

      expect(mockPrisma.notification.create).toHaveBeenCalledTimes(2);
      expect(mockSendNotificationToUser).toHaveBeenCalledTimes(2);
    });

    it("should reject non-admin users", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "parent-1",
          email: "parent@test.com",
          role: "PARENT",
        },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/notifications",
        {
          method: "POST",
          body: JSON.stringify({
            title: "Test",
            message: "Test message",
            type: "info",
          }),
        },
      );

      const response = await createNotification(request);

      expect(response.status).toBe(403);
    });

    it("should validate notification data", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-1",
          email: "admin@test.com",
          role: "ADMIN",
        },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/notifications",
        {
          method: "POST",
          body: JSON.stringify({
            // Missing required fields
            type: "info",
          }),
        },
      );

      const response = await createNotification(request);

      expect(response.status).toBe(400);
    });
  });

  describe("PATCH /api/notifications", () => {
    it("should mark specific notifications as read", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          email: "user@test.com",
          role: "ADMIN",
        },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/notifications",
        {
          method: "PATCH",
          body: JSON.stringify({
            notificationIds: ["notif-1", "notif-2"],
          }),
        },
      );

      const response = await markAsRead(request);

      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: ["notif-1", "notif-2"] },
          recipientId: "user-1",
        },
        data: {
          read: true,
          readAt: expect.any(Date),
        },
      });
    });

    it("should mark all notifications as read", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          email: "user@test.com",
          role: "ADMIN",
        },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/notifications",
        {
          method: "PATCH",
          body: JSON.stringify({
            markAll: true,
          }),
        },
      );

      const response = await markAsRead(request);

      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          recipientId: "user-1",
          read: false,
        },
        data: {
          read: true,
          readAt: expect.any(Date),
        },
      });
    });
  });

  describe("GET /api/notifications/stream", () => {
    it("should establish SSE connection for authenticated user", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-1",
          email: "user@test.com",
          role: "ADMIN",
        },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/notifications/stream",
      );
      const response = await getStream(request);

      expect(response).toBeDefined();
      expect(response.headers.get("Content-Type")).toBe("text/event-stream");
      expect(response.headers.get("Cache-Control")).toBe("no-cache");
    });

    it("should reject unauthenticated users", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/notifications/stream",
      );
      const response = await getStream(request);

      expect(response.status).toBe(401);
    });
  });
});
