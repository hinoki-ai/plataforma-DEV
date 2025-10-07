/**
 * Planning Document Actions (Mutations) - Convex Implementation
 */

import { getConvexClient } from "@/lib/convex";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export async function createPlanningDocument(data: {
  title: string;
  content: string;
  subject: string;
  grade: string;
  authorId: string;
  attachments?: Array<{ name: string; url: string }>;
}) {
  try {
    const client = getConvexClient();

    const docId = await client.mutation(api.planning.createPlanningDocument, {
      ...data,
      authorId: data.authorId as Id<"users">,
    });

    return { success: true, data: { id: docId } };
  } catch (error) {
    console.error("Failed to create planning document:", error);
    return { success: false, error: "No se pudo crear el documento" };
  }
}

export async function updatePlanningDocument(
  id: string,
  data: {
    title?: string;
    content?: string;
    subject?: string;
    grade?: string;
    attachments?: Array<{ name: string; url: string }>;
  },
) {
  try {
    const client = getConvexClient();

    await client.mutation(api.planning.updatePlanningDocument, {
      id: id as Id<"planningDocuments">,
      ...data,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update planning document:", error);
    return { success: false, error: "No se pudo actualizar el documento" };
  }
}

export async function deletePlanningDocument(id: string) {
  try {
    const client = getConvexClient();
    await client.mutation(api.planning.deletePlanningDocument, {
      id: id as Id<"planningDocuments">,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to delete planning document:", error);
    return { success: false, error: "No se pudo eliminar el documento" };
  }
}
