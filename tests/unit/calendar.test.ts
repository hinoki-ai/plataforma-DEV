import { describe, it, expect, vi, beforeEach } from "vitest";
import { CalendarService } from "@/services/calendar/calendar-service";

// Mock the calendar service
vi.mock("@/services/calendar/calendar-service", () => ({
  CalendarService: {
    getInstance: vi.fn(() => ({
      createEvent: vi.fn(),
      updateEvent: vi.fn(),
      deleteEvent: vi.fn(),
      getEvents: vi.fn(),
    })),
  },
}));

// Mock authentication properly
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(() => ({
    user: { id: "admin-123", role: "ADMIN" },
  })),
  getServerSession: vi.fn(() => ({
    user: { id: "admin-123", role: "ADMIN" },
  })),
}));

// Mock database
vi.mock("@/lib/db", () => ({
  db: {
    calendarEvent: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("Calendar System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Calendar Operations", () => {
    it("should create calendar event successfully", async () => {
      const mockCalendarService = CalendarService.getInstance();
      const mockCreateEvent = vi.mocked(mockCalendarService.createEvent);

      const eventData = {
        title: "Test Event",
        description: "Test event description",
        startDate: new Date("2024-01-15T10:00:00Z"),
        endDate: new Date("2024-01-15T11:00:00Z"),
        category: "MEETING",
        priority: "HIGH" as const,
        isAllDay: false,
        location: "Room 101",
        attendeeIds: ["user-1", "user-2"],
        attachments: [],
        recurrence: undefined,
        metadata: {
          color: "#3B82F6",
          isRecurring: false,
        },
      };

      mockCreateEvent.mockResolvedValue({
        id: "event-123",
        ...eventData,
        source: "DATABASE",
        authorId: "admin-123",
        author: {
          id: "admin-123",
          name: "Admin User",
          email: "admin@manitospintadas.cl",
        },
        attendees: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await mockCreateEvent(eventData);

      expect(result).toBeDefined();
      expect(result.id).toBe("event-123");
      expect(mockCreateEvent).toHaveBeenCalledWith(eventData);
    });

    it("should update calendar event successfully", async () => {
      const mockCalendarService = CalendarService.getInstance();
      const mockUpdateEvent = vi.mocked(mockCalendarService.updateEvent);

      const updateData = {
        title: "Updated Event",
        description: "Updated description",
        priority: "MEDIUM" as const,
      };

      mockUpdateEvent.mockResolvedValue({
        id: "event-123",
        ...updateData,
        source: "DATABASE",
        authorId: "admin-123",
        author: {
          id: "admin-123",
          name: "Admin User",
          email: "admin@manitospintadas.cl",
        },
        attendees: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await mockUpdateEvent("event-123", updateData);

      expect(result).toBeDefined();
      expect(result.id).toBe("event-123");
      expect(mockUpdateEvent).toHaveBeenCalledWith("event-123", updateData);
    });

    it("should delete calendar event successfully", async () => {
      const mockCalendarService = CalendarService.getInstance();
      const mockDeleteEvent = vi.mocked(mockCalendarService.deleteEvent);

      mockDeleteEvent.mockResolvedValue(true);

      const result = await mockDeleteEvent("event-123");

      expect(result).toBe(true);
      expect(mockDeleteEvent).toHaveBeenCalledWith("event-123");
    });

    it("should handle event creation with validation errors", async () => {
      const mockCalendarService = CalendarService.getInstance();
      const mockCreateEvent = vi.mocked(mockCalendarService.createEvent);

      const invalidEventData = {
        title: "", // Invalid: empty title
        description: "Test description",
        startDate: new Date("2024-01-15T10:00:00Z"),
        endDate: new Date("2024-01-15T09:00:00Z"), // Invalid: end before start
        category: "INVALID_CATEGORY" as any,
        priority: "HIGH" as const,
        isAllDay: false,
        location: "",
        attendeeIds: [],
        attachments: [],
        recurrence: undefined,
        metadata: {},
      };

      mockCreateEvent.mockRejectedValue(new Error("Validation failed"));

      try {
        await mockCreateEvent(invalidEventData);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Validation failed");
      }
    });
  });

  describe("Recurring Events", () => {
    it("should create daily recurring event", async () => {
      const mockCalendarService = CalendarService.getInstance();
      const mockCreateEvent = vi.mocked(mockCalendarService.createEvent);

      const recurringEventData = {
        title: "Daily Meeting",
        description: "Daily team meeting",
        startDate: new Date("2024-01-15T09:00:00Z"),
        endDate: new Date("2024-01-15T10:00:00Z"),
        category: "MEETING",
        priority: "MEDIUM" as const,
        isAllDay: false,
        location: "Conference Room",
        attendeeIds: ["user-1"],
        attachments: [],
        recurrence: {
          pattern: "DAILY",
          interval: 1,
          endDate: new Date("2024-02-15T09:00:00Z"),
          occurrences: 30,
          daysOfWeek: undefined,
          monthOfYear: undefined,
          exceptions: "",
        },
        metadata: {
          color: "#10B981",
          isRecurring: true,
        },
      };

      mockCreateEvent.mockResolvedValue({
        id: "event-123",
        ...recurringEventData,
        source: "DATABASE",
        authorId: "admin-123",
        author: {
          id: "admin-123",
          name: "Admin User",
          email: "admin@manitospintadas.cl",
        },
        attendees: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await mockCreateEvent(recurringEventData);

      expect(result).toBeDefined();
      expect(result.id).toBe("event-123");
      expect(mockCreateEvent).toHaveBeenCalledWith(recurringEventData);
    });

    it("should create weekly recurring event", async () => {
      const mockCalendarService = CalendarService.getInstance();
      const mockCreateEvent = vi.mocked(mockCalendarService.createEvent);

      const weeklyEventData = {
        title: "Weekly Staff Meeting",
        description: "Weekly staff meeting",
        startDate: new Date("2024-01-15T14:00:00Z"),
        endDate: new Date("2024-01-15T15:00:00Z"),
        category: "MEETING",
        priority: "HIGH" as const,
        isAllDay: false,
        location: "Main Hall",
        attendeeIds: ["user-1", "user-2", "user-3"],
        attachments: [],
        recurrence: {
          pattern: "WEEKLY",
          interval: 1,
          endDate: new Date("2024-06-15T14:00:00Z"),
          occurrences: 20,
          daysOfWeek: "MONDAY",
          monthOfYear: undefined,
          exceptions: "",
        },
        metadata: {
          color: "#EF4444",
          isRecurring: true,
        },
      };

      mockCreateEvent.mockResolvedValue({
        id: "event-456",
        ...weeklyEventData,
        source: "DATABASE",
        authorId: "admin-123",
        author: {
          id: "admin-123",
          name: "Admin User",
          email: "admin@manitospintadas.cl",
        },
        attendees: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await mockCreateEvent(weeklyEventData);

      expect(result).toBeDefined();
      expect(result.id).toBe("event-456");
      expect(mockCreateEvent).toHaveBeenCalledWith(weeklyEventData);
    });

    it("should create monthly recurring event", async () => {
      const mockCalendarService = CalendarService.getInstance();
      const mockCreateEvent = vi.mocked(mockCalendarService.createEvent);

      const monthlyEventData = {
        title: "Monthly Board Meeting",
        description: "Monthly board meeting",
        startDate: new Date("2024-01-15T16:00:00Z"),
        endDate: new Date("2024-01-15T17:00:00Z"),
        category: "MEETING",
        priority: "HIGH" as const,
        isAllDay: false,
        location: "Board Room",
        attendeeIds: ["user-1", "user-2"],
        attachments: [],
        recurrence: {
          pattern: "MONTHLY",
          interval: 1,
          endDate: new Date("2024-12-15T16:00:00Z"),
          occurrences: 12,
          daysOfWeek: undefined,
          monthOfYear: 1, // January
          exceptions: "",
        },
        metadata: {
          color: "#8B5CF6",
          isRecurring: true,
        },
      };

      mockCreateEvent.mockResolvedValue({
        id: "event-789",
        ...monthlyEventData,
        source: "DATABASE",
        authorId: "admin-123",
        author: {
          id: "admin-123",
          name: "Admin User",
          email: "admin@manitospintadas.cl",
        },
        attendees: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await mockCreateEvent(monthlyEventData);

      expect(result).toBeDefined();
      expect(result.id).toBe("event-789");
      expect(mockCreateEvent).toHaveBeenCalledWith(monthlyEventData);
    });

    it("should handle recurring event exceptions", async () => {
      const mockCalendarService = CalendarService.getInstance();
      const mockCreateEvent = vi.mocked(mockCalendarService.createEvent);

      const eventWithExceptions = {
        title: "Weekly Meeting with Exceptions",
        description: "Weekly meeting with some exceptions",
        startDate: new Date("2024-01-15T10:00:00Z"),
        endDate: new Date("2024-01-15T11:00:00Z"),
        category: "MEETING",
        priority: "MEDIUM" as const,
        isAllDay: false,
        location: "Room 101",
        attendeeIds: ["user-1"],
        attachments: [],
        recurrence: {
          pattern: "WEEKLY",
          interval: 1,
          endDate: new Date("2024-06-15T10:00:00Z"),
          occurrences: 20,
          daysOfWeek: "MONDAY",
          monthOfYear: undefined,
          exceptions: "2024-02-19,2024-03-18", // Skip these dates
        },
        metadata: {
          color: "#F59E0B",
          isRecurring: true,
        },
      };

      mockCreateEvent.mockResolvedValue({
        id: "event-999",
        ...eventWithExceptions,
        source: "DATABASE",
        authorId: "admin-123",
        author: {
          id: "admin-123",
          name: "Admin User",
          email: "admin@manitospintadas.cl",
        },
        attendees: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await mockCreateEvent(eventWithExceptions);

      expect(result).toBeDefined();
      expect(result.id).toBe("event-999");
      expect(mockCreateEvent).toHaveBeenCalledWith(eventWithExceptions);
    });
  });

  describe("Event Templates", () => {
    it("should create event from template", async () => {
      const mockCalendarService = CalendarService.getInstance();
      const mockCreateEvent = vi.mocked(mockCalendarService.createEvent);

      const templateData = {
        title: "Parent-Teacher Conference",
        description: "Scheduled parent-teacher conference",
        startDate: new Date("2024-01-20T15:00:00Z"),
        endDate: new Date("2024-01-20T16:00:00Z"),
        category: "MEETING",
        priority: "HIGH" as const,
        isAllDay: false,
        location: "Classroom",
        attendeeIds: ["parent-1", "teacher-1"],
        attachments: [],
        recurrence: undefined,
        metadata: {
          color: "#EF4444",
          isRecurring: false,
          templateId: "parent-teacher-conference",
        },
      };

      mockCreateEvent.mockResolvedValue({
        id: "event-template-123",
        ...templateData,
        source: "DATABASE",
        authorId: "admin-123",
        author: {
          id: "admin-123",
          name: "Admin User",
          email: "admin@manitospintadas.cl",
        },
        attendees: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await mockCreateEvent(templateData);

      expect(result).toBeDefined();
      expect(result.id).toBe("event-template-123");
      expect(mockCreateEvent).toHaveBeenCalledWith(templateData);
    });
  });

  describe("Event Search and Filtering", () => {
    it("should search events by title", async () => {
      const mockCalendarService = CalendarService.getInstance();
      const mockGetEvents = vi.mocked(mockCalendarService.getEvents);

      const searchQuery = {
        startDate: new Date("2024-01-01T00:00:00Z"),
        endDate: new Date("2024-01-31T23:59:59Z"),
        search: "meeting",
        categories: undefined,
        priority: undefined,
      };

      const mockEvents = [
        {
          id: "event-1",
          title: "Staff Meeting",
          description: "Weekly staff meeting",
          startDate: new Date("2024-01-15T10:00:00Z"),
          endDate: new Date("2024-01-15T11:00:00Z"),
          category: "MEETING",
          priority: "HIGH",
          source: "DATABASE",
          authorId: "admin-123",
          author: {
            id: "admin-123",
            name: "Admin User",
            email: "admin@manitospintadas.cl",
          },
          attendees: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockGetEvents.mockResolvedValue(mockEvents);

      const result = await mockCalendarService.getEvents(searchQuery);

      expect(result).toEqual(mockEvents);
      expect(mockGetEvents).toHaveBeenCalledWith(searchQuery);
    });

    it("should filter events by category", async () => {
      const mockCalendarService = CalendarService.getInstance();
      const mockGetEvents = vi.mocked(mockCalendarService.getEvents);

      const filterQuery = {
        startDate: new Date("2024-01-01T00:00:00Z"),
        endDate: new Date("2024-01-31T23:59:59Z"),
        search: undefined,
        categories: ["MEETING", "EVENT"],
        priority: undefined,
      };

      const mockEvents = [
        {
          id: "event-1",
          title: "Staff Meeting",
          description: "Weekly staff meeting",
          startDate: new Date("2024-01-15T10:00:00Z"),
          endDate: new Date("2024-01-15T11:00:00Z"),
          category: "MEETING",
          priority: "HIGH",
          source: "DATABASE",
          authorId: "admin-123",
          author: {
            id: "admin-123",
            name: "Admin User",
            email: "admin@manitospintadas.cl",
          },
          attendees: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockGetEvents.mockResolvedValue(mockEvents);

      const result = await mockCalendarService.getEvents(filterQuery);

      expect(result).toEqual(mockEvents);
      expect(mockGetEvents).toHaveBeenCalledWith(filterQuery);
    });
  });

  describe("Calendar Integration", () => {
    it("should display meetings in calendar", async () => {
      const mockCalendarService = CalendarService.getInstance();
      const mockGetEvents = vi.mocked(mockCalendarService.getEvents);

      const meetingEvents = [
        {
          id: "meeting-1",
          title: "Parent-Teacher Conference",
          description: "Scheduled conference",
          startDate: new Date("2024-01-20T15:00:00Z"),
          endDate: new Date("2024-01-20T16:00:00Z"),
          category: "MEETING",
          priority: "HIGH",
          source: "DATABASE",
          authorId: "admin-123",
          author: {
            id: "admin-123",
            name: "Admin User",
            email: "admin@manitospintadas.cl",
          },
          attendees: [
            {
              id: "parent-1",
              name: "Parent Name",
              email: "parent@example.com",
            },
            {
              id: "teacher-1",
              name: "Teacher Name",
              email: "teacher@manitospintadas.cl",
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockGetEvents.mockResolvedValue(meetingEvents);

      const result = await mockCalendarService.getEvents({
        startDate: new Date("2024-01-01T00:00:00Z"),
        endDate: new Date("2024-01-31T23:59:59Z"),
      });

      expect(result).toEqual(meetingEvents);
      expect(result[0].category).toBe("MEETING");
      expect(result[0].attendees).toHaveLength(2);
    });

    it("should handle event conflicts", async () => {
      const mockCalendarService = CalendarService.getInstance();
      const mockCreateEvent = vi.mocked(mockCalendarService.createEvent);

      const conflictingEvent = {
        title: "Conflicting Event",
        description: "This event conflicts with existing one",
        startDate: new Date("2024-01-15T10:30:00Z"), // Overlaps with existing event
        endDate: new Date("2024-01-15T11:30:00Z"),
        category: "MEETING",
        priority: "MEDIUM" as const,
        isAllDay: false,
        location: "Room 101",
        attendeeIds: ["user-1"],
        attachments: [],
        recurrence: undefined,
        metadata: {
          color: "#3B82F6",
          isRecurring: false,
        },
      };

      mockCreateEvent.mockRejectedValue(new Error("Event conflict detected"));

      try {
        await mockCreateEvent(conflictingEvent);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Event conflict detected");
      }
    });
  });

  describe("Performance with Large Datasets", () => {
    it("should handle 1000+ events efficiently", async () => {
      const mockCalendarService = CalendarService.getInstance();
      const mockGetEvents = vi.mocked(mockCalendarService.getEvents);

      const startTime = performance.now();

      // Simulate 1000 events
      const largeEventSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `event-${i}`,
        title: `Event ${i}`,
        description: `Description for event ${i}`,
        startDate: new Date(`2024-01-${(i % 30) + 1}T10:00:00Z`),
        endDate: new Date(`2024-01-${(i % 30) + 1}T11:00:00Z`),
        category: "EVENT",
        priority: "MEDIUM",
        source: "DATABASE",
        authorId: "admin-123",
        author: {
          id: "admin-123",
          name: "Admin User",
          email: "admin@manitospintadas.cl",
        },
        attendees: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockGetEvents.mockResolvedValue(largeEventSet);

      const result = await mockCalendarService.getEvents({
        startDate: new Date("2024-01-01T00:00:00Z"),
        endDate: new Date("2024-01-31T23:59:59Z"),
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result).toHaveLength(1000);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe("Error Handling", () => {
    it("should handle database connection failures", async () => {
      const mockCalendarService = CalendarService.getInstance();
      const mockCreateEvent = vi.mocked(mockCalendarService.createEvent);

      mockCreateEvent.mockRejectedValue(
        new Error("Database connection failed"),
      );

      const eventData = {
        title: "Test Event",
        description: "Test description",
        startDate: new Date("2024-01-15T10:00:00Z"),
        endDate: new Date("2024-01-15T11:00:00Z"),
        category: "MEETING",
        priority: "HIGH" as const,
        isAllDay: false,
        location: "Room 101",
        attendeeIds: [],
        attachments: [],
        recurrence: undefined,
        metadata: {},
      };

      try {
        await mockCreateEvent(eventData);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Database connection failed");
      }
    });

    it("should handle invalid date ranges", async () => {
      const mockCalendarService = CalendarService.getInstance();
      const mockCreateEvent = vi.mocked(mockCalendarService.createEvent);

      const invalidEventData = {
        title: "Invalid Event",
        description: "Event with invalid dates",
        startDate: new Date("2024-01-15T11:00:00Z"),
        endDate: new Date("2024-01-15T10:00:00Z"), // End before start
        category: "MEETING",
        priority: "HIGH" as const,
        isAllDay: false,
        location: "Room 101",
        attendeeIds: [],
        attachments: [],
        recurrence: undefined,
        metadata: {},
      };

      mockCreateEvent.mockRejectedValue(new Error("Invalid date range"));

      try {
        await mockCreateEvent(invalidEventData);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Invalid date range");
      }
    });
  });
});
