import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const queryMock = vi.fn();
const mutationMock = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/convex", () => ({
  getConvexClient: vi.fn(() => ({
    query: queryMock,
    mutation: mutationMock,
  })),
}));

// Mock Convex API
vi.mock("../../../convex/_generated/api", () => ({
  api: {
    users: {
      getUserByEmail: {},
    },
    meetings: {
      getMeetingsByGuardian: {},
      requestMeeting: {},
    },
  },
}));

vi.mock("../../../convex/_generated/dataModel", () => ({
  Id: {},
}));

describe("Parent meetings API", () => {
  beforeEach(() => {
    vi.resetModules();
    authMock.mockReset();
    queryMock.mockReset();
    mutationMock.mockReset();
    authMock.mockResolvedValue({
      user: {
        id: "user_123" as const,
        email: "parent@example.com",
        name: "María Apoderada",
      },
    });

    queryMock.mockImplementation(async (fn: any, args: any) => {
      // Match function object properties to determine which query it is
      if (fn && args && args.email) {
        return {
          _id: "user_123",
          email: args.email,
          role: "PARENT",
          isActive: true,
          phone: "+56912345678",
        };
      }
      throw new Error("Unexpected query call");
    });

    mutationMock.mockImplementation(async (fn: any, args: any) => {
      // Match function object properties to determine which mutation it is
      if (fn && args && args.reason) {
        return "meeting_123";
      }
      throw new Error("Unexpected mutation call");
    });
  });

  it("rejects meeting requests without a reason", async () => {
    const { POST } = await import("@/app/api/parent/meetings/route");

    const response = await POST(
      new Request("https://example.com/api/parent/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: "Juan Pérez",
          subject: "Lenguaje",
        }),
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("motivo");
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it("normalizes parent meeting request data before calling Convex", async () => {
    const { POST } = await import("@/app/api/parent/meetings/route");

    const preferredDate = "2025-03-01T13:30:00.000Z";

    const response = await POST(
      new Request("https://example.com/api/parent/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: "user_456",
          studentName: "Juan Pérez",
          studentGrade: "3º Básico",
          guardianPhone: "+56999988877",
          message: "Necesitamos conversar sobre el progreso académico.",
          preferredDate,
          preferredTime: "14:30",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mutationMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        studentName: "Juan Pérez",
        studentGrade: "3º Básico",
        guardianName: "María Apoderada",
        guardianEmail: "parent@example.com",
        guardianPhone: "+56999988877",
        preferredTime: "14:30",
        reason: "Necesitamos conversar sobre el progreso académico.",
        type: "PARENT_TEACHER",
        teacherId: "user_456",
        preferredDate: new Date(preferredDate).getTime(),
      }),
    );

    const payload = await response.json();
    expect(payload.data.id).toBe("meeting_123");
    expect(payload.data.preferredTime).toBe("14:30");
  });
});
