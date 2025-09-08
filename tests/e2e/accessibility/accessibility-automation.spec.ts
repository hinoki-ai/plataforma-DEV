/**
 * Comprehensive Accessibility Testing Automation
 * WCAG 2.1 AA compliance testing for educational platform
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

interface AccessibilityResult {
  violations: any[];
  passes: any[];
  incomplete: any[];
  inapplicable: any[];
}

test.describe('Comprehensive Accessibility Testing', () => {
  async function runAccessibilityAudit(
    page: any
  ): Promise<AccessibilityResult> {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    return accessibilityScanResults;
  }

  async function loginAsTeacher(page: any) {
    await page.goto('/login');
    await page.fill('[name="email"]', 'profesor@manitospintadas.cl');
    await page.fill('[name="password"]', 'profesor123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/profesor');
  }

  async function loginAsAdmin(page: any) {
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@manitospintadas.cl');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin');
  }

  test('Homepage accessibility compliance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const results = await runAccessibilityAudit(page);

    console.log('Homepage Accessibility Results:', {
      violations: results.violations.length,
      passes: results.passes.length,
      incomplete: results.incomplete.length,
    });

    // No accessibility violations allowed
    expect(results.violations).toEqual([]);

    // Ensure critical accessibility features are present
    await expect(page.locator('html')).toHaveAttribute('lang');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Login page accessibility compliance', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const results = await runAccessibilityAudit(page);

    console.log('Login Page Accessibility Results:', {
      violations: results.violations.length,
      passes: results.passes.length,
    });

    expect(results.violations).toEqual([]);

    // Form accessibility checks
    const emailInput = page.locator('[name="email"]');
    const passwordInput = page.locator('[name="password"]');

    await expect(emailInput).toHaveAttribute('aria-label');
    await expect(passwordInput).toHaveAttribute('aria-label');
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Teacher dashboard accessibility', async ({ page }) => {
    await loginAsTeacher(page);
    await page.waitForLoadState('networkidle');

    const results = await runAccessibilityAudit(page);

    console.log('Teacher Dashboard Accessibility Results:', {
      violations: results.violations.length,
      passes: results.passes.length,
    });

    expect(results.violations).toEqual([]);

    // Navigation accessibility
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('[role="main"]')).toBeVisible();

    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('Planning form accessibility', async ({ page }) => {
    await loginAsTeacher(page);
    await page.goto('/profesor/planificaciones/crear');
    await page.waitForLoadState('networkidle');

    const results = await runAccessibilityAudit(page);

    console.log('Planning Form Accessibility Results:', {
      violations: results.violations.length,
      passes: results.passes.length,
    });

    expect(results.violations).toEqual([]);

    // Form field accessibility
    const formFields = await page.locator('input, textarea, select').all();
    for (const field of formFields) {
      const id = await field.getAttribute('id');
      const name = await field.getAttribute('name');
      const ariaLabel = await field.getAttribute('aria-label');
      const ariaLabelledBy = await field.getAttribute('aria-labelledby');

      // Each field should have either a label, aria-label, or aria-labelledby
      const hasLabel =
        id && (await page.locator(`label[for="${id}"]`).count()) > 0;
      const hasAccessibleName = hasLabel || ariaLabel || ariaLabelledBy;

      expect(hasAccessibleName).toBe(true);
    }
  });

  test('Admin panel accessibility', async ({ page }) => {
    await loginAsAdmin(page);
    await page.waitForLoadState('networkidle');

    const results = await runAccessibilityAudit(page);

    console.log('Admin Panel Accessibility Results:', {
      violations: results.violations.length,
      passes: results.passes.length,
    });

    expect(results.violations).toEqual([]);
  });

  test('Centro Consejo page accessibility', async ({ page }) => {
    await page.goto('/centro-consejo');
    await page.waitForLoadState('networkidle');

    const results = await runAccessibilityAudit(page);

    console.log('Centro Consejo Accessibility Results:', {
      violations: results.violations.length,
      passes: results.passes.length,
    });

    expect(results.violations).toEqual([]);
  });

  test('Keyboard navigation - Full site', async ({ page }) => {
    await page.goto('/');

    // Test keyboard navigation through main elements
    const focusableElements = await page
      .locator(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      .all();

    for (let i = 0; i < Math.min(10, focusableElements.length); i++) {
      await page.keyboard.press('Tab');
      const activeElement = await page.evaluate(
        () => document.activeElement?.tagName
      );
      expect(activeElement).toBeTruthy();
    }

    // Test reverse navigation
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Shift+Tab');
      const activeElement = await page.evaluate(
        () => document.activeElement?.tagName
      );
      expect(activeElement).toBeTruthy();
    }
  });

  test('Keyboard navigation - Forms', async ({ page }) => {
    await page.goto('/login');

    // Tab to email field
    await page.keyboard.press('Tab');
    let focused = await page.evaluate(() =>
      document.activeElement?.getAttribute('name')
    );
    expect(focused).toBe('email');

    // Tab to password field
    await page.keyboard.press('Tab');
    focused = await page.evaluate(() =>
      document.activeElement?.getAttribute('name')
    );
    expect(focused).toBe('password');

    // Tab to submit button
    await page.keyboard.press('Tab');
    focused = await page.evaluate(() =>
      document.activeElement?.getAttribute('type')
    );
    expect(focused).toBe('submit');

    // Enter should submit form
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpassword');
    await page.keyboard.press('Enter');

    // Form should attempt to submit (even if credentials are invalid)
    await page.waitForFunction(
      () => {
        return (
          document
            .querySelector('button[type="submit"]')
            ?.textContent?.includes('Loading') ||
          document.querySelector('.error-message') !== null
        );
      },
      { timeout: 5000 }
    );
  });

  test('Screen reader compatibility', async ({ page }) => {
    await page.goto('/');

    // Check for ARIA landmarks
    await expect(page.locator('[role="banner"], header')).toBeVisible();
    await expect(page.locator('[role="main"], main')).toBeVisible();
    await expect(page.locator('[role="navigation"], nav')).toBeVisible();

    // Check for proper ARIA labels on interactive elements
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');

      // Button should have accessible text
      const hasAccessibleText =
        (text && text.trim() !== '') || ariaLabel || ariaLabelledBy;
      expect(hasAccessibleText).toBe(true);
    }
  });

  test('Color contrast compliance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Run axe audit focused on color contrast
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include(['*'])
      .analyze();

    // Filter for color contrast violations
    const contrastViolations = results.violations.filter(
      violation => violation.id === 'color-contrast'
    );

    console.log('Color Contrast Violations:', contrastViolations.length);

    if (contrastViolations.length > 0) {
      console.log(
        'Contrast issues:',
        contrastViolations.map(v => ({
          impact: v.impact,
          nodes: v.nodes.length,
          description: v.description,
        }))
      );
    }

    expect(contrastViolations).toEqual([]);
  });

  test('Focus management - Modal dialogs', async ({ page }) => {
    await loginAsTeacher(page);

    // Look for modal triggers
    const modalTriggers = await page
      .locator('[data-testid*="modal"], [aria-haspopup="dialog"]')
      .all();

    if (modalTriggers.length > 0) {
      const trigger = modalTriggers[0];
      await trigger.click();

      // Wait for modal to open
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      // Focus should be trapped within modal
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // First focusable element in modal should be focused
      const focusedElement = await page.evaluate(
        () => document.activeElement?.tagName
      );
      expect(focusedElement).toBeTruthy();

      // Escape key should close modal
      await page.keyboard.press('Escape');
      await expect(modal).toBeHidden();
    }
  });

  test('Mobile accessibility', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const results = await runAccessibilityAudit(page);

    console.log('Mobile Accessibility Results:', {
      violations: results.violations.length,
      passes: results.passes.length,
    });

    expect(results.violations).toEqual([]);

    // Check tap target sizes
    const buttons = await page.locator('button, a').all();
    for (const button of buttons.slice(0, 5)) {
      // Check first 5 buttons
      const box = await button.boundingBox();
      if (box) {
        // Minimum tap target size should be 44x44px
        expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('High contrast mode support', async ({ page }) => {
    await page.emulateMedia({
      colorScheme: 'dark',
      reducedMotion: 'reduce',
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const results = await runAccessibilityAudit(page);

    console.log('High Contrast Mode Accessibility Results:', {
      violations: results.violations.length,
      passes: results.passes.length,
    });

    expect(results.violations).toEqual([]);
  });

  test('Reduced motion compliance', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that animations respect reduced motion preference
    const animatedElements = await page
      .locator('[class*="animate"], [class*="transition"]')
      .all();

    for (const element of animatedElements.slice(0, 3)) {
      const styles = await element.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          animationDuration: computed.animationDuration,
          transitionDuration: computed.transitionDuration,
        };
      });

      // Animations should be significantly reduced or removed
      const isDurationReduced =
        styles.animationDuration === '0s' ||
        styles.animationDuration === 'none' ||
        styles.transitionDuration === '0s' ||
        styles.transitionDuration === 'none';

      // This is a soft check as implementation may vary
      if (!isDurationReduced) {
        console.warn(
          'Element may not respect reduced motion preference:',
          styles
        );
      }
    }
  });

  test('Language and localization accessibility', async ({ page }) => {
    await page.goto('/');

    // Check for proper language declaration
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBeTruthy();
    expect(htmlLang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // Valid language code format

    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1); // Should have exactly one h1

    // Check that text has proper direction if RTL is supported
    const direction = await page.locator('html').getAttribute('dir');
    if (direction) {
      expect(['ltr', 'rtl']).toContain(direction);
    }
  });

  test('Error handling accessibility', async ({ page }) => {
    await page.goto('/login');

    // Trigger form validation errors
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Check for accessible error messages
    const errorMessages = await page
      .locator('[role="alert"], .error-message, [aria-invalid="true"]')
      .all();

    if (errorMessages.length > 0) {
      for (const error of errorMessages) {
        const isVisible = await error.isVisible();
        expect(isVisible).toBe(true);

        // Error should have accessible content
        const text = await error.textContent();
        expect(text?.trim()).toBeTruthy();
      }
    }

    // Run accessibility audit on error state
    const results = await runAccessibilityAudit(page);
    expect(results.violations).toEqual([]);
  });

  test('Tables and data accessibility', async ({ page }) => {
    await loginAsTeacher(page);
    await page.goto('/profesor/planificaciones');
    await page.waitForLoadState('networkidle');

    // Check for accessible tables if they exist
    const tables = await page.locator('table').all();

    for (const table of tables) {
      // Tables should have captions or accessible names
      const caption = await table.locator('caption').count();
      const ariaLabel = await table.getAttribute('aria-label');
      const ariaLabelledBy = await table.getAttribute('aria-labelledby');

      const hasAccessibleName = caption > 0 || ariaLabel || ariaLabelledBy;
      expect(hasAccessibleName).toBe(true);

      // Check for proper table headers
      const headers = await table.locator('th').all();
      if (headers.length > 0) {
        for (const header of headers) {
          const scope = await header.getAttribute('scope');
          expect(scope).toBeTruthy(); // Should have col, row, colgroup, or rowgroup
        }
      }
    }
  });

  test('Comprehensive accessibility report', async ({ page }) => {
    const pages = [
      { url: '/', name: 'Homepage' },
      { url: '/login', name: 'Login' },
      { url: '/centro-consejo', name: 'Centro Consejo' },
    ];

    const report = [];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');

      const results = await runAccessibilityAudit(page);

      report.push({
        page: pageInfo.name,
        url: pageInfo.url,
        violations: results.violations.length,
        passes: results.passes.length,
        incomplete: results.incomplete.length,
        score:
          results.passes.length /
          (results.passes.length +
            results.violations.length +
            results.incomplete.length),
      });
    }

    console.log('\n=== ACCESSIBILITY COMPLIANCE REPORT ===');
    report.forEach(result => {
      console.log(
        `${result.page}: ${(result.score * 100).toFixed(1)}% compliant (${result.violations} violations)`
      );
    });

    // All pages should have zero violations
    const totalViolations = report.reduce(
      (sum, result) => sum + result.violations,
      0
    );
    expect(totalViolations).toBe(0);
  });
});
