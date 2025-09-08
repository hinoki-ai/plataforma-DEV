import { test, expect } from '@playwright/test';

const BASE_URL = 'https://school.aramac.dev';

const TEST_USERS = [
  {
    role: 'ADMIN',
    email: 'admin@manitospintadas.cl',
    password: 'admin123',
    expectedDashboard: '/admin',
  },
  {
    role: 'PROFESOR',
    email: 'profesor@manitospintadas.cl',
    password: 'profesor123',
    expectedDashboard: '/profesor',
  },
  {
    role: 'PARENT',
    email: 'parent@manitospintadas.cl',
    password: 'parent123',
    expectedDashboard: '/parent',
  },
];

test.describe('Simple Authentication Test', () => {
  for (const user of TEST_USERS) {
    test(`${user.role} Login Test`, async ({ page }) => {
      console.log(`\n=== Testing ${user.role} Authentication ===`);

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
        await page.screenshot({ path: `debug-${user.role}-1-login-page.png` });

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

        // Step 3: Fill credentials
        console.log(`3. Filling credentials: ${user.email}`);
        await emailInput.first().fill(user.email);
        await passwordInput.first().fill(user.password);
        await page.screenshot({
          path: `debug-${user.role}-2-credentials-filled.png`,
        });

        // Step 4: Submit form
        console.log('4. Submitting login form...');
        await submitButton.first().click();

        // Step 5: Wait for response and check result
        console.log('5. Waiting for login response...');
        await page.waitForTimeout(3000); // Give time for submission
        await page.screenshot({
          path: `debug-${user.role}-3-after-submit.png`,
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

        for (const selector of errorSelectors) {
          try {
            const errorElement = await page
              .locator(selector)
              .first()
              .textContent({ timeout: 1000 });
            if (errorElement) {
              console.log(
                `❌ Error found with selector "${selector}": ${errorElement}`
              );
            }
          } catch {
            // Continue checking other selectors
          }
        }

        // Check if we're still on login page or redirected
        if (currentUrl.includes('/login')) {
          console.log(
            '❌ Still on login page - authentication may have failed'
          );

          // Look for any error indication in page content
          const pageContent = await page.textContent('body');
          console.log(
            'Page content preview:',
            pageContent?.substring(0, 500) + '...'
          );
        } else if (currentUrl.includes(user.expectedDashboard)) {
          console.log(`✅ Successfully redirected to ${user.role} dashboard`);

          // Step 6: Verify dashboard content
          console.log('6. Verifying dashboard content...');
          await page.waitForLoadState('networkidle');
          await page.screenshot({ path: `debug-${user.role}-4-dashboard.png` });

          const dashboardContent = await page.textContent('body');
          console.log(
            `Dashboard content preview:`,
            dashboardContent?.substring(0, 500) + '...'
          );
        } else {
          console.log(`⚠️ Redirected to unexpected URL: ${currentUrl}`);
        }

        console.log(`=== Completed ${user.role} test ===\n`);
      } catch (error) {
        console.log(`❌ Error during ${user.role} test:`, error);
        await page.screenshot({ path: `debug-${user.role}-error.png` });
        throw error;
      }
    });
  }

  test('Site Availability Check', async ({ page }) => {
    console.log('\n=== Site Availability Check ===');

    try {
      console.log('Checking if site is accessible...');
      const response = await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      console.log(`Site response status: ${response?.status()}`);

      if (response?.status() === 200) {
        console.log('✅ Site is accessible');
      } else {
        console.log(`⚠️ Site returned status: ${response?.status()}`);
      }

      await page.screenshot({ path: 'debug-site-home.png' });
      const title = await page.title();
      console.log(`Site title: ${title}`);
    } catch (error) {
      console.log('❌ Site accessibility error:', error);
    }
  });
});
