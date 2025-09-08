import { test, expect } from '@playwright/test';
import { loginAsParent } from './fixtures/auth.fixture';

// Parent specific test credentials
const PARENT_CREDENTIALS = {
  email: 'parent@manitospintadas.cl',
  password: 'parent123',
};

test.describe('Parent Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsParent(page, PARENT_CREDENTIALS);
  });

  test.describe('Parent Dashboard', () => {
    test('should display parent-specific dashboard', async ({ page }) => {
      await page.goto('/parent');

      // Verify parent dashboard elements
      await expect(page.getByText(/panel de padres/i)).toBeVisible();
      await expect(page.getByText(/hijos inscritos/i)).toBeVisible();
      await expect(page.getByText(/reuniones pendientes/i)).toBeVisible();
      await expect(page.getByText(/comunicados/i)).toBeVisible();

      // Verify navigation menu
      await expect(
        page.getByRole('link', { name: /mis hijos/i })
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: /reuniones/i })
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: /comunicación/i })
      ).toBeVisible();
      await expect(page.getByRole('link', { name: /recursos/i })).toBeVisible();
    });

    test('should not have access to teacher or admin routes', async ({
      page,
    }) => {
      await page.goto('/profesor/planificaciones');

      // Should redirect to parent dashboard
      await expect(page).toHaveURL(/.*\/parent.*/);
      await expect(page.getByText(/acceso restringido/i)).toBeVisible();
    });
  });

  test.describe('Student Management', () => {
    test('should view children information', async ({ page }) => {
      await page.goto('/parent/estudiantes');

      // Verify children are displayed
      await expect(page.getByText(/mis hijos/i)).toBeVisible();

      // Check for child information
      const childCards = page.locator('[data-testid="child-card"]');
      await expect(childCards.first()).toBeVisible();

      // Click on first child
      await childCards.first().click();

      // Verify detailed information
      await expect(page.getByText(/información del estudiante/i)).toBeVisible();
      await expect(page.getByText(/grado/i)).toBeVisible();
      await expect(page.getByText(/profesor/i)).toBeVisible();
      await expect(page.getByText(/asignaturas/i)).toBeVisible();
    });

    test('should update child information', async ({ page }) => {
      await page.goto('/parent/estudiantes');

      // Click edit button on first child
      await page
        .getByRole('button', { name: /editar/i })
        .first()
        .click();

      // Update emergency contact
      await page.getByLabel(/contacto de emergencia/i).clear();
      await page.getByLabel(/contacto de emergencia/i).fill('987654321');

      // Update medical information
      await page
        .getByLabel(/información médica/i)
        .fill('Alergia a frutos secos');

      // Save changes
      await page.getByRole('button', { name: /guardar cambios/i }).click();

      // Verify update
      await expect(page.getByText('Información actualizada')).toBeVisible();
    });
  });

  test.describe('Meeting Scheduling', () => {
    test('should request meeting with teacher', async ({ page }) => {
      await page.goto('/parent/reuniones');

      // Click request new meeting
      await page.getByRole('button', { name: /solicitar reunión/i }).click();

      // Select teacher
      await page.getByLabel(/profesor/i).selectOption('Prof. María González');

      // Select child
      await page.getByLabel(/hijo/i).selectOption('Juan Pérez - 3° Básico');

      // Choose meeting type
      await page
        .getByLabel(/tipo de reunión/i)
        .selectOption('desarrollo-academico');

      // Set preferred date
      await page.getByLabel(/fecha preferida/i).fill('2024-03-20');

      // Set preferred time
      await page.getByLabel(/hora preferida/i).selectOption('16:00');

      // Add reason/description
      await page
        .getByLabel(/motivo/i)
        .fill('Discutir el progreso académico de Juan en matemáticas');

      // Submit request
      await page.getByRole('button', { name: /enviar solicitud/i }).click();

      // Verify submission
      await expect(
        page.getByText('Solicitud enviada exitosamente')
      ).toBeVisible();
    });

    test('should view scheduled meetings', async ({ page }) => {
      await page.goto('/parent/reuniones');

      // Check scheduled meetings
      await expect(page.getByText(/reuniones programadas/i)).toBeVisible();

      // Verify meeting details are displayed
      const meetingCards = page.locator('[data-testid="meeting-card"]');
      await expect(meetingCards.first()).toBeVisible();

      // Check meeting status
      await expect(page.getByText(/estado/i)).toBeVisible();
      await expect(page.getByText(/fecha/i)).toBeVisible();
      await expect(page.getByText(/hora/i)).toBeVisible();
    });

    test('should reschedule meeting', async ({ page }) => {
      await page.goto('/parent/reuniones');

      // Find a scheduled meeting
      const rescheduleButton = page.getByRole('button', {
        name: /reprogramar/i,
      });
      if ((await rescheduleButton.count()) > 0) {
        await rescheduleButton.first().click();

        // Select new date
        await page.getByLabel(/nueva fecha/i).fill('2024-03-25');
        await page.getByLabel(/nueva hora/i).selectOption('17:00');

        // Add reason for rescheduling
        await page
          .getByLabel(/razón/i)
          .fill('Cambio en disponibilidad laboral');

        // Confirm rescheduling
        await page
          .getByRole('button', { name: /confirmar reprogramación/i })
          .click();

        // Verify update
        await expect(page.getByText('Reunión reprogramada')).toBeVisible();
      }
    });

    test('should cancel meeting', async ({ page }) => {
      await page.goto('/parent/reuniones');

      // Find a meeting to cancel
      const cancelButton = page.getByRole('button', { name: /cancelar/i });
      if ((await cancelButton.count()) > 0) {
        await cancelButton.first().click();

        // Add cancellation reason
        await page
          .getByLabel(/razón de cancelación/i)
          .fill('Emergencia familiar');

        // Confirm cancellation
        await page
          .getByRole('button', { name: /confirmar cancelación/i })
          .click();

        // Verify cancellation
        await expect(page.getByText('Reunión cancelada')).toBeVisible();
      }
    });
  });

  test.describe('Communication with School', () => {
    test('should send message to teacher', async ({ page }) => {
      await page.goto('/parent/comunicacion');

      // Click new message
      await page.getByRole('button', { name: /nuevo mensaje/i }).click();

      // Select recipient
      await page.getByLabel(/para/i).selectOption('Prof. Ana Rodríguez');

      // Select child reference
      await page
        .getByLabel(/referente a/i)
        .selectOption('María Pérez - 2° Básico');

      // Write message
      await page
        .getByLabel(/asunto/i)
        .fill('Consulta sobre tarea de matemáticas');
      await page
        .getByLabel(/mensaje/i)
        .fill(
          'Estimada Profesora, tengo una consulta sobre la tarea de fracciones...'
        );

      // Attach file if needed
      await page.setInputFiles('input[type="file"]', {
        name: 'ejemplo-tarea.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('homework example'),
      });

      // Send message
      await page.getByRole('button', { name: /enviar mensaje/i }).click();

      // Verify sent
      await expect(
        page.getByText('Mensaje enviado exitosamente')
      ).toBeVisible();
    });

    test('should view received messages', async ({ page }) => {
      await page.goto('/parent/comunicacion');

      // Check inbox
      await expect(page.getByText(/bandeja de entrada/i)).toBeVisible();

      // Verify message list
      const messages = page.locator('[data-testid="message-item"]');
      await expect(messages.first()).toBeVisible();

      // Check message details
      await messages.first().click();
      await expect(page.getByText(/detalle del mensaje/i)).toBeVisible();
    });

    test('should mark messages as read/unread', async ({ page }) => {
      await page.goto('/parent/comunicacion');

      // Find unread message
      const unreadMessages = page.locator('[data-testid="unread-message"]');
      if ((await unreadMessages.count()) > 0) {
        await unreadMessages.first().click();

        // Message should be marked as read
        await expect(
          page.locator('[data-testid="unread-badge"]')
        ).not.toBeVisible();
      }
    });
  });

  test.describe('Resource Access', () => {
    test('should access educational resources', async ({ page }) => {
      await page.goto('/parent/recursos');

      // Verify resource categories
      await expect(page.getByText(/recursos educativos/i)).toBeVisible();
      await expect(page.getByText(/materiales de apoyo/i)).toBeVisible();

      // Check resource types
      await expect(page.getByText(/guias de estudio/i)).toBeVisible();
      await expect(page.getByText(/videos educativos/i)).toBeVisible();
      await expect(page.getByText(/juegos educativos/i)).toBeVisible();
    });

    test('should download child-specific resources', async ({ page }) => {
      await page.goto('/parent/recursos');

      // Select child's grade
      await page.getByLabel(/grado/i).selectOption('3° Básico');

      // Find downloadable resources
      const downloadButtons = page.getByRole('button', { name: /descargar/i });
      if ((await downloadButtons.count()) > 0) {
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          downloadButtons.first().click(),
        ]);

        expect(download.suggestedFilename()).toContain('.pdf');
      }
    });

    test('should access homework resources', async ({ page }) => {
      await page.goto('/parent/recursos');

      // Navigate to homework section
      await page.getByRole('tab', { name: /tareas/i }).click();

      // Verify homework resources
      await expect(page.getByText(/tareas asignadas/i)).toBeVisible();

      // Check specific homework
      const homeworkItems = page.locator('[data-testid="homework-item"]');
      await expect(homeworkItems.first()).toBeVisible();
    });
  });

  test.describe('Notifications and Alerts', () => {
    test('should receive important notifications', async ({ page }) => {
      await page.goto('/parent');

      // Check notification bell
      await page.getByRole('button', { name: /notificaciones/i }).click();

      // Verify notification panel
      await expect(page.getByText(/notificaciones/i)).toBeVisible();

      // Check for unread notifications
      const notifications = page.locator('[data-testid="notification-item"]');
      if ((await notifications.count()) > 0) {
        await notifications.first().click();

        // Verify notification details
        await expect(page.getByText(/detalle de notificación/i)).toBeVisible();
      }
    });

    test('should configure notification preferences', async ({ page }) => {
      await page.goto('/parent/settings/notifications');

      // Configure email notifications
      await page.getByLabel(/notificaciones por email/i).check();

      // Select notification types
      await page.getByLabel(/reuniones/i).check();
      await page.getByLabel(/tareas/i).check();
      await page.getByLabel(/calificaciones/i).check();

      // Set notification frequency
      await page.getByLabel(/frecuencia/i).selectOption('diario');

      // Save preferences
      await page.getByRole('button', { name: /guardar preferencias/i }).click();

      // Verify saved
      await expect(page.getByText('Preferencias guardadas')).toBeVisible();
    });
  });

  test.describe('Emergency Contacts', () => {
    test('should update emergency contact information', async ({ page }) => {
      await page.goto('/parent/emergency');

      // Update primary emergency contact
      await page.getByLabel(/contacto emergencia 1/i).clear();
      await page
        .getByLabel(/contacto emergencia 1/i)
        .fill('Juan Pérez - Padre: +56912345678');

      // Update secondary emergency contact
      await page.getByLabel(/contacto emergencia 2/i).clear();
      await page
        .getByLabel(/contacto emergencia 2/i)
        .fill('María González - Abuela: +56987654321');

      // Update medical information
      await page.getByLabel(/información médica/i).clear();
      await page
        .getByLabel(/información médica/i)
        .fill('Alergia a penicilina, asma leve');

      // Save emergency information
      await page.getByRole('button', { name: /guardar información/i }).click();

      // Verify update
      await expect(
        page.getByText('Información de emergencia actualizada')
      ).toBeVisible();
    });
  });

  test.describe('Attendance Tracking', () => {
    test('should view attendance records', async ({ page }) => {
      await page.goto('/parent/asistencia');

      // Verify attendance section
      await expect(page.getByText(/registro de asistencia/i)).toBeVisible();

      // Check attendance by child
      await page.getByLabel(/seleccionar hijo/i).selectOption('Juan Pérez');

      // Verify attendance data
      await expect(page.getByText(/asistencia mensual/i)).toBeVisible();
      await expect(page.getByText(/días presentes/i)).toBeVisible();
      await expect(page.getByText(/días ausentes/i)).toBeVisible();
    });

    test('should download attendance reports', async ({ page }) => {
      await page.goto('/parent/asistencia');

      // Download attendance report
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('button', { name: /descargar reporte/i }).click(),
      ]);

      expect(download.suggestedFilename()).toMatch(/asistencia.*\.pdf/);
    });
  });

  test.describe('Mobile Experience', () => {
    test('should provide good mobile experience', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await loginAsParent(page, PARENT_CREDENTIALS);

      await page.goto('/parent');

      // Test mobile navigation
      await page.getByRole('button', { name: /menú/i }).click();
      await expect(
        page.getByRole('link', { name: /mis hijos/i })
      ).toBeVisible();

      // Test swipe gestures
      await page.mouse.wheel(0, 200);
      await expect(page.getByText(/notificaciones/i)).toBeVisible();
    });
  });

  test.describe('Security and Privacy', () => {
    test('should protect sensitive information', async ({ page }) => {
      await page.goto('/parent/estudiantes');

      // Verify sensitive data is handled properly
      await expect(page.getByText(/rut/i)).not.toBeVisible(); // Should not show full RUT
      await expect(page.getByText(/dirección completa/i)).not.toBeVisible();

      // Verify access controls
      await page.goto('/admin/usuarios');
      await expect(page.getByText(/acceso restringido/i)).toBeVisible();
    });

    test('should handle session timeout', async ({ page }) => {
      await page.goto('/parent');

      // Simulate session timeout
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      await page.reload();

      // Should redirect to login
      await expect(page).toHaveURL(/.*\/login.*/);
    });
  });
});
