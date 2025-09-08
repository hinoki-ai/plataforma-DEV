import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  getRoleFilter,
  getAuthorFilter,
  canEditRecord,
} from '@/lib/role-utils';
import type {
  PlanningDocumentsResponse,
  PlanningDocumentResponse,
  PlanningFilters,
} from '@/lib/types/service-responses';
import type { Prisma } from '@prisma/client';

export async function getPlanningDocuments(
  searchParams?: PlanningFilters
): Promise<PlanningDocumentsResponse> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'No autorizado', data: [] };
    }

    // Build where conditions using role utilities
    const where: Prisma.PlanningDocumentWhereInput = getAuthorFilter(
      session.user.role,
      session.user.id
    );

    // Add search term filter
    if (searchParams?.q) {
      where.OR = [
        { title: { contains: searchParams.q } },
        { content: { contains: searchParams.q } },
      ];
    }

    // Add subject filter
    if (searchParams?.subject) {
      where.subject = searchParams.subject;
    }

    // Add grade filter
    if (searchParams?.grade) {
      where.grade = searchParams.grade;
    }

    const page = searchParams?.page || 1;
    const limit = searchParams?.limit || 50;
    const skip = (page - 1) * limit;

    const documents = await db.planningDocument.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
      skip,
    });

    return {
      success: true,
      data: documents,
      page,
      limit,
      total: documents.length,
    };
  } catch (error) {
    console.error('Failed to fetch planning documents:', error);
    return {
      success: false,
      error: 'No se pudieron cargar los documentos de planificación',
      data: [],
    };
  }
}

export async function getPlanningDocumentById(
  id: string
): Promise<PlanningDocumentResponse> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'No autorizado' };
    }

    const document = await db.planningDocument.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!document) {
      return {
        success: false,
        error: 'Documento de planificación no encontrado',
      };
    }

    // Check permissions using role utilities
    const hasAccess = canEditRecord(
      session.user.role,
      document.authorId,
      session.user.id
    );

    if (!hasAccess) {
      return {
        success: false,
        error: 'No tienes permisos para ver este documento',
      };
    }

    return { success: true, data: document };
  } catch (error) {
    console.error('Failed to fetch planning document by ID:', error);
    return {
      success: false,
      error: 'No se pudo cargar el documento de planificación',
    };
  }
}

export async function getPlanningDocumentsBySubject(
  subject: string,
  page: number = 1,
  limit: number = 50
): Promise<PlanningDocumentsResponse> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'No autorizado', data: [] };
    }

    const documents = await db.planningDocument.findMany({
      where: {
        subject,
        ...getAuthorFilter(session.user.role, session.user.id),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      success: true,
      data: documents,
      page,
      limit,
      total: documents.length,
    };
  } catch (error) {
    console.error('Failed to fetch planning documents by subject:', error);
    return {
      success: false,
      error: 'No se pudieron cargar los documentos por materia',
      data: [],
    };
  }
}

export async function getPlanningDocumentsByGrade(
  grade: string,
  page: number = 1,
  limit: number = 50
): Promise<PlanningDocumentsResponse> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'No autorizado', data: [] };
    }

    const documents = await db.planningDocument.findMany({
      where: {
        grade,
        ...getAuthorFilter(session.user.role, session.user.id),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      success: true,
      data: documents,
      page,
      limit,
      total: documents.length,
    };
  } catch (error) {
    console.error('Failed to fetch planning documents by grade:', error);
    return {
      success: false,
      error: 'No se pudieron cargar los documentos por grado',
      data: [],
    };
  }
}
