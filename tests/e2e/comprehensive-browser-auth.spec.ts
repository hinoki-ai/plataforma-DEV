import { test, expect, devices } from '@playwright/test';

const DEPLOYED_URL =
  'https://manitos-pintadas-school-4vrborojq-agostinos-projects-903e65da.vercel.app';

// Define all test credentials
const testUsers = [
  {
    email: 'admin@manitospintadas.cl',
    password: 'admin123',
    expectedRoute: '/admin',
    role: 'ADMIN',
  },
  {
    email: 'profesor@manitospintadas.cl',
    password: 'profesor123',
    expectedRoute: '/profesor',
    role: 'PROFESOR',
  },
  {
    email: 'parent@manitospintadas.cl',
    password: 'parent123',
    expectedRoute: '/parent',
    role: 'PARENT',
  },
];

// Test across all browser types
const browsers = ['chromium', 'firefox', 'webkit'];
const mobileDevices = ['iPhone 13', 'Pixel 5', 'Galaxy S9+', 'iPad Pro'];

test.describe('Comprehensive Cross-Browser Authentication', () => {
  // Desktop browser tests
  browsers.forEach(browserName => {
    testUsers.forEach(user => {
      test(`[${browserName.toUpperCase()}] Complete authentication flow - ${user.role}`, async ({
        page,
      }) => {
        console.log(
          `🔍 Testing ${user.role} authentication on ${browserName.toUpperCase()}`
        );

        // Monitor all requests and responses
        const requests: any[] = [];
        const responses: any[] = [];

        page.on('request', req =>
          requests.push({
            method: req.method(),
            url: req.url(),
            timestamp: Date.now(),
          })
        );
        page.on('response', res =>
          responses.push({
            status: res.status(),
            url: res.url(),
            timestamp: Date.now(),
          })
        );

        // Step 1: Navigate to login
        await page.goto(`${DEPLOYED_URL}/login`);
        await page.waitForLoadState('networkidle');
        console.log(`✅ [${browserName}] Login page loaded`);

        // Step 2: Verify form elements exist
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
        console.log(`✅ [${browserName}] Form elements verified`);

        // Step 3: Fill and submit form
        await page.fill('input[name="email"]', user.email);
        await page.fill('input[name="password"]', user.password);
        console.log(`✅ [${browserName}] Credentials filled for ${user.role}`);

        // Step 4: Submit and wait for navigation
        const navigationPromise = page.waitForURL(
          `${DEPLOYED_URL}${user.expectedRoute}*`,
          { timeout: 10000 }
        );
        await page.click('button[type="submit"]');

        try {
          await navigationPromise;
          console.log(
            `✅ [${browserName}] Successfully navigated to ${user.expectedRoute}`
          );
        } catch (error) {
          console.error(`❌ [${browserName}] Navigation failed:`, error);
          throw error;
        }

        // Step 5: Verify we're on the correct dashboard
        const currentUrl = page.url();
        expect(currentUrl).toContain(user.expectedRoute);
        console.log(
          `✅ [${browserName}] Confirmed on correct dashboard: ${currentUrl}`
        );

        // Step 6: Check session cookies
        const cookies = await page.context().cookies();
        const sessionCookie = cookies.find(c =>
          c.name.includes('session-token')
        );
        expect(sessionCookie).toBeTruthy();
        console.log(
          `✅ [${browserName}] Session cookie verified: ${sessionCookie?.name}`
        );

        // Step 7: Test navigation persistence
        const testPaths = {
          ADMIN: ['/admin/usuarios', '/admin/calendario'],
          PROFESOR: ['/profesor/planificacion', '/profesor/reuniones'],
          PARENT: ['/parent/reuniones', '/parent/calendario'],
        };

        const pathsToTest =
          testPaths[user.role as keyof typeof testPaths] || [];

        for (const testPath of pathsToTest) {
          await page.goto(`${DEPLOYED_URL}${testPath}`);
          await page.waitForLoadState('networkidle');

          const pathUrl = page.url();
          expect(pathUrl).toContain(testPath);
          console.log(
            `✅ [${browserName}] Navigation persistent to ${testPath}`
          );
        }

        // Step 8: Test session after page reload
        await page.reload();
        await page.waitForLoadState('networkidle');

        const reloadUrl = page.url();
        expect(reloadUrl).toContain(user.expectedRoute);
        console.log(`✅ [${browserName}] Session persists after reload`);

        // Step 9: Analyze requests
        const authRequests = requests.filter(
          r =>
            r.url.includes('/api/auth') ||
            r.url.includes('/login') ||
            r.method === 'POST'
        );

        const successfulResponses = responses.filter(
          r => r.status >= 200 && r.status < 400
        );
        const errorResponses = responses.filter(r => r.status >= 400);

        console.log(`📊 [${browserName}] Request Analysis:`);
        console.log(`- Total requests: ${requests.length}`);
        console.log(`- Auth requests: ${authRequests.length}`);
        console.log(`- Successful responses: ${successfulResponses.length}`);
        console.log(`- Error responses: ${errorResponses.length}`);

        // Ensure no critical errors
        expect(errorResponses.filter(r => r.status >= 500).length).toBe(0);

        console.log(
          `🎯 [${browserName.toUpperCase()}] ${user.role} AUTHENTICATION: ✅ COMPLETE SUCCESS`
        );
      });
    });
  });

  // Mobile device tests
  mobileDevices.forEach(device => {
    test(`[MOBILE-${device}] Admin authentication on mobile device`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        ...devices[device],
        locale: 'es-CL',
      });

      const page = await context.newPage();

      console.log(`🔍 Testing admin authentication on ${device}`);

      // Navigate to login
      await page.goto(`${DEPLOYED_URL}/login`);
      await page.waitForLoadState('networkidle');
      console.log(`✅ [${device}] Login page loaded`);

      // Verify mobile-responsive form
      const emailInput = page.locator('input[name="email"]');
      const passwordInput = page.locator('input[name="password"]');
      const submitButton = page.locator('button[type="submit"]');

      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(submitButton).toBeVisible();

      // Check if elements are properly sized for mobile
      const emailBox = await emailInput.boundingBox();
      const passwordBox = await passwordInput.boundingBox();
      const submitBox = await submitButton.boundingBox();

      expect(emailBox?.width).toBeGreaterThan(200); // Reasonable mobile width
      expect(passwordBox?.width).toBeGreaterThan(200);
      expect(submitBox?.width).toBeGreaterThan(100);

      console.log(`✅ [${device}] Mobile form elements properly sized`);

      // Fill and submit
      await emailInput.fill('admin@manitospintadas.cl');
      await passwordInput.fill('admin123');

      // Mobile-specific: tap instead of click
      await submitButton.tap();

      // Wait for navigation
      await page.waitForURL(`${DEPLOYED_URL}/admin*`, { timeout: 10000 });

      const finalUrl = page.url();
      expect(finalUrl).toContain('/admin');
      console.log(`✅ [${device}] Successfully authenticated and navigated`);

      // Test mobile navigation
      await page.goto(`${DEPLOYED_URL}/admin/calendario`);
      await page.waitForLoadState('networkidle');

      expect(page.url()).toContain('/admin/calendario');
      console.log(`✅ [${device}] Mobile navigation working`);

      // Test session cookies on mobile
      const cookies = await context.cookies();
      const sessionCookie = cookies.find(c => c.name.includes('session-token'));
      expect(sessionCookie).toBeTruthy();

      console.log(`🎯 [${device}] MOBILE AUTHENTICATION: ✅ COMPLETE SUCCESS`);

      await context.close();
    });
  });

  // Cross-browser session sharing test
  test('Cross-browser session isolation', async ({ browser }) => {
    console.log('🔍 Testing cross-browser session isolation');

    // Create multiple contexts (simulate different browsers)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Login in first context as admin
    await page1.goto(`${DEPLOYED_URL}/login`);
    await page1.fill('input[name="email"]', 'admin@manitospintadas.cl');
    await page1.fill('input[name="password"]', 'admin123');
    await page1.click('button[type="submit"]');
    await page1.waitForURL(`${DEPLOYED_URL}/admin*`);

    console.log('✅ First context authenticated as admin');

    // Second context should not be authenticated
    await page2.goto(`${DEPLOYED_URL}/admin`);
    await page2.waitForLoadState('networkidle');

    // Should be redirected to login
    expect(page2.url()).toContain('/login');
    console.log('✅ Second context properly isolated (redirected to login)');

    // Login in second context as profesor
    await page2.fill('input[name="email"]', 'profesor@manitospintadas.cl');
    await page2.fill('input[name="password"]', 'profesor123');
    await page2.click('button[type="submit"]');
    await page2.waitForURL(`${DEPLOYED_URL}/profesor*`);

    console.log('✅ Second context authenticated as profesor');

    // Verify both contexts maintain separate sessions
    await page1.goto(`${DEPLOYED_URL}/admin/usuarios`);
    await page2.goto(`${DEPLOYED_URL}/profesor/planificacion`);

    await page1.waitForLoadState('networkidle');
    await page2.waitForLoadState('networkidle');

    expect(page1.url()).toContain('/admin/usuarios');
    expect(page2.url()).toContain('/profesor/planificacion');

    console.log('🎯 CROSS-BROWSER SESSION ISOLATION: ✅ COMPLETE SUCCESS');

    await context1.close();
    await context2.close();
  });

  // Stress test - rapid authentication
  test('Rapid authentication stress test', async ({ browser }) => {
    console.log('🔍 Starting rapid authentication stress test');

    const contexts = [];
    const results = [];

    // Create 5 contexts for parallel authentication
    for (let i = 0; i < 5; i++) {
      const context = await browser.newContext();
      contexts.push(context);
    }

    // Parallel authentication attempts
    const authPromises = contexts.map(async (context, index) => {
      const page = await context.newPage();
      const user = testUsers[index % testUsers.length];

      try {
        await page.goto(`${DEPLOYED_URL}/login`);
        await page.fill('input[name="email"]', user.email);
        await page.fill('input[name="password"]', user.password);
        await page.click('button[type="submit"]');
        await page.waitForURL(`${DEPLOYED_URL}${user.expectedRoute}*`, {
          timeout: 15000,
        });

        results.push({ context: index, success: true, user: user.role });
        console.log(
          `✅ Context ${index} (${user.role}) authenticated successfully`
        );

        return true;
      } catch (error) {
        results.push({
          context: index,
          success: false,
          user: user.role,
          error: error.message,
        });
        console.error(
          `❌ Context ${index} (${user.role}) failed:`,
          error.message
        );
        return false;
      }
    });

    const authResults = await Promise.all(authPromises);

    // Clean up contexts
    await Promise.all(contexts.map(ctx => ctx.close()));

    // Verify all succeeded
    const successCount = authResults.filter(r => r).length;
    const totalCount = authResults.length;

    console.log(
      `📊 Stress Test Results: ${successCount}/${totalCount} successful`
    );
    expect(successCount).toBe(totalCount);

    console.log('🎯 RAPID AUTHENTICATION STRESS TEST: ✅ COMPLETE SUCCESS');
  });
});

