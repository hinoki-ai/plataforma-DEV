"use server";

/**
 * Planning Document Actions (Mutations) - Convex Implementation
 */

import { getAuthenticatedConvexClient } from "@/lib/convex-server";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

import type { SimpleFileMetadata } from "@/lib/simple-upload";
import { PLANNING_TEMPLATES, type PlanningTemplate } from "./planning-types";

export async function createPlanningDocument(data: {
  title: string;
  content: string;
  subject: string;
  grade: string;
  authorId: string;
  attachments?: SimpleFileMetadata[];
}) {
  try {
    const client = await getAuthenticatedConvexClient();

    const docId = await client.mutation(api.planning.createPlanningDocument, {
      ...data,
      authorId: data.authorId as Id<"users">,
    });

    return { success: true, data: { id: docId } };
  } catch (error) {
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
    attachments?: SimpleFileMetadata[];
  },
) {
  try {
    const client = await getAuthenticatedConvexClient();

    await client.mutation(api.planning.updatePlanningDocument, {
      id: id as Id<"planningDocuments">,
      ...data,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo actualizar el documento" };
  }
}

export async function deletePlanningDocument(id: string) {
  try {
    const client = await getAuthenticatedConvexClient();
    await client.mutation(api.planning.deletePlanningDocument, {
      id: id as Id<"planningDocuments">,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo eliminar el documento" };
  }
}

// Template functions for planning documents

export async function getPlanningTemplates(): Promise<PlanningTemplate[]> {
  // Return available templates
  return PLANNING_TEMPLATES;
}

export async function createPlanningDocumentFromTemplate(
  templateId: string,
  authorId: string,
  customizations?: {
    title?: string;
    subject?: string;
    grade?: string;
  },
) {
  try {
    const template = PLANNING_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      throw new Error("Plantilla no válida");
    }

    const client = getConvexClient();

    const docId = await client.mutation(api.planning.createPlanningDocument, {
      title: customizations?.title || template.template.title,
      content: template.template.content,
      subject: customizations?.subject || template.subject,
      grade: customizations?.grade || template.grade,
      authorId: authorId as Id<"users">,
    });

    return { success: true, data: { id: docId } };
  } catch (error) {
    if (error instanceof Error && error.message === "Plantilla no válida") {
      throw error;
    }
    return {
      success: false,
      error: "No se pudo crear el documento desde la plantilla",
    };
  }
}
