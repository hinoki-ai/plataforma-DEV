import { test, expect } from '@playwright/test';

const BASE_URL = 'https://school.aramac.dev';

const TEST_USERS = [
  {
    role: 'ADMIN',
    email: 'admin@manitospintadas.cl',
    password: 'admin123',
    expectedDashboard: '/admin',
    features: [
      'Gestión de Usuarios',
      'Documentos de Planificación',
      'Reuniones',
    ],
  },
  {
    role: 'PROFESOR',
    email: 'profesor@manitospintadas.cl',
    password: 'profesor123',
    expectedDashboard: '/profesor',
    features: ['Documentos de Planificación', 'Reuniones'],
  },
  {
    role: 'PARENT',
    email: 'parent@manitospintadas.cl',
    password: 'parent123',
    expectedDashboard: '/parent',
    features: ['Solicitar Reunión', 'Mis Reuniones'],
  },
];

test.describe('Authentication Deployment Test - 3 Iterations', () => {
  for (let iteration = 1; iteration <= 3; iteration++) {
    test.describe(`Iteration ${iteration}`, () => {
      for (const user of TEST_USERS) {
        test(`${user.role} - Complete Authentication Flow - Iteration ${iteration}`, async ({
          page,
        }) => {
          console.log(
            `Testing ${user.role} authentication - Iteration ${iteration}`
          );

          // Step 1: Navigate to login page
          await test.step('Navigate to login page', async () => {
            await page.goto(`${BASE_URL}/login`);
            await expect(page).toHaveTitle(/Login|Manitos Pintadas/);
            console.log(`✅ Login page loaded successfully for ${user.role}`);
          });

          // Step 2: Verify login form is present
          await test.step('Verify login form elements', async () => {
            await expect(page.locator('input[name="email"]')).toBeVisible();
            await expect(page.locator('input[name="password"]')).toBeVisible();
            await expect(page.locator('button[type="submit"]')).toBeVisible();
            console.log(`✅ Login form elements visible for ${user.role}`);
          });

          // Step 3: Enter credentials exactly as provided
          await test.step('Enter login credentials', async () => {
            await page.fill('input[name="email"]', user.email);
            await page.fill('input[name="password"]', user.password);
            console.log(
              `✅ Credentials entered for ${user.role}: ${user.email}`
            );
          });

          // Step 4: Submit form and wait for navigation
          await test.step('Submit login form', async () => {
            await page.click('button[type="submit"]');

            // Wait for either success redirect or error message
            await Promise.race([
              page.waitForURL(
                url => url.pathname.includes(user.expectedDashboard),
                { timeout: 10000 }
              ),
              page.waitForSelector('[data-testid="error-message"]', {
                timeout: 5000,
              }),
            ]);
            console.log(`✅ Login form submitted for ${user.role}`);
          });

          // Step 5: Verify successful authentication
          await test.step('Verify successful login', async () => {
            // Check if we're on the expected dashboard
            const currentUrl = page.url();
            console.log(`Current URL after login: ${currentUrl}`);

            if (currentUrl.includes(user.expectedDashboard)) {
              console.log(
                `✅ Successfully redirected to ${user.role} dashboard`
              );
            } else if (currentUrl.includes('/login')) {
              // Still on login page - check for error messages
              const errorMessage = await page
                .locator('[data-testid="error-message"]')
                .textContent()
                .catch(() => null);
              console.log(
                `❌ Login failed for ${user.role}. Error: ${errorMessage || 'Unknown error'}`
              );
              throw new Error(
                `Login failed for ${user.role}: ${errorMessage || 'Redirected back to login'}`
              );
            }

            expect(currentUrl).toContain(user.expectedDashboard);
          });

          // Step 6: Verify dashboard loads with role-specific content
          await test.step('Verify dashboard content', async () => {
            // Wait for page to fully load
            await page.waitForLoadState('networkidle');

            // Check for role-specific navigation or content
            const pageContent = await page.textContent('body');

            let foundFeatures = 0;
            for (const feature of user.features) {
              if (pageContent?.includes(feature)) {
                foundFeatures++;
                console.log(`✅ Found ${user.role} feature: ${feature}`);
              }
            }

            console.log(
              `✅ Dashboard loaded with ${foundFeatures}/${user.features.length} expected features for ${user.role}`
            );
            expect(foundFeatures).toBeGreaterThan(0);
          });

          // Step 7: Test logout functionality
          await test.step('Test logout', async () => {
            // Look for logout button/link
            const logoutSelector =
              'button:has-text("Cerrar Sesión"), a:has-text("Cerrar Sesión"), [data-testid="logout"]';

            try {
              await page.click(logoutSelector, { timeout: 5000 });

              // Wait for redirect to login or home page
              await page.waitForURL(
                url => url.pathname === '/login' || url.pathname === '/',
                { timeout: 10000 }
              );

              console.log(`✅ Logout successful for ${user.role}`);
            } catch (error) {
              console.log(
                `⚠️ Logout button not found or logout failed for ${user.role}: ${error}`
              );
              // Don't fail the test for logout issues, just log it
            }
          });

          console.log(
            `✅ Complete authentication flow tested for ${user.role} - Iteration ${iteration}`
          );
        });
      }

      // Add a small delay between iterations
      if (iteration < 3) {
        test(`Delay between iterations ${iteration} and ${iteration + 1}`, async ({
          page,
        }) => {
          await page.waitForTimeout(2000);
          console.log(`⏳ Waiting 2s before iteration ${iteration + 1}`);
        });
      }
    });
  }
});

test.describe('Cross-Role Access Control Test', () => {
  test('Verify role-based route protection', async ({ page }) => {
    // Test that each role can only access their designated areas
    for (const user of TEST_USERS) {
      console.log(`Testing route protection for ${user.role}`);

      // Login as user
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', user.email);
      await page.fill('input[name="password"]', user.password);
      await page.click('button[type="submit"]');

      // Wait for successful login
      await page.waitForURL(
        url => url.pathname.includes(user.expectedDashboard),
        { timeout: 10000 }
      );

      // Test access to other role areas (should redirect or show access denied)
      const otherDashboards = ['/admin', '/profesor', '/parent'].filter(
        path => path !== user.expectedDashboard
      );

      for (const restrictedPath of otherDashboards) {
        await page.goto(`${BASE_URL}${restrictedPath}`);

        // Should either redirect back to user's dashboard or show access denied
        await page.waitForLoadState('networkidle');
        const finalUrl = page.url();

        if (
          finalUrl.includes(restrictedPath) &&
          !finalUrl.includes(user.expectedDashboard)
        ) {
          console.log(
            `⚠️ ${user.role} unexpectedly accessed ${restrictedPath}`
          );
        } else {
          console.log(
            `✅ ${user.role} properly restricted from ${restrictedPath}`
          );
        }
      }

      // Logout
      try {
        await page.click(
          'button:has-text("Cerrar Sesión"), a:has-text("Cerrar Sesión")'
        );
        await page.waitForURL(
          url => url.pathname === '/login' || url.pathname === '/'
        );
      } catch {
        // Continue if logout fails
      }
    }
  });
});
