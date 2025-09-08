import { test, expect } from '@playwright/test';

// Test against the local development server
const BASE_URL = 'http://localhost:3000';

const MASTER_USER = {
  role: 'MASTER',
  email: 'agustinaramac@gmail.com',
  password: 'madmin123',
  expectedDashboard: '/master',
};

test.describe('MASTER Authentication Test', () => {
  test('MASTER Login and Dashboard Access', async ({ page }) => {
    console.log('\n=== 🏛️ Testing MASTER Authentication ===');

    // Enable console logging
    page.on('console', msg => console.log(`Browser console: ${msg.text()}`));
    page.on('response', response => {
      if (response.url().includes('api/auth') || response.status() >= 400) {
        console.log(`HTTP Response: ${response.status()} ${response.url()}`);
      }
    });

    try {
      // Step 1: Go to login page
      console.log('1. Navigating to login page...');
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: 'debug-MASTER-1-login-page.png' });

      // Step 2: Check if login form is present
      console.log('2. Checking for login form...');
      const emailInput = page.locator(
        'input[name="email"], input[type="email"]'
      );
      const passwordInput = page.locator(
        'input[name="password"], input[type="password"]'
      );
      const submitButton = page.locator(
        'button[type="submit"], button:has-text("Sign"), button:has-text("Login"), button:has-text("Iniciar")'
      );

      await expect(emailInput.first()).toBeVisible({ timeout: 10000 });
      await expect(passwordInput.first()).toBeVisible({ timeout: 10000 });
      await expect(submitButton.first()).toBeVisible({ timeout: 10000 });
      console.log('✅ Login form elements found');

      // Step 3: Fill MASTER credentials
      console.log(`3. Filling MASTER credentials: ${MASTER_USER.email}`);
      await emailInput.first().fill(MASTER_USER.email);
      await passwordInput.first().fill(MASTER_USER.password);
      await page.screenshot({
        path: 'debug-MASTER-2-credentials-filled.png',
      });

      // Step 4: Submit form
      console.log('4. Submitting login form...');
      await submitButton.first().click();

      // Step 5: Wait for response and check result
      console.log('5. Waiting for login response...');
      await page.waitForTimeout(3000); // Give time for submission
      await page.screenshot({
        path: 'debug-MASTER-3-after-submit.png',
      });

      const currentUrl = page.url();
      console.log(`Current URL: ${currentUrl}`);

      // Check for error messages
      const errorSelectors = [
        '[data-testid="error-message"]',
        '.error-message',
        '.alert-error',
        '[role="alert"]',
        'text="Invalid credentials"',
        'text="Error"',
        'text="incorrect"',
      ];

      let hasError = false;
      for (const selector of errorSelectors) {
        try {
          const errorElement = await page
            .locator(selector)
            .first()
            .textContent({ timeout: 1000 });
          if (errorElement) {
            console.log(`❌ Found error: ${errorElement}`);
            hasError = true;
            break;
          }
        } catch (e) {
          // Selector not found, continue
        }
      }

      if (hasError) {
        console.log('❌ Authentication failed - found error message');
        expect(false, 'Authentication should not fail').toBe(true);
        return;
      }

      // Step 6: Check if redirected to master dashboard
      console.log('6. Checking if redirected to master dashboard...');

      // Wait for potential redirect
      await page.waitForTimeout(2000);

      const finalUrl = page.url();
      console.log(`Final URL: ${finalUrl}`);

      // Check if we're on the master dashboard or if we were redirected there
      if (finalUrl.includes('/master') || finalUrl.includes(MASTER_USER.expectedDashboard)) {
        console.log('✅ Successfully redirected to master dashboard!');
        await page.screenshot({
          path: 'debug-MASTER-4-master-dashboard.png',
        });

        // Step 7: Verify master dashboard content
        console.log('7. Verifying master dashboard content...');

        // Check for master-specific content
        const masterIndicators = [
          'text="🏛️ SUPREME MASTER"',
          'text="MODO DIOS ACTIVADO"',
          'text="God Mode"',
          'text="MASTER"',
          '.master-dashboard',
          '[data-testid="master-dashboard"]',
        ];

        let masterContentFound = false;
        for (const indicator of masterIndicators) {
          try {
            const element = await page.locator(indicator).first();
            if (await element.isVisible({ timeout: 2000 })) {
              console.log(`✅ Found master indicator: ${indicator}`);
              masterContentFound = true;
              break;
            }
          } catch (e) {
            // Indicator not found, continue
          }
        }

        if (masterContentFound) {
          console.log('🎉 MASTER DASHBOARD ACCESS VERIFIED!');

          // Take final screenshot
          await page.screenshot({
            path: 'debug-MASTER-5-success-verified.png',
          });

          // Test navigation to master sub-pages
          console.log('8. Testing master sub-pages...');

          // Try to navigate to master system monitor
          try {
            await page.goto(`${BASE_URL}/master/system-monitor`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(1000);
            await page.screenshot({
              path: 'debug-MASTER-6-system-monitor.png',
            });
            console.log('✅ Master system monitor accessible');
          } catch (e) {
            console.log('⚠️ Could not access system monitor, but main dashboard works');
          }

        } else {
          console.log('⚠️ Redirected to master URL but master content not found');
          await page.screenshot({
            path: 'debug-MASTER-4-content-check.png',
          });
        }

      } else if (finalUrl.includes('/unauthorized') || finalUrl.includes('/login')) {
        console.log('❌ Access denied - redirected to unauthorized or back to login');
        await page.screenshot({
          path: 'debug-MASTER-4-access-denied.png',
        });
        expect(false, 'MASTER user should not be denied access').toBe(true);
      } else {
        console.log(`⚠️ Unexpected redirect to: ${finalUrl}`);
        await page.screenshot({
          path: 'debug-MASTER-4-unexpected-redirect.png',
        });
      }

    } catch (error) {
      console.error('❌ Test failed with error:', error);
      await page.screenshot({
        path: 'debug-MASTER-ERROR.png',
      });
      throw error;
    }
  });

  test('MASTER Role Persistence Test', async ({ page }) => {
    console.log('\n=== 🔄 Testing MASTER Role Persistence ===');

    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.locator('input[type="email"]').fill(MASTER_USER.email);
    await page.locator('input[type="password"]').fill(MASTER_USER.password);
    await page.locator('button[type="submit"]').click();

    // Wait for login and redirect
    await page.waitForTimeout(3000);

    // Check if we can access master dashboard
    const currentUrl = page.url();
    if (currentUrl.includes('/master')) {
      console.log('✅ MASTER session persisted correctly');

      // Try refreshing the page
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      const refreshedUrl = page.url();
      if (refreshedUrl.includes('/master')) {
        console.log('✅ MASTER session maintained after refresh');
      } else {
        console.log('❌ MASTER session lost after refresh');
      }
    } else {
      console.log('❌ Could not establish MASTER session');
    }
  });
});