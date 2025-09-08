import { test, expect } from '@playwright/test';
import {
  loginAsTeacher,
  loginAsAdmin,
  loginAsParent,
} from './fixtures/auth.fixture';
import {
  createTestPlanning,
  createTestTeacher,
} from './fixtures/test-data.factory';

// Test configuration
const TEACHER_CREDENTIALS = {
  email: 'profesor@manitospintadas.cl',
  password: 'profesor123',
};

test.describe('Teacher Planning Document Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTeacher(page, TEACHER_CREDENTIALS);
  });

  test.describe('Planning Document Management', () => {
    test('should create a new planning document successfully', async ({
      page,
    }) => {
      await page.goto('/profesor/planificaciones');

      // Navigate to create form
      await page.getByRole('link', { name: /crear planificación/i }).click();

      // Fill the form
      await page
        .getByLabel(/título/i)
        .fill('Matemáticas - Fracciones Avanzadas');
      await page.getByLabel(/grado/i).selectOption('5th');
      await page.getByLabel(/asignatura/i).selectOption('Math');
      await page
        .getByLabel(/contenido/i)
        .fill(
          'Esta planificación cubre fracciones mixtas y operaciones complejas...'
        );

      // Add learning objectives
      await page.getByRole('button', { name: /agregar objetivo/i }).click();
      await page
        .getByPlaceholder(/objetivo de aprendizaje/i)
        .fill('Comprender fracciones mixtas');

      // Set duration
      await page.getByLabel(/duración/i).selectOption('2 weeks');

      // Submit form
      await page
        .getByRole('button', { name: /guardar planificación/i })
        .click();

      // Verify success
      await expect(
        page.getByText('Planificación creada exitosamente')
      ).toBeVisible();
      await expect(
        page.getByText('Matemáticas - Fracciones Avanzadas')
      ).toBeVisible();
    });

    test('should edit existing planning document', async ({ page }) => {
      await page.goto('/profesor/planificaciones');

      // Ensure we have a planning document
      const planningTitle = 'Test Planning - Edit Test';

      // Create a test document via API
      const response = await page.request.post('/api/planning', {
        data: {
          title: planningTitle,
          grade: '3rd',
          subject: 'Science',
          content: 'Original content',
        },
      });
      expect(response.ok()).toBeTruthy();

      // Refresh to see the document
      await page.reload();

      // Click edit button
      await page
        .getByRole('button', { name: /editar/i })
        .first()
        .click();

      // Modify content
      await page.getByLabel(/contenido/i).clear();
      await page
        .getByLabel(/contenido/i)
        .fill('Contenido actualizado con nuevos materiales...');

      // Save changes
      await page.getByRole('button', { name: /actualizar/i }).click();

      // Verify update
      await expect(page.getByText('Planificación actualizada')).toBeVisible();
      await expect(
        page.getByText('Contenido actualizado con nuevos materiales')
      ).toBeVisible();
    });

    test('should delete planning document with confirmation', async ({
      page,
    }) => {
      await page.goto('/profesor/planificaciones');

      // Create a test document
      const planningTitle = 'Test Planning - Delete Test';
      const response = await page.request.post('/api/planning', {
        data: {
          title: planningTitle,
          grade: '2nd',
          subject: 'Language',
          content: 'Content to be deleted',
        },
      });
      expect(response.ok()).toBeTruthy();

      await page.reload();

      // Find the document and click delete
      await page
        .getByRole('button', { name: /eliminar/i })
        .first()
        .click();

      // Confirm deletion
      await page
        .getByRole('button', { name: /confirmar eliminación/i })
        .click();

      // Verify deletion
      await expect(page.getByText('Planificación eliminada')).toBeVisible();
      await expect(page.getByText(planningTitle)).not.toBeVisible();
    });

    test('should filter planning documents by criteria', async ({ page }) => {
      await page.goto('/profesor/planificaciones');

      // Create multiple documents
      const documents = [
        { title: 'Matemáticas - Suma', grade: '1st', subject: 'Math' },
        { title: 'Ciencia - Plantas', grade: '2nd', subject: 'Science' },
        { title: 'Lenguaje - Lectura', grade: '3rd', subject: 'Language' },
      ];

      for (const doc of documents) {
        const response = await page.request.post('/api/planning', {
          data: doc,
        });
        expect(response.ok()).toBeTruthy();
      }

      await page.reload();

      // Test filtering by grade
      await page.getByLabel(/filtrar por grado/i).selectOption('2nd');
      await expect(page.getByText('Ciencia - Plantas')).toBeVisible();
      await expect(page.getByText('Matemáticas - Suma')).not.toBeVisible();

      // Test filtering by subject
      await page.getByLabel(/filtrar por asignatura/i).selectOption('Math');
      await expect(page.getByText('Matemáticas - Suma')).toBeVisible();
      await expect(page.getByText('Ciencia - Plantas')).not.toBeVisible();

      // Test search
      await page.getByPlaceholder(/buscar/i).fill('lenguaje');
      await expect(page.getByText('Lenguaje - Lectura')).toBeVisible();
    });
  });

  test.describe('File Upload and Attachments', () => {
    test('should upload PDF attachment successfully', async ({ page }) => {
      await page.goto('/profesor/planificaciones/crear');

      // Fill basic form
      await page.getByLabel(/título/i).fill('Planificación con PDF');
      await page.getByLabel(/grado/i).selectOption('4th');
      await page.getByLabel(/asignatura/i).selectOption('Math');

      // Upload file
      await page.setInputFiles('input[type="file"]', {
        name: 'test-planning.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('PDF content for testing'),
      });

      // Verify file upload
      await expect(page.getByText('test-planning.pdf')).toBeVisible();

      // Submit form
      await page.getByRole('button', { name: /guardar/i }).click();

      // Verify success
      await expect(
        page.getByText('Planificación creada exitosamente')
      ).toBeVisible();
    });

    test('should reject invalid file types', async ({ page }) => {
      await page.goto('/profesor/planificaciones/crear');

      // Try to upload executable file
      await page.setInputFiles('input[type="file"]', {
        name: 'malicious.exe',
        mimeType: 'application/x-msdownload',
        buffer: Buffer.from('executable content'),
      });

      // Verify error message
      await expect(
        page.getByText(/tipo de archivo no permitido/i)
      ).toBeVisible();
    });

    test('should handle large file uploads', async ({ page }) => {
      await page.goto('/profesor/planificaciones/crear');

      // Create a large file (10MB)
      const largeFile = Buffer.alloc(10 * 1024 * 1024, 'A');

      await page.setInputFiles('input[type="file"]', {
        name: 'large-document.pdf',
        mimeType: 'application/pdf',
        buffer: largeFile,
      });

      await expect(page.getByText(/archivo demasiado grande/i)).toBeVisible();
    });
  });

  test.describe('Calendar Integration', () => {
    test('should link planning to calendar events', async ({ page }) => {
      await page.goto('/profesor/planificaciones');

      // Create a planning document
      const response = await page.request.post('/api/planning', {
        data: {
          title: 'Planificación con Calendario',
          grade: '1st',
          subject: 'Math',
          content: 'Content with calendar integration',
        },
      });
      expect(response.ok()).toBeTruthy();

      await page.reload();

      // Click to link to calendar
      await page
        .getByRole('button', { name: /agregar al calendario/i })
        .first()
        .click();

      // Fill calendar event details
      await page.getByLabel(/fecha de inicio/i).fill('2024-03-15');
      await page.getByLabel(/fecha de fin/i).fill('2024-03-29');
      await page.getByLabel(/hora/i).selectOption('09:00');

      // Save calendar event
      await page.getByRole('button', { name: /guardar evento/i }).click();

      // Verify calendar integration
      await expect(
        page.getByText('Evento agregado al calendario')
      ).toBeVisible();
    });
  });

  test.describe('Collaboration Features', () => {
    test('should share planning document with other teachers', async ({
      page,
    }) => {
      await page.goto('/profesor/planificaciones');

      // Create a planning document
      const response = await page.request.post('/api/planning', {
        data: {
          title: 'Planificación Colaborativa',
          grade: '5th',
          subject: 'Science',
          content: 'Content for collaboration',
        },
      });
      expect(response.ok()).toBeTruthy();

      await page.reload();

      // Click share button
      await page
        .getByRole('button', { name: /compartir/i })
        .first()
        .click();

      // Select teacher to share with
      await page.getByLabel(/buscar profesor/i).fill('colleague@school.edu');
      await page.getByText(/colleague@school.edu/).click();

      // Set permissions
      await page.getByLabel(/permisos/i).selectOption('view');

      // Send invitation
      await page.getByRole('button', { name: /enviar invitación/i }).click();

      // Verify invitation sent
      await expect(
        page.getByText('Invitación enviada exitosamente')
      ).toBeVisible();
    });
  });
});

