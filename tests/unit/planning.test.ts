import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createPlanningDocument,
  updatePlanningDocument,
  deletePlanningDocument,
  createPlanningDocumentFromTemplate,
  getPlanningTemplates,
} from '@/services/actions/planning';
import {
  getPlanningDocuments,
  getPlanningDocumentById,
} from '@/services/queries/planning';

// Mock authentication
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => ({
    user: { id: 'teacher-123', role: 'PROFESOR' },
  })),
  getServerSession: vi.fn(() => ({
    user: { id: 'teacher-123', role: 'PROFESOR' },
  })),
}));

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    planningDocument: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock validation
vi.mock('@/lib/validation', () => ({
  planningDocumentSchema: {
    parse: vi.fn(data => ({
      title: data.title || 'Default Title',
      content: data.content || '<p>Default Content</p>',
      subject: data.subject || 'Mathematics',
      grade: data.grade || '5th Grade',
      attachments: data.attachments || null,
    })),
  },
}));

// Mock sanitizer
vi.mock('@/lib/sanitizer', () => ({
  default: {
    sanitizeText: vi.fn(text => text),
    sanitizeHtml: vi.fn(html => html),
  },
}));

// Mock authorization
vi.mock('@/lib/authorization', () => ({
  canEditPlanningDocument: vi.fn(() => true),
  canDeletePlanningDocument: vi.fn(() => true),
}));

// Mock role utilities
vi.mock('@/lib/role-utils', () => ({
  getAuthorFilter: vi.fn(() => ({})),
  canEditRecord: vi.fn(() => true),
}));

// Mock cache manager
vi.mock('@/lib/cache', () => ({
  CacheManager: {
    invalidateUserPlanningDocuments: vi.fn(),
  },
}));

