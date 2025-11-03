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
    try {
      const session = validated.session;

      if (!session?.user?.id) {
        throw new Error("User ID not found in session");
      }

      const teacherId = session.user.id as unknown as Id<"users">;
      const client = getConvexClient();

      // Query planning documents filtered by teacher ID and optional filters
      let docs;
      try {
        docs = await client.query(api.planning.getPlanningDocuments, {
          authorId: teacherId,
          subject: filters?.subject,
          grade: filters?.grade,
        });
      } catch (queryError) {
        console.error("Convex query error in /api/profesor/planning:", {
          error: queryError,
          teacherId,
          filters,
          message:
            queryError instanceof Error
              ? queryError.message
              : String(queryError),
          stack: queryError instanceof Error ? queryError.stack : undefined,
        });
        throw new Error(
          `Failed to fetch planning documents: ${
            queryError instanceof Error ? queryError.message : "Unknown error"
          }`,
        );
      }

      // Ensure docs is an array
      if (!Array.isArray(docs)) {
        console.error("Unexpected response from getPlanningDocuments:", docs);
        return createSuccessResponse({
          data: [],
          page: filters?.page || 1,
          limit: filters?.limit || 10,
          total: 0,
        });
      }

      // Adapt documents for response format with proper error handling
      const adaptedDocs = docs.map((doc: Doc<"planningDocuments">) => {
        try {
          // Ensure timestamps are valid numbers before conversion
          const createdAt =
            doc.createdAt && typeof doc.createdAt === "number"
              ? new Date(doc.createdAt).toISOString()
              : new Date().toISOString();

          const updatedAt =
            doc.updatedAt && typeof doc.updatedAt === "number"
              ? new Date(doc.updatedAt).toISOString()
              : new Date().toISOString();

          return {
            ...doc,
            id: doc._id,
            createdAt,
            updatedAt,
            author: {
              id: doc.authorId,
              name: null,
              email: "",
            },
          };
        } catch (error) {
          console.error("Error adapting document:", error, doc);
          // Return document with safe defaults
          return {
            ...doc,
            id: doc._id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            author: {
              id: doc.authorId,
              name: null,
              email: "",
            },
          };
        }
      });

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
    } catch (error) {
      console.error("Error in GET /api/profesor/planning:", error);
      throw error;
    }
  },
  {
    requiredRole: "TEACHER_PLUS",
    querySchema: planningFiltersSchema,
  },
);

export const runtime = "nodejs";
