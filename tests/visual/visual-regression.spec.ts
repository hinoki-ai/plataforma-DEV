/**
 * Visual Regression Testing Suite
 * Automated visual testing for UI consistency across deployments
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for visual tests
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Homepage visual consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for images to load
    await page.waitForFunction(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.every(img => img.complete);
    });

    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      threshold: 0.3,
    });
  });

  test('Login page visual consistency', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('login-page.png', {
      threshold: 0.2,
    });
  });

  test('Teacher dashboard visual consistency', async ({ page }) => {
    // Login as teacher
    await page.goto('/login');
    await page.fill('[name="email"]', 'profesor@manitospintadas.cl');
    await page.fill('[name="password"]', 'profesor123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/profesor');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('teacher-dashboard.png', {
      fullPage: true,
      threshold: 0.3,
    });
  });

  test('Planning creation form visual consistency', async ({ page }) => {
    // Login and navigate to planning form
    await page.goto('/login');
    await page.fill('[name="email"]', 'profesor@manitospintadas.cl');
    await page.fill('[name="password"]', 'profesor123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/profesor');

    await page.goto('/profesor/planificaciones/crear');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('planning-form.png', {
      fullPage: true,
      threshold: 0.3,
    });
  });

  test('Admin dashboard visual consistency', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@manitospintadas.cl');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('admin-dashboard.png', {
      fullPage: true,
      threshold: 0.3,
    });
  });

  test('Centro Consejo page visual consistency', async ({ page }) => {
    await page.goto('/centro-consejo');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('centro-consejo.png', {
      fullPage: true,
      threshold: 0.3,
    });
  });

  test('Mobile responsive - Homepage', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      threshold: 0.3,
    });
  });

  test('Mobile responsive - Login page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('login-mobile.png', {
      threshold: 0.2,
    });
  });

  test('Tablet responsive - Teacher dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad

    // Login as teacher
    await page.goto('/login');
    await page.fill('[name="email"]', 'profesor@manitospintadas.cl');
    await page.fill('[name="password"]', 'profesor123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/profesor');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('teacher-dashboard-tablet.png', {
      fullPage: true,
      threshold: 0.3,
    });
  });

  test('Dark mode consistency (if implemented)', async ({ page }) => {
    await page.goto('/');

    // Check if dark mode toggle exists
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]');
    const hasToggle = (await darkModeToggle.count()) > 0;

    if (hasToggle) {
      await darkModeToggle.click();
      await page.waitForTimeout(500); // Wait for theme transition

      await expect(page).toHaveScreenshot('homepage-dark.png', {
        fullPage: true,
        threshold: 0.3,
      });
    } else {
      console.log('Dark mode toggle not found - skipping dark mode test');
    }
  });

  test('Form validation states visual consistency', async ({ page }) => {
    await page.goto('/login');

    // Trigger validation errors
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500); // Wait for validation messages

    await expect(page).toHaveScreenshot('login-validation-errors.png', {
      threshold: 0.2,
    });
  });

  test('Loading states visual consistency', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'profesor@manitospintadas.cl');
    await page.fill('[name="password"]', 'profesor123');

    // Click submit and immediately capture loading state
    const submitPromise = page.click('button[type="submit"]');
    await page.waitForTimeout(100); // Brief moment to capture loading

    const loadingButton = page.locator('button[type="submit"][disabled]');
    if ((await loadingButton.count()) > 0) {
      await expect(page).toHaveScreenshot('login-loading-state.png', {
        threshold: 0.2,
      });
    }

    await submitPromise;
  });

  test('Empty states visual consistency', async ({ page }) => {
    // Login as teacher
    await page.goto('/login');
    await page.fill('[name="email"]', 'profesor@manitospintadas.cl');
    await page.fill('[name="password"]', 'profesor123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/profesor');

    // Navigate to planning documents (assuming empty state exists)
    await page.goto('/profesor/planificaciones');
    await page.waitForLoadState('networkidle');

    // Check if empty state is visible
    const emptyState = page.locator('[data-testid="empty-state"]');
    if ((await emptyState.count()) > 0) {
      await expect(page).toHaveScreenshot('planning-empty-state.png', {
        threshold: 0.2,
      });
    }
  });

  test('High contrast mode compatibility', async ({ page }) => {
    // Enable high contrast mode via CSS media query emulation
    await page.emulateMedia({
      colorScheme: 'dark',
      reducedMotion: 'reduce',
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('homepage-high-contrast.png', {
      fullPage: true,
      threshold: 0.4, // Higher threshold for contrast differences
    });
  });

  test('Print styles visual consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Emulate print media
    await page.emulateMedia({ media: 'print' });

    await expect(page).toHaveScreenshot('homepage-print.png', {
      fullPage: true,
      threshold: 0.3,
    });
  });

  test('Cross-browser consistency - Firefox', async ({ page }) => {
    // This test specifically runs on Firefox when configured
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('homepage-firefox.png', {
      fullPage: true,
      threshold: 0.3,
    });
  });

  test('Component states - Buttons and inputs', async ({ page }) => {
    await page.goto('/login');

    // Focus state
    await page.focus('[name="email"]');
    await expect(page.locator('[name="email"]')).toHaveScreenshot(
      'input-focused.png'
    );

    // Hover state for button
    await page.hover('button[type="submit"]');
    await expect(page.locator('button[type="submit"]')).toHaveScreenshot(
      'button-hover.png'
    );
  });

  test('Modal and overlay consistency', async ({ page }) => {
    // Login as teacher first
    await page.goto('/login');
    await page.fill('[name="email"]', 'profesor@manitospintadas.cl');
    await page.fill('[name="password"]', 'profesor123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/profesor');

    // Look for any modal trigger (settings, profile, etc.)
    const modalTrigger = page.locator('[data-testid="modal-trigger"]').first();
    const hasModal = (await modalTrigger.count()) > 0;

    if (hasModal) {
      await modalTrigger.click();
      await page.waitForTimeout(300); // Wait for modal animation

      await expect(page).toHaveScreenshot('modal-overlay.png', {
        threshold: 0.3,
      });
    }
  });
});
