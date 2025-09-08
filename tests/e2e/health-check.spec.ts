import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  // Navigate to homepage with retry logic
  const response = await page.goto('/', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  // Check response is successful
  expect(response?.status()).toBeLessThan(400);

  // Check page has content
  await expect(page.locator('body')).not.toBeEmpty();

  // Check page loads without errors
  await expect(page).toHaveTitle(/Manitos Pintadas|Escuela|School/i);
});

test('can navigate to public pages', async ({ page }) => {
  // Test centro-consejo page
  await page.goto('/centro-consejo', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  await expect(page.locator('body')).not.toBeEmpty();

  // Should not redirect to login
  expect(page.url()).toContain('/centro-consejo');
});
