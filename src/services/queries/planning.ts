/**
 * Planning Document Queries - Convex Implementation
 */

import { getConvexClient } from '@/lib/convex';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

/**
 * Adapter to add author information to planning documents for dashboard compatibility
 */
function adaptPlanningDocumentForDashboard(doc: any) {
  return {
    ...doc,
    id: doc._id,
    createdAt: new Date(doc.createdAt),
    updatedAt: new Date(doc.updatedAt),
    author: {
      name: 'Profesor', // Default name since convex doesn't populate author details in list query
    },
  };
}

export async function getPlanningDocuments(filters: {
  authorId?: string;
  subject?: string;
  grade?: string;
} = {}) {
  try {
    const client = getConvexClient();

    const docs = await client.query(api.planning.getPlanningDocuments, {
      authorId: filters.authorId as Id<"users"> | undefined,
      subject: filters.subject,
      grade: filters.grade,
    });

    const adaptedDocs = docs.map(adaptPlanningDocumentForDashboard);
    return { success: true, data: adaptedDocs };
  } catch (error) {
    console.error('Failed to fetch planning documents:', error);
    return { success: false, error: 'No se pudieron cargar los documentos', data: [] };
  }
}

export async function getPlanningDocumentById(id: string) {
  try {
    const client = getConvexClient();
    const doc = await client.query(api.planning.getPlanningDocumentById, {
      id: id as Id<"planningDocuments">,
    });

    if (!doc) {
      return { success: false, error: 'Documento no encontrado' };
    }

    return { success: true, data: doc };
  } catch (error) {
    console.error('Failed to fetch planning document:', error);
    return { success: false, error: 'No se pudo cargar el documento' };
  }
}
