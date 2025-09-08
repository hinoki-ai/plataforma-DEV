'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { planningDocumentSchema } from '@/lib/validation';
import { CacheManager } from '@/lib/cache';
import Sanitizer from '@/lib/sanitizer';
import {
  withErrorHandling,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from '@/lib/error-handler';
import {
  canEditPlanningDocument,
  canDeletePlanningDocument,
} from '@/lib/authorization';
import { Prisma } from '@prisma/client';

// Planning document templates
const PLANNING_TEMPLATES = {
  'lesson-plan': {
    title: 'Plan de Clase',
    content: `# Plan de Clase

## Objetivos de Aprendizaje
- [ ] Objetivo 1
- [ ] Objetivo 2
- [ ] Objetivo 3

## Actividades
### Inicio (10 min)
- 

### Desarrollo (30 min)
- 

### Cierre (10 min)
- 

## Recursos
- 

## Evaluación
- 

## Observaciones
- `,
    subject: 'General',
    grade: 'General',
  },
  'weekly-plan': {
    title: 'Plan Semanal',
    content: `# Plan Semanal

## Lunes
### Actividades
- 

### Recursos
- 

## Martes
### Actividades
- 

### Recursos
- 

## Miércoles
### Actividades
- 

### Recursos
- 

## Jueves
### Actividades
- 

### Recursos
- 

## Viernes
### Actividades
- 

### Recursos
- 

## Evaluación Semanal
- 

## Observaciones
- `,
    subject: 'General',
    grade: 'General',
  },
  'project-plan': {
    title: 'Plan de Proyecto',
    content: `# Plan de Proyecto

## Descripción del Proyecto
- 

## Objetivos
- [ ] Objetivo 1
- [ ] Objetivo 2
- [ ] Objetivo 3

## Cronograma
### Semana 1
- 

### Semana 2
- 

### Semana 3
- 

### Semana 4
- 

## Recursos Necesarios
- 

## Evaluación
- 

## Observaciones
- `,
    subject: 'General',
    grade: 'General',
  },
} as const;

// Centralized cache invalidation for planning documents
function invalidatePlanningCache(documentId?: string) {
  revalidateTag('planning-documents');
  // Only revalidate specific paths when necessary
  revalidatePath('/profesor/planificaciones');
  if (documentId) {
    revalidatePath(`/profesor/planificaciones/${documentId}`);
  }
}

// Validate attachment format
function validateAttachments(attachments: any): boolean {
  if (!attachments || !Array.isArray(attachments)) {
    return false;
  }

  return attachments.every((attachment: any) => {
    return (
      attachment &&
      typeof attachment === 'object' &&
      typeof attachment.name === 'string' &&
      typeof attachment.url === 'string' &&
      typeof attachment.size === 'number' &&
      typeof attachment.type === 'string'
    );
  });
}

// Create document from template
export const createPlanningDocumentFromTemplate = withErrorHandling(
  async (
    templateId: string,
    customData?: Partial<{
      title: string;
      content: string;
      subject: string;
      grade: string;
    }>
  ) => {
    const session = await auth();

    if (!session?.user) {
      throw new AuthenticationError();
    }

    const template =
      PLANNING_TEMPLATES[templateId as keyof typeof PLANNING_TEMPLATES];
    if (!template) {
      throw new ValidationError('Plantilla no válida');
    }

    const documentData = {
      title: customData?.title || template.title,
      content: customData?.content || template.content,
      subject: customData?.subject || template.subject,
      grade: customData?.grade || template.grade,
    };

    const validatedData = planningDocumentSchema.parse({
      ...documentData,
      attachments: undefined,
    });

    const document = await db.planningDocument.create({
      data: {
        title: Sanitizer.sanitizeText(validatedData.title),
        content: Sanitizer.sanitizeHtml(validatedData.content),
        subject: Sanitizer.sanitizeText(validatedData.subject),
        grade: Sanitizer.sanitizeText(validatedData.grade),
        attachments: null as any,
        authorId: session.user.id,
      },
    });

    // Invalidate relevant caches
    await CacheManager.invalidateUserPlanningDocuments(session.user.id);
    invalidatePlanningCache();
    redirect('/profesor/planificaciones');
  }
);

// Get available templates
export const getPlanningTemplates = withErrorHandling(async () => {
  const session = await auth();

  if (!session?.user) {
    throw new AuthenticationError();
  }

  return Object.entries(PLANNING_TEMPLATES).map(([id, template]) => ({
    id,
    ...template,
  }));
});

export const createPlanningDocument = withErrorHandling(
  async (formData: FormData) => {
    const session = await auth();

    if (!session?.user) {
      throw new AuthenticationError();
    }

    // Validate and sanitize form data
    const rawData = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      subject: formData.get('subject') as string,
      grade: formData.get('grade') as string,
      attachments: formData.get('attachments')
        ? JSON.parse(formData.get('attachments') as string)
        : undefined,
    };

    const validatedData = planningDocumentSchema.parse(rawData);

    // Validate attachments if provided
    if (
      validatedData.attachments &&
      !validateAttachments(validatedData.attachments)
    ) {
      throw new ValidationError('Error en el formato de los archivos adjuntos');
    }

    const document = await db.planningDocument.create({
      data: {
        title: Sanitizer.sanitizeText(validatedData.title),
        content: Sanitizer.sanitizeHtml(validatedData.content),
        subject: Sanitizer.sanitizeText(validatedData.subject),
        grade: Sanitizer.sanitizeText(validatedData.grade),
        attachments: validatedData.attachments || (null as any),
        authorId: session.user.id,
      },
    });

    // Invalidate relevant caches
    await CacheManager.invalidateUserPlanningDocuments(session.user.id);
    invalidatePlanningCache();
    redirect('/profesor/planificaciones');
  }
);