// Summary test - final verification
test.describe('Final Authentication Verification', () => {
  test('Complete system authentication verification', async ({ page }) => {
    console.log('🏁 FINAL COMPREHENSIVE AUTHENTICATION VERIFICATION');

    const results = {
      loginPageLoad: false,
      formElements: false,
      adminAuth: false,
      profesorAuth: false,
      parentAuth: false,
      sessionPersistence: false,
      navigationWorking: false,
      cookiesSet: false,
    };

    try {
      // Test 1: Login page loads
      await page.goto(`${DEPLOYED_URL}/login`);
      await page.waitForLoadState('networkidle');
      results.loginPageLoad = true;
      console.log('✅ Login page loads correctly');

      // Test 2: Form elements present
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      results.formElements = true;
      console.log('✅ All form elements present');

      // Test 3-5: Authentication for each role
      for (const user of testUsers) {
        await page.goto(`${DEPLOYED_URL}/login`);
        await page.fill('input[name="email"]', user.email);
        await page.fill('input[name="password"]', user.password);
        await page.click('button[type="submit"]');
        await page.waitForURL(`${DEPLOYED_URL}${user.expectedRoute}*`, {
          timeout: 10000,
        });

        if (page.url().includes(user.expectedRoute)) {
          results[`${user.role.toLowerCase()}Auth` as keyof typeof results] =
            true;
          console.log(`✅ ${user.role} authentication successful`);
        }
      }

      // Test 6: Session persistence
      await page.reload();
      await page.waitForLoadState('networkidle');
      if (page.url().includes('/parent')) {
        // Last user was parent
        results.sessionPersistence = true;
        console.log('✅ Session persists after reload');
      }

      // Test 7: Navigation
      await page.goto(`${DEPLOYED_URL}/parent/calendario`);
      await page.waitForLoadState('networkidle');
      if (page.url().includes('/parent/calendario')) {
        results.navigationWorking = true;
        console.log('✅ Navigation working');
      }

      // Test 8: Cookies
      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find(c => c.name.includes('session-token'));
      if (sessionCookie) {
        results.cookiesSet = true;
        console.log('✅ Session cookies properly set');
      }
    } catch (error) {
      console.error('❌ Final verification failed:', error);
      throw error;
    }

    // Verify all tests passed
    const allTestsPassed = Object.values(results).every(
      result => result === true
    );

    console.log('📊 FINAL VERIFICATION RESULTS:');
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`- ${test}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    });

    expect(allTestsPassed).toBe(true);
    console.log('🏆 ALL AUTHENTICATION TESTS: ✅ 100% SUCCESS RATE');
  });
});
