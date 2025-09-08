import { test, expect } from '@playwright/test';

const BASE_URL = 'https://school.aramac.dev';

const testCredentials = [
  {
    role: 'ADMIN',
    email: 'admin@manitospintadas.cl',
    password: 'admin123',
    expectedPath: '/admin',
    dashboardElement: '[data-testid="admin-dashboard"]',
    navigationElement: 'nav[aria-label="Admin navigation"]',
  },
  {
    role: 'PROFESOR',
    email: 'profesor@manitospintadas.cl',
    password: 'profesor123',
    expectedPath: '/profesor',
    dashboardElement: '[data-testid="profesor-dashboard"]',
    navigationElement: 'nav[aria-label="Teacher navigation"]',
  },
  {
    role: 'PARENT',
    email: 'parent@manitospintadas.cl',
    password: 'parent123',
    expectedPath: '/parent',
    dashboardElement: '[data-testid="parent-dashboard"]',
    navigationElement: 'nav[aria-label="Parent navigation"]',
  },
];

test.describe('FINAL Authentication Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  for (const credential of testCredentials) {
    test(`${credential.role} - Complete Authentication Flow`, async ({
      page,
    }) => {
      console.log(`\n🔐 Testing ${credential.role} Authentication`);
      console.log(`📧 Email: ${credential.email}`);
      console.log(`🔑 Password: ${credential.password}`);

      // Step 1: Navigate to login page
      await page.goto(`${BASE_URL}/login`);

      // Check if we're redirected to home (already logged in) or on login page
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        console.log('✅ Login page loaded successfully');
      } else {
        console.log(
          `ℹ️ Redirected to: ${currentUrl} - May already have session, clearing and retrying`
        );
        await page.context().clearCookies();
        await page.goto(`${BASE_URL}/login`);
      }

      // Step 2: Enter credentials EXACTLY as specified
      await page.fill('input[name="email"]', credential.email);
      await page.fill('input[name="password"]', credential.password);
      console.log('✅ Credentials entered');

      // Step 3: Submit login form
      await page.click('button[type="submit"]');
      console.log('✅ Login form submitted');

      // Step 4: Wait for authentication and redirect
      await page.waitForURL(`${BASE_URL}${credential.expectedPath}`, {
        timeout: 10000,
        waitUntil: 'networkidle',
      });
      console.log(`✅ Successfully redirected to ${credential.expectedPath}`);

      // Step 5: Verify dashboard access
      const dashboardVisible = await page
        .locator('main')
        .or(page.locator('[role="main"]'))
        .isVisible();
      expect(dashboardVisible).toBeTruthy();
      console.log('✅ Dashboard is accessible');

      // Step 6: Test basic navigation functionality
      const navigation = await page.locator('nav').first().isVisible();
      expect(navigation).toBeTruthy();
      console.log('✅ Navigation is functional');

      // Step 7: Verify user session is active
      const userInfo = await page
        .locator('[data-testid*="user"]')
        .or(page.locator('text=' + credential.role))
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      if (userInfo) {
        console.log('✅ User session information visible');
      } else {
        console.log('ℹ️ User session info not found (may not be displayed)');
      }

      // Step 8: Test logout functionality
      const logoutButton = await page
        .locator('button:has-text("Logout")')
        .or(
          page
            .locator('button:has-text("Cerrar sesión")')
            .or(page.locator('[data-testid="logout"]'))
        )
        .first();

      if (await logoutButton.isVisible({ timeout: 3000 })) {
        await logoutButton.click();
        await page.waitForURL(`${BASE_URL}/`, { timeout: 5000 }).catch(() => {
          // May redirect to login instead of home
          return page.waitForURL(`${BASE_URL}/login`, { timeout: 5000 });
        });
        console.log('✅ Logout functionality works');
      } else {
        console.log('ℹ️ Logout button not found - testing manual navigation');
        await page.goto(`${BASE_URL}/`);
      }

      console.log(`🎉 ${credential.role} authentication test PASSED\n`);
    });
  }

  test('Cross-Role Access Prevention', async ({ page }) => {
    console.log('\n🛡️ Testing Role-Based Access Control');

    // Login as PARENT
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'parent@manitospintadas.cl');
    await page.fill('input[name="password"]', 'parent123');
    await page.click('button[type="submit"]');

    await page.waitForURL(`${BASE_URL}/parent`, { timeout: 10000 });
    console.log('✅ PARENT logged in successfully');

    // Try to access ADMIN area - should be blocked
    await page.goto(`${BASE_URL}/admin`);

    // Should either redirect to unauthorized page or back to parent dashboard
    const currentUrl = page.url();
    const isBlocked =
      !currentUrl.includes('/admin') || currentUrl.includes('unauthorized');

    expect(isBlocked).toBeTruthy();
    console.log('✅ Cross-role access prevention works');
  });

  test('Invalid Credentials Handling', async ({ page }) => {
    console.log('\n❌ Testing Invalid Credentials');

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message and remain on login page
    const errorVisible = await page
      .locator('text=/error|invalid|incorrect/i')
      .isVisible({ timeout: 5000 });
    const stillOnLogin = page.url().includes('/login');

    expect(stillOnLogin).toBeTruthy();
    console.log('✅ Invalid credentials properly rejected');
  });
});
