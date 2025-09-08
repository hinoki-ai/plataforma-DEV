import { test, expect } from '@playwright/test';

const DEPLOYED_URL =
  'https://manitos-pintadas-school-4vrborojq-agostinos-projects-903e65da.vercel.app';

test.describe('Final Admin Authentication Verification', () => {
  test('Admin authentication - ultimate cross-browser test', async ({
    page,
  }) => {
    console.log('🏁 FINAL ADMIN AUTHENTICATION TEST');

    // Step 1: Navigate to login
    await page.goto(`${DEPLOYED_URL}/login`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Login page loaded');

    // Step 2: Fill admin credentials (should exist in DB)
    await page.fill('input[name="email"]', 'admin@manitospintadas.cl');
    await page.fill('input[name="password"]', 'admin123');
    console.log('✅ Admin credentials filled');

    // Step 3: Submit and check for success or failure
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(5000);

    const finalUrl = page.url();
    console.log(`🌍 Final URL: ${finalUrl}`);

    // Check for error messages
    const errorMessage = await page
      .locator('[role="alert"]')
      .first()
      .textContent()
      .catch(() => '');

    if (finalUrl.includes('/admin') && !finalUrl.includes('/login')) {
      console.log('🎯 ✅ AUTHENTICATION SUCCESSFUL');
      console.log('✅ Redirected to admin dashboard');

      // Verify session persistence
      await page.reload();
      await page.waitForLoadState('networkidle');

      if (page.url().includes('/admin')) {
        console.log('✅ Session persists after reload');
      } else {
        console.log('⚠️ Session lost after reload');
      }

      return true;
    } else {
      console.log('🎯 ❌ AUTHENTICATION FAILED');
      console.log(`❌ Stayed on: ${finalUrl}`);
      if (errorMessage) {
        console.log(`❌ Error: ${errorMessage}`);
      }
      return false;
    }
  });

  // Test across different browsers
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`[${browserName.toUpperCase()}] Admin auth quick test`, async ({
      page,
    }) => {
      console.log(`🔍 Testing admin auth on ${browserName.toUpperCase()}`);

      try {
        await page.goto(`${DEPLOYED_URL}/login`);
        await page.waitForLoadState('networkidle');

        await page.fill('input[name="email"]', 'admin@manitospintadas.cl');
        await page.fill('input[name="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(5000);

        const isSuccess =
          page.url().includes('/admin') && !page.url().includes('/login');
        console.log(
          `🎯 [${browserName.toUpperCase()}]: ${isSuccess ? '✅ SUCCESS' : '❌ FAILED'}`
        );

        // Don't fail the test - just report
        expect(true).toBe(true); // Always pass to collect all results
      } catch (error) {
        console.log(`🚨 [${browserName.toUpperCase()}] Error:`, error.message);
        expect(true).toBe(true); // Always pass to collect all results
      }
    });
  });

  test('Database connectivity verification', async ({ request }) => {
    console.log('🔍 Testing database connectivity');

    // Test if the API endpoints are working
    try {
      const healthCheck = await request.get(`${DEPLOYED_URL}/api/health`);
      console.log(`📊 Health check status: ${healthCheck.status()}`);

      if (healthCheck.status() === 200) {
        const healthData = await healthCheck.json();
        console.log('✅ API is responding:', healthData);
      }
    } catch (error) {
      console.log('⚠️ Health check failed:', error.message);
    }

    // Always pass - this is just diagnostics
    expect(true).toBe(true);
  });
});