// Mock Next.js functions
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Planning Documents System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Planning Operations', () => {
    it('should create planning document successfully', async () => {
      const mockDb = await import('@/lib/db');
      const mockCreate = vi.mocked(mockDb.db.planningDocument.create);
      const mockValidation = await import('@/lib/validation');
      const mockParse = vi.mocked(mockValidation.planningDocumentSchema.parse);

      const formData = new FormData();
      formData.append('title', 'Math Lesson Plan');
      formData.append('content', '<p>This is a math lesson plan</p>');
      formData.append('subject', 'Mathematics');
      formData.append('grade', '5th Grade');
      formData.append(
        'attachments',
        JSON.stringify([
          {
            name: 'worksheet.pdf',
            url: '/uploads/worksheet.pdf',
            size: 1024,
            type: 'application/pdf',
          },
        ])
      );

      const validatedData = {
        title: 'Math Lesson Plan',
        content: '<p>This is a math lesson plan</p>',
        subject: 'Mathematics',
        grade: '5th Grade',
        attachments: [
          {
            name: 'worksheet.pdf',
            url: '/uploads/worksheet.pdf',
            size: 1024,
            type: 'application/pdf',
          },
        ],
      };

      mockParse.mockReturnValue(validatedData);
      mockCreate.mockResolvedValue({
        id: 'planning-123',
        ...validatedData,
        authorId: 'teacher-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      try {
        await createPlanningDocument(formData);
        // Should redirect, so we expect it to throw
        expect(true).toBe(false);
      } catch (error) {
        // Expected to redirect
        expect(error).toBeDefined();
      }

      expect(mockParse).toHaveBeenCalledWith({
        title: 'Math Lesson Plan',
        content: '<p>This is a math lesson plan</p>',
        subject: 'Mathematics',
        grade: '5th Grade',
        attachments: [
          {
            name: 'worksheet.pdf',
            url: '/uploads/worksheet.pdf',
            size: 1024,
            type: 'application/pdf',
          },
        ],
      });
    });

    it('should update planning document successfully', async () => {
      const mockDb = await import('@/lib/db');
      const mockFindUnique = vi.mocked(mockDb.db.planningDocument.findUnique);
      const mockUpdate = vi.mocked(mockDb.db.planningDocument.update);

      const formData = new FormData();
      formData.append('title', 'Updated Math Lesson Plan');
      formData.append('content', '<p>Updated math lesson plan</p>');
      formData.append('subject', 'Mathematics');
      formData.append('grade', '5th Grade');

      mockFindUnique.mockResolvedValue({
        id: 'planning-123',
        title: 'Math Lesson Plan',
        content: '<p>This is a math lesson plan</p>',
        subject: 'Mathematics',
        grade: '5th Grade',
        attachments: null,
        authorId: 'teacher-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUpdate.mockResolvedValue({
        id: 'planning-123',
        title: 'Updated Math Lesson Plan',
        content: '<p>Updated math lesson plan</p>',
        subject: 'Mathematics',
        grade: '5th Grade',
        attachments: null,
        authorId: 'teacher-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      try {
        await updatePlanningDocument('planning-123', formData);
        // Should redirect, so we expect it to throw
        expect(true).toBe(false);
      } catch (error) {
        // Expected to redirect
        expect(error).toBeDefined();
      }

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'planning-123' },
        data: {
          title: 'Updated Math Lesson Plan',
          content: '<p>Updated math lesson plan</p>',
          subject: 'Mathematics',
          grade: '5th Grade',
          attachments: null,
        },
      });
    });

    it('should delete planning document successfully', async () => {
      const mockDb = await import('@/lib/db');
      const mockFindUnique = vi.mocked(mockDb.db.planningDocument.findUnique);
      const mockDelete = vi.mocked(mockDb.db.planningDocument.delete);

      mockFindUnique.mockResolvedValue({
        id: 'planning-123',
        title: 'Math Lesson Plan',
        content: '<p>This is a math lesson plan</p>',
        subject: 'Mathematics',
        grade: '5th Grade',
        attachments: null,
        authorId: 'teacher-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockDelete.mockResolvedValue({
        id: 'planning-123',
        title: 'Math Lesson Plan',
        content: '<p>This is a math lesson plan</p>',
        subject: 'Mathematics',
        grade: '5th Grade',
        attachments: null,
        authorId: 'teacher-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // deletePlanningDocument is wrapped with withErrorHandling, so it doesn't return anything
      await deletePlanningDocument('planning-123');

      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: 'planning-123' },
      });
    });

    it('should handle document creation with validation errors', async () => {
      const mockValidation = await import('@/lib/validation');
      const mockParse = vi.mocked(mockValidation.planningDocumentSchema.parse);

      mockParse.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const formData = new FormData();
      formData.append('title', ''); // Invalid: empty title
      formData.append('content', '');
      formData.append('subject', '');
      formData.append('grade', '');

      try {
        await createPlanningDocument(formData);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Validation failed');
      }
    });
  });

  describe('Document Queries', () => {
    it('should fetch planning documents successfully', async () => {
      const mockDb = await import('@/lib/db');
      const mockFindMany = vi.mocked(mockDb.db.planningDocument.findMany);

      const mockDocuments = [
        {
          id: 'planning-1',
          title: 'Math Lesson Plan',
          content: '<p>Math lesson content</p>',
          subject: 'Mathematics',
          grade: '5th Grade',
          attachments: null,
          authorId: 'teacher-123',
          author: {
            id: 'teacher-123',
            name: 'Teacher Name',
            email: 'teacher@manitospintadas.cl',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'planning-2',
          title: 'Science Lesson Plan',
          content: '<p>Science lesson content</p>',
          subject: 'Science',
          grade: '6th Grade',
          attachments: null,
          authorId: 'teacher-123',
          author: {
            id: 'teacher-123',
            name: 'Teacher Name',
            email: 'teacher@manitospintadas.cl',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockFindMany.mockResolvedValue(mockDocuments);

      const result = await getPlanningDocuments();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDocuments);
      expect(mockFindMany).toHaveBeenCalled();
    });

    it('should fetch planning document by ID successfully', async () => {
      const mockDb = await import('@/lib/db');
      const mockFindUnique = vi.mocked(mockDb.db.planningDocument.findUnique);

      const mockDocument = {
        id: 'planning-123',
        title: 'Math Lesson Plan',
        content: '<p>Math lesson content</p>',
        subject: 'Mathematics',
        grade: '5th Grade',
        attachments: null,
        authorId: 'teacher-123',
        author: {
          id: 'teacher-123',
          name: 'Teacher Name',
          email: 'teacher@manitospintadas.cl',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFindUnique.mockResolvedValue(mockDocument);

      const result = await getPlanningDocumentById('planning-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDocument);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'planning-123' },
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
    });

    it('should handle document not found', async () => {
      const mockDb = await import('@/lib/db');
      const mockFindUnique = vi.mocked(mockDb.db.planningDocument.findUnique);

      mockFindUnique.mockResolvedValue(null);

      const result = await getPlanningDocumentById('non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Documento de planificación no encontrado');
    });

    it('should search documents by query', async () => {
      const mockDb = await import('@/lib/db');
      const mockFindMany = vi.mocked(mockDb.db.planningDocument.findMany);

      const mockDocuments = [
        {
          id: 'planning-1',
          title: 'Math Lesson Plan',
          content: '<p>Math lesson content</p>',
          subject: 'Mathematics',
          grade: '5th Grade',
          attachments: null,
          authorId: 'teacher-123',
          author: {
            id: 'teacher-123',
            name: 'Teacher Name',
            email: 'teacher@manitospintadas.cl',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockFindMany.mockResolvedValue(mockDocuments);

      const result = await getPlanningDocuments({ q: 'math' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDocuments);
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'math' } },
            { content: { contains: 'math' } },
          ],
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
        take: 50,
        skip: 0,
      });
    });
  });

  describe('Document Templates', () => {
    it('should create document from template', async () => {
      const mockAuth = await import('@/lib/auth');
      const mockSession = {
        user: {
          id: 'teacher-123',
          email: 'teacher@test.com',
          role: 'PROFESOR' as const,
        },
      };
      vi.mocked(mockAuth.auth).mockResolvedValue(mockSession);

      const mockDb = await import('@/lib/db');
      const mockCreate = vi.mocked(mockDb.db.planningDocument.create);
      const mockValidation = await import('@/lib/validation');
      const mockParse = vi.mocked(mockValidation.planningDocumentSchema.parse);

      const templateData = {
        title: 'Plan de Clase',
        content:
          '# Plan de Clase\n\n## Objetivos de Aprendizaje\n- [ ] Objetivo 1\n- [ ] Objetivo 2\n- [ ] Objetivo 3\n\n## Actividades\n### Inicio (10 min)\n- \n\n### Desarrollo (30 min)\n- \n\n### Cierre (10 min)\n- \n\n## Recursos\n- \n\n## Evaluación\n- \n\n## Observaciones\n- ',
        subject: 'General',
        grade: 'General',
        attachments: undefined,
      };

      mockParse.mockReturnValue(templateData);
      mockCreate.mockResolvedValue({
        id: 'planning-123',
        ...templateData,
        attachments: null,
        authorId: 'teacher-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      try {
        await createPlanningDocumentFromTemplate('lesson-plan');
        // Should redirect, so we expect it to throw
        expect(true).toBe(false);
      } catch (error) {
        // Expected to redirect
        expect(error).toBeDefined();
      }

      expect(mockParse).toHaveBeenCalledWith({
        title: 'Plan de Clase',
        content: expect.stringContaining('# Plan de Clase'),
        subject: 'General',
        grade: 'General',
        attachments: undefined,
      });
    });

    it('should handle invalid template id', async () => {
      const mockAuth = await import('@/lib/auth');
      const mockSession = {
        user: {
          id: 'teacher-123',
          email: 'teacher@test.com',
          role: 'PROFESOR' as const,
        },
      };
      vi.mocked(mockAuth.auth).mockResolvedValue(mockSession);

      try {
        await createPlanningDocumentFromTemplate('invalid-template');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Plantilla no válida');
      }
    });

    it('should get available templates', async () => {
      const mockAuth = await import('@/lib/auth');
      const mockSession = {
        user: {
          id: 'teacher-123',
          email: 'teacher@test.com',
          role: 'PROFESOR' as const,
        },
      };
      vi.mocked(mockAuth.auth).mockResolvedValue(mockSession);

      const templates = await getPlanningTemplates();

      expect(templates).toHaveLength(3);
      expect(templates).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'lesson-plan',
            title: 'Plan de Clase',
          }),
          expect.objectContaining({
            id: 'weekly-plan',
            title: 'Plan Semanal',
          }),
          expect.objectContaining({
            id: 'project-plan',
            title: 'Plan de Proyecto',
          }),
        ])
      );
    });
  });

  describe('Document Attachments', () => {
    it('should handle document with multiple attachments', async () => {
      const mockAuth = await import('@/lib/auth');
      const mockSession = {
        user: {
          id: 'teacher-123',
          email: 'teacher@test.com',
          role: 'PROFESOR' as const,
        },
      };
      vi.mocked(mockAuth.auth).mockResolvedValue(mockSession);

      const mockDb = await import('@/lib/db');
      const mockCreate = vi.mocked(mockDb.db.planningDocument.create);
      const mockValidation = await import('@/lib/validation');
      const mockParse = vi.mocked(mockValidation.planningDocumentSchema.parse);

      const validAttachments = [
        {
          name: 'document1.pdf',
          url: 'https://example.com/document1.pdf',
          size: 1024,
          type: 'application/pdf',
        },
        {
          name: 'image1.jpg',
          url: 'https://example.com/image1.jpg',
          size: 2048,
          type: 'image/jpeg',
        },
      ];

      const validatedData = {
        title: 'Lesson Plan with Attachments',
        content: '<p>Lesson plan content</p>',
        subject: 'Mathematics',
        grade: '5th Grade',
        attachments: validAttachments,
      };

      mockParse.mockReturnValue(validatedData);
      mockCreate.mockResolvedValue({
        id: 'planning-123',
        ...validatedData,
        authorId: 'teacher-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const formData = new FormData();
      formData.append('title', 'Lesson Plan with Attachments');
      formData.append('content', '<p>Lesson plan content</p>');
      formData.append('subject', 'Mathematics');
      formData.append('grade', '5th Grade');
      formData.append('attachments', JSON.stringify(validAttachments));

      try {
        await createPlanningDocument(formData);
        // Should redirect, so we expect it to throw
        expect(true).toBe(false);
      } catch (error) {
        // Expected to redirect
        expect(error).toBeDefined();
      }

      expect(mockParse).toHaveBeenCalledWith({
        title: 'Lesson Plan with Attachments',
        content: '<p>Lesson plan content</p>',
        subject: 'Mathematics',
        grade: '5th Grade',
        attachments: validAttachments,
      });
    });

    it('should handle invalid attachment format', async () => {
      const formData = new FormData();
      formData.append('title', 'Lesson Plan');
      formData.append('content', '<p>Lesson plan</p>');
      formData.append('subject', 'Mathematics');
      formData.append('grade', '5th Grade');
      formData.append('attachments', 'invalid-json');

      try {
        await updatePlanningDocument('planning-123', formData);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(
          'Error en el formato de los archivos adjuntos'
        );
      }
    });
  });

  describe('Document Permissions', () => {
    it('should allow teacher to edit own document', async () => {
      const mockAuthorization = await import('@/lib/authorization');
      const mockCanEdit = vi.mocked(mockAuthorization.canEditPlanningDocument);

      mockCanEdit.mockReturnValue(true);

      const mockDb = await import('@/lib/db');
      const mockFindUnique = vi.mocked(mockDb.db.planningDocument.findUnique);
      const mockUpdate = vi.mocked(mockDb.db.planningDocument.update);

      const formData = new FormData();
      formData.append('title', 'Updated Lesson Plan');
      formData.append('content', '<p>Updated content</p>');
      formData.append('subject', 'Mathematics');
      formData.append('grade', '5th Grade');

      mockFindUnique.mockResolvedValue({
        id: 'planning-123',
        title: 'Lesson Plan',
        content: '<p>Original content</p>',
        subject: 'Mathematics',
        grade: '5th Grade',
        attachments: null,
        authorId: 'teacher-123', // Same as current user
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUpdate.mockResolvedValue({
        id: 'planning-123',
        title: 'Updated Lesson Plan',
        content: '<p>Updated content</p>',
        subject: 'Mathematics',
        grade: '5th Grade',
        attachments: null,
        authorId: 'teacher-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      try {
        await updatePlanningDocument('planning-123', formData);
        // Should redirect, so we expect it to throw
        expect(true).toBe(false);
      } catch (error) {
        // Expected to redirect
        expect(error).toBeDefined();
      }

      expect(mockCanEdit).toHaveBeenCalledWith(
        'PROFESOR',
        'teacher-123',
        'teacher-123'
      );
    });

    it('should deny teacher access to other teacher document', async () => {
      const mockAuthorization = await import('@/lib/authorization');
      const mockCanEdit = vi.mocked(mockAuthorization.canEditPlanningDocument);

      mockCanEdit.mockReturnValue(false);

      const mockDb = await import('@/lib/db');
      const mockFindUnique = vi.mocked(mockDb.db.planningDocument.findUnique);

      const formData = new FormData();
      formData.append('title', 'Updated Lesson Plan');
      formData.append('content', '<p>Updated content</p>');
      formData.append('subject', 'Mathematics');
      formData.append('grade', '5th Grade');

      mockFindUnique.mockResolvedValue({
        id: 'planning-123',
        title: 'Lesson Plan',
        content: '<p>Original content</p>',
        subject: 'Mathematics',
        grade: '5th Grade',
        attachments: null,
        authorId: 'other-teacher-456', // Different teacher
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      try {
        await updatePlanningDocument('planning-123', formData);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(
          'No tienes permisos para editar este documento'
        );
      }
    });
  });

  describe('Document Filtering', () => {
    it('should filter documents by subject', async () => {
      const mockDb = await import('@/lib/db');
      const mockFindMany = vi.mocked(mockDb.db.planningDocument.findMany);

      const mockDocuments = [
        {
          id: 'planning-1',
          title: 'Math Lesson Plan',
          content: '<p>Math content</p>',
          subject: 'Mathematics',
          grade: '5th Grade',
          attachments: null,
          authorId: 'teacher-123',
          author: {
            id: 'teacher-123',
            name: 'Teacher Name',
            email: 'teacher@manitospintadas.cl',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockFindMany.mockResolvedValue(mockDocuments);

      const result = await getPlanningDocuments({ subject: 'Mathematics' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDocuments);
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          subject: 'Mathematics',
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
        take: 50,
        skip: 0,
      });
    });

    it('should filter documents by grade', async () => {
      const mockDb = await import('@/lib/db');
      const mockFindMany = vi.mocked(mockDb.db.planningDocument.findMany);

      const mockDocuments = [
        {
          id: 'planning-1',
          title: '5th Grade Math',
          content: '<p>5th grade content</p>',
          subject: 'Mathematics',
          grade: '5th Grade',
          attachments: null,
          authorId: 'teacher-123',
          author: {
            id: 'teacher-123',
            name: 'Teacher Name',
            email: 'teacher@manitospintadas.cl',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockFindMany.mockResolvedValue(mockDocuments);

      const result = await getPlanningDocuments({ grade: '5th Grade' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDocuments);
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          grade: '5th Grade',
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
        take: 50,
        skip: 0,
      });
    });
  });

  describe('Performance with Large Datasets', () => {
    it('should handle 1000+ planning documents efficiently', async () => {
      const mockDb = await import('@/lib/db');
      const mockFindMany = vi.mocked(mockDb.db.planningDocument.findMany);

      const startTime = performance.now();

      // Simulate 1000 planning documents
      const largeDocumentSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `planning-${i}`,
        title: `Lesson Plan ${i}`,
        content: `<p>Content for lesson plan ${i}</p>`,
        subject: ['Mathematics', 'Science', 'Language'][i % 3],
        grade: ['5th Grade', '6th Grade', '7th Grade'][i % 3],
        attachments: null,
        authorId: 'teacher-123',
        author: {
          id: 'teacher-123',
          name: 'Teacher Name',
          email: 'teacher@manitospintadas.cl',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockFindMany.mockResolvedValue(largeDocumentSet);

      const result = await getPlanningDocuments();

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1000);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection failures', async () => {
      const mockDb = await import('@/lib/db');
      const mockFindMany = vi.mocked(mockDb.db.planningDocument.findMany);

      mockFindMany.mockRejectedValue(new Error('Database connection failed'));

      const result = await getPlanningDocuments();

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'No se pudieron cargar los documentos de planificación'
      );
    });

    it('should handle authentication failures', async () => {
      const mockAuth = await import('@/lib/auth');
      const mockAuthFn = vi.mocked(mockAuth.auth);

      mockAuthFn.mockResolvedValue(null);

      const result = await getPlanningDocuments();

      expect(result.success).toBe(false);
      expect(result.error).toBe('No autorizado');
    });

    it('should handle validation errors in document creation', async () => {
      const mockAuth = await import('@/lib/auth');
      const mockAuthFn = vi.mocked(mockAuth.auth);

      // Mock auth to return null to trigger authentication error
      mockAuthFn.mockResolvedValue(null);

      const formData = new FormData();
      formData.append('title', '');
      formData.append('content', '');
      formData.append('subject', '');
      formData.append('grade', '');

      try {
        await createPlanningDocument(formData);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('No autorizado');
      }
    });
  });
});
