import { test, expect } from '@playwright/test';

test.describe('Parent Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to parent dashboard (assuming it exists at /parent)
    await page.goto('/parent');
  });

  test('should load parent dashboard successfully', async ({ page }) => {
    // Check that the dashboard loads
    await expect(page.getByText('Panel de Apoderados')).toBeVisible();
    await expect(
      page.getByText('Monitoreo académico y comunicación con la escuela')
    ).toBeVisible();
  });

  test('should display all dashboard tabs', async ({ page }) => {
    // Check all tab triggers are present
    await expect(page.getByRole('tab', { name: 'Resumen' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Progreso' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Comunicación' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Recursos' })).toBeVisible();
  });

  test('should show overview metrics on initial load', async ({ page }) => {
    // Check key metrics are displayed
    await expect(page.getByText('Promedio General')).toBeVisible();
    await expect(page.getByText('6.9')).toBeVisible();
    await expect(page.getByText('Asistencia')).toBeVisible();
    await expect(page.getByText('95%')).toBeVisible();
    await expect(page.getByText('Mensajes Nuevos')).toBeVisible();
    await expect(page.getByText('3')).toBeVisible();
  });

  test('should navigate between tabs correctly', async ({ page }) => {
    // Test progress tab
    await page.getByRole('tab', { name: 'Progreso' }).click();
    await expect(page.getByText('María González - 3° Básico')).toBeVisible();
    await expect(
      page.getByText('Progreso académico detallado por asignatura')
    ).toBeVisible();

    // Test communication tab
    await page.getByRole('tab', { name: 'Comunicación' }).click();
    await expect(page.getByText('Comunicaciones')).toBeVisible();
    await expect(page.getByText('Reunión de Apoderados')).toBeVisible();

    // Test resources tab
    await page.getByRole('tab', { name: 'Recursos' }).click();
    await expect(page.getByText('Recursos Académicos')).toBeVisible();
    await expect(page.getByText('Guía de Matemáticas 3° Básico')).toBeVisible();

    // Return to overview
    await page.getByRole('tab', { name: 'Resumen' }).click();
    await expect(page.getByText('Promedio General')).toBeVisible();
  });

  test('should display student progress data', async ({ page }) => {
    await page.getByRole('tab', { name: 'Progreso' }).click();

    // Check subject grades
    await expect(page.getByText('Matemáticas')).toBeVisible();
    await expect(page.getByText('6.8')).toBeVisible();
    await expect(page.getByText('Lenguaje')).toBeVisible();
    await expect(page.getByText('7.2')).toBeVisible();
    await expect(page.getByText('Ciencias')).toBeVisible();
    await expect(page.getByText('6.5')).toBeVisible();
    await expect(page.getByText('Historia')).toBeVisible();
    await expect(page.getByText('7.0')).toBeVisible();
  });

  test('should show communication items with proper badges', async ({
    page,
  }) => {
    await page.getByRole('tab', { name: 'Comunicación' }).click();

    // Check communications are displayed
    await expect(page.getByText('Reunión de Apoderados')).toBeVisible();
    await expect(page.getByText('Mensaje del Profesor')).toBeVisible();
    await expect(page.getByText('Actividad Extraprogramática')).toBeVisible();

    // Check priority badges
    await expect(page.getByText('high')).toBeVisible();
    await expect(page.getByText('medium')).toBeVisible();
    await expect(page.getByText('low')).toBeVisible();

    // Check new message badges
    const newBadges = page.getByText('Nuevo');
    await expect(newBadges).toHaveCount(2);
  });

  test('should display academic resources', async ({ page }) => {
    await page.getByRole('tab', { name: 'Recursos' }).click();

    // Check resources are displayed
    await expect(page.getByText('Guía de Matemáticas 3° Básico')).toBeVisible();
    await expect(page.getByText('Video: Comprensión Lectora')).toBeVisible();
    await expect(page.getByText('Portal Educativo')).toBeVisible();

    // Check action buttons
    const viewButtons = page.getByRole('button', { name: /Ver/ });
    const downloadButtons = page.getByRole('button', { name: /Descargar/ });
    await expect(viewButtons).toHaveCount(3);
    await expect(downloadButtons).toHaveCount(3);
  });

  test('should handle communication interactions', async ({ page }) => {
    await page.getByRole('tab', { name: 'Comunicación' }).click();

    // Test view details buttons
    const viewButtons = page.getByRole('button', { name: 'Ver Detalles' });
    await expect(viewButtons).toHaveCount(3);

    // Test reply buttons
    const replyButtons = page.getByRole('button', { name: 'Responder' });
    await expect(replyButtons).toHaveCount(3);

    // Test new message button
    await expect(
      page.getByRole('button', { name: 'Nuevo Mensaje' })
    ).toBeVisible();
  });

  test('should handle resource interactions', async ({ page }) => {
    await page.getByRole('tab', { name: 'Recursos' }).click();

    // Test view buttons
    const viewButtons = page.getByRole('button', { name: /Ver/ });
    await expect(viewButtons).toHaveCount(3);

    // Test download buttons
    const downloadButtons = page.getByRole('button', { name: /Descargar/ });
    await expect(downloadButtons).toHaveCount(3);

    // Test download all button
    await expect(
      page.getByRole('button', { name: 'Descargar Todo' })
    ).toBeVisible();
  });

  test('should maintain data consistency across tabs', async ({ page }) => {
    // Check data on overview
    await expect(page.getByText('6.9')).toBeVisible();
    await expect(page.getByText('95%')).toBeVisible();

    // Navigate to progress and check same data
    await page.getByRole('tab', { name: 'Progreso' }).click();
    await expect(page.getByText('6.8')).toBeVisible(); // Math grade
    await expect(page.getByText('7.2')).toBeVisible(); // Language grade
    await expect(page.getByText('Asistencia: 95%')).toBeVisible();
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText('Panel de Apoderados')).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText('Panel de Apoderados')).toBeVisible();

    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByText('Panel de Apoderados')).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Test tab navigation with keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');

    // Should navigate to progress tab
    await expect(page.getByText('María González - 3° Básico')).toBeVisible();
  });

  test('should show configuration button and link', async ({ page }) => {
    const configButton = page.getByRole('button', { name: 'Configuración' });
    await expect(configButton).toBeVisible();

    // Check it's a link to settings
    const configLink = page.getByRole('link', { name: 'Configuración' });
    await expect(configLink).toHaveAttribute('href', '/parent/settings');
  });

  test('should display recent activity in overview', async ({ page }) => {
    // Check recent activity section
    await expect(page.getByText('Actividad Reciente')).toBeVisible();
    await expect(page.getByText('Reunión de Apoderados')).toBeVisible();
    await expect(page.getByText('Mensaje del Profesor')).toBeVisible();
    await expect(page.getByText('Actividad Extraprogramática')).toBeVisible();
  });

  test('should handle rapid tab switching', async ({ page }) => {
    // Rapidly switch between tabs
    await page.getByRole('tab', { name: 'Progreso' }).click();
    await page.getByRole('tab', { name: 'Comunicación' }).click();
    await page.getByRole('tab', { name: 'Recursos' }).click();
    await page.getByRole('tab', { name: 'Resumen' }).click();

    // Should end up on overview tab
    await expect(page.getByText('Promedio General')).toBeVisible();
  });

  test('should display proper loading states', async ({ page }) => {
    // This would test loading states if they exist
    // For now, just verify the dashboard loads
    await expect(page.getByText('Panel de Apoderados')).toBeVisible();
  });

  test('should handle accessibility requirements', async ({ page }) => {
    // Check proper heading structure
    const mainHeading = page.getByRole('heading', { level: 1 });
    await expect(mainHeading).toHaveText('Panel de Apoderados');

    // Check tab roles
    const tabs = page.getByRole('tab');
    await expect(tabs).toHaveCount(4);

    // Check that all interactive elements have proper labels
    const buttons = page.getByRole('button');
    for (const button of await buttons.all()) {
      const text = await button.textContent();
      expect(text).toBeTruthy();
    }
  });
});