export const updatePlanningDocument = withErrorHandling(
  async (id: string, formData: FormData) => {
    const session = await auth();

    if (!session?.user) {
      throw new AuthenticationError();
    }

    const title = Sanitizer.sanitizeText(formData.get('title') as string);
    const content = Sanitizer.sanitizeHtml(formData.get('content') as string);
    const subject = Sanitizer.sanitizeText(formData.get('subject') as string);
    const grade = Sanitizer.sanitizeText(formData.get('grade') as string);
    const attachmentsJson = formData.get('attachments') as string;

    if (!title || !content || !subject || !grade) {
      throw new ValidationError('Todos los campos son requeridos');
    }

    let attachments = null;
    if (attachmentsJson) {
      try {
        const parsedAttachments = JSON.parse(attachmentsJson);
        if (!validateAttachments(parsedAttachments)) {
          throw new ValidationError(
            'Error en el formato de los archivos adjuntos'
          );
        }
        attachments = parsedAttachments;
      } catch (_error) {
        throw new ValidationError(
          'Error en el formato de los archivos adjuntos'
        );
      }
    }

    const document = await db.planningDocument.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundError('Documento no encontrado');
    }

    if (
      !canEditPlanningDocument(
        session.user.role,
        document.authorId,
        session.user.id
      )
    ) {
      throw new AuthorizationError(
        'No tienes permisos para editar este documento'
      );
    }

    await db.planningDocument.update({
      where: { id },
      data: {
        title,
        content,
        subject,
        grade,
        attachments: attachments || (null as any),
      },
    });

    invalidatePlanningCache(id);
    redirect('/profesor/planificaciones');
  }
);

export const deletePlanningDocument = withErrorHandling(async (id: string) => {
  const session = await auth();

  if (!session?.user) {
    throw new AuthenticationError();
  }

  // Check if user owns the document or is admin
  const document = await db.planningDocument.findUnique({
    where: { id },
  });

  if (!document) {
    throw new NotFoundError('Documento no encontrado');
  }

  if (
    !canDeletePlanningDocument(
      session.user.role,
      document.authorId,
      session.user.id
    )
  ) {
    throw new AuthorizationError(
      'No tienes permisos para eliminar este documento'
    );
  }

  await db.planningDocument.delete({
    where: { id },
  });

  invalidatePlanningCache();
  redirect('/profesor/planificaciones');
});
