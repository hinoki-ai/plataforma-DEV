import { NextRequest } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { createApiRoute } from "@/lib/api-validation";
import { createSuccessResponse } from "@/lib/api-error";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { z } from "zod";

// Query schema for filtering
const planningFiltersSchema = z.object({
  q: z.string().optional(),
  subject: z.string().optional(),
  grade: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

// GET /api/profesor/planning - Get planning documents for authenticated teacher
export const GET = createApiRoute(
  async (request, validated, filters) => {
    const session = validated.session;
    const teacherId = (session?.user?.id || "") as unknown as Id<"users">;

    if (!teacherId) {
      throw new Error("User ID not found in session");
    }

    const client = getConvexClient();

    // Query planning documents filtered by teacher ID and optional filters
    const docs = await client.query(api.planning.getPlanningDocuments, {
      authorId: teacherId,
      subject: filters?.subject,
      grade: filters?.grade,
    });

    // Adapt documents for response format
    const adaptedDocs = docs.map((doc: Doc<"planningDocuments">) => ({
      ...doc,
      id: doc._id,
      createdAt: new Date(doc.createdAt).toISOString(),
      updatedAt: new Date(doc.updatedAt).toISOString(),
      author: {
        id: doc.authorId,
        name: null,
        email: "",
      },
    }));

    // Apply pagination if requested
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDocs = adaptedDocs.slice(startIndex, endIndex);

    return createSuccessResponse({
      data: paginatedDocs,
      page,
      limit,
      total: adaptedDocs.length,
    });
  },
  {
    requiredRole: "TEACHER_PLUS",
    querySchema: planningFiltersSchema,
  },
);

export const runtime = "nodejs";
