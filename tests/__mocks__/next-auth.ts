import { vi } from "vitest";

export const mockSession = {
  user: {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    role: "PROFESOR",
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({ data: mockSession, status: "authenticated" })),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(() => Promise.resolve(mockSession)),
}));
