/**
 * Planning Document Queries - Convex Implementation
 */

import { getAuthenticatedConvexClient } from "@/lib/convex-server";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

/**
 * Adapter to add author information to planning documents for dashboard compatibility
 */
function adaptPlanningDocumentForDashboard(doc: Record<string, unknown>) {
  return {
    ...doc,
    id: doc._id as string,
    createdAt: new Date(doc.createdAt as number),
    updatedAt: new Date(doc.updatedAt as number),
    author: {
      id: doc.authorId as string,
      name: null, // Will be populated by caller if needed
      email: "",
    },
  };
}

export async function getPlanningDocuments(
  filters: {
    authorId?: string;
    subject?: string;
    grade?: string;
  } = {},
) {
  try {
    const client = await getAuthenticatedConvexClient();

    const docs = await client.query(api.planning.getPlanningDocuments, {
      authorId: filters.authorId as Id<"users"> | undefined,
      subject: filters.subject,
      grade: filters.grade,
    });

    const adaptedDocs = docs.map(adaptPlanningDocumentForDashboard);
    return { success: true, data: adaptedDocs };
  } catch (error) {
    console.error("Failed to fetch planning documents:", error);
    return {
      success: false,
      error: "No se pudieron cargar los documentos",
      data: [],
    };
  }
}

export async function getPlanningDocumentById(id: string) {
  try {
    const client = await getAuthenticatedConvexClient();
    const doc = await client.query(api.planning.getPlanningDocumentById, {
      id: id as Id<"planningDocuments">,
    });

    if (!doc) {
      return { success: false, error: "Documento no encontrado" };
    }

    return { success: true, data: doc };
  } catch (error) {
    console.error("Failed to fetch planning document:", error);
    return { success: false, error: "No se pudo cargar el documento" };
  }
}
