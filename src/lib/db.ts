/**
 * Mock Prisma client for test compatibility
 * This project uses Convex, but tests expect a Prisma-style interface
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

// Create a mock Prisma client that mimics the structure expected by tests
const createMockPrismaClient = () => {
  const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  return {
    $connect: async () => {},
    $disconnect: async () => {},
    users: {
      findUnique: async () => null,
      findMany: async () => [],
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({}),
      count: async () => 0,
    },
    planningDocument: {
      create: async (data: any) => ({ id: "mock-id", ...data.data }),
      findMany: async () => [],
      findUnique: async () => null,
      update: async () => ({}),
      delete: async () => ({}),
    },
    notifications: {
      create: async (data: any) => ({ id: "mock-id", ...data.data }),
      findMany: async () => [],
      findUnique: async () => null,
      update: async () => ({}),
      delete: async () => ({}),
    },
    // Add other tables as needed for tests
  };
};

export const prisma = createMockPrismaClient();

export const db = prisma;