test.describe('Teacher Dashboard Overview', () => {
  test('should display relevant information on teacher dashboard', async ({
    page,
  }) => {
    await loginAsTeacher(page, TEACHER_CREDENTIALS);
    await page.goto('/profesor');

    // Verify dashboard elements
    await expect(page.getByText(/bienvenido/i)).toBeVisible();
    await expect(page.getByText(/planificaciones activas/i)).toBeVisible();
    await expect(page.getByText(/próximas clases/i)).toBeVisible();
    await expect(page.getByText(/tareas pendientes/i)).toBeVisible();

    // Verify navigation menu
    await expect(
      page.getByRole('link', { name: /planificaciones/i })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /calendario/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /perfil/i })).toBeVisible();
  });
});

test.describe('Error Handling and Edge Cases', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    await loginAsTeacher(page, TEACHER_CREDENTIALS);

    // Block network requests
    await page.route('**/api/planning', route => route.abort());

    await page.goto('/profesor/planificaciones');

    // Verify error handling
    await expect(page.getByText(/error de conexión/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /reintentar/i })
    ).toBeVisible();
  });

  test('should handle validation errors in form', async ({ page }) => {
    await page.goto('/profesor/planificaciones/crear');

    // Submit empty form
    await page.getByRole('button', { name: /guardar/i }).click();

    // Verify validation errors
    await expect(page.getByText(/título es requerido/i)).toBeVisible();
    await expect(page.getByText(/grado es requerido/i)).toBeVisible();
    await expect(page.getByText(/asignatura es requerida/i)).toBeVisible();
  });

  test('should handle concurrent editing conflicts', async ({
    page,
    browser,
  }) => {
    await loginAsTeacher(page, TEACHER_CREDENTIALS);

    // Create a planning document
    const response = await page.request.post('/api/planning', {
      data: {
        title: 'Planificación Concurrente',
        grade: '4th',
        subject: 'Math',
        content: 'Original content',
      },
    });
    expect(response.ok()).toBeTruthy();

    const documentId = (await response.json()).id;

    // Open another browser instance
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await loginAsTeacher(page2, TEACHER_CREDENTIALS);

    // Both pages open edit mode
    await page.goto(`/profesor/planificaciones/${documentId}/edit`);
    await page2.goto(`/profesor/planificaciones/${documentId}/edit`);

    // Make conflicting changes
    await page.getByLabel(/contenido/i).fill('Changes from page 1');
    await page2.getByLabel(/contenido/i).fill('Changes from page 2');

    // Save from both pages
    await page.getByRole('button', { name: /guardar/i }).click();
    await page2.getByRole('button', { name: /guardar/i }).click();

    // Verify conflict resolution
    await expect(page2.getByText(/conflicto de edición/i)).toBeVisible();
  });
});
