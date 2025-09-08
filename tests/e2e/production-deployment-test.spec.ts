import { test, expect } from '@playwright/test';

// Production URL - should be connected to master branch
const PRODUCTION_URL = 'https://manitos-pintadas.vercel.app';

test.describe('Production Deployment Authentication Test', () => {
  // Test all three user types across all browsers
  const testUsers = [
    {
      email: 'admin@manitospintadas.cl',
      password: 'admin123',
      role: 'ADMIN',
      route: '/admin',
    },
    {
      email: 'profesor@manitospintadas.cl',
      password: 'profesor123',
      role: 'PROFESOR',
      route: '/profesor',
    },
  ];

  testUsers.forEach(user => {
    ['chromium', 'firefox', 'webkit'].forEach(browserType => {
      test(`[${browserType.toUpperCase()}] ${user.role} authentication perfection test`, async ({
        page,
      }) => {
        console.log(`🚀 TESTING ${user.role} ON ${browserType.toUpperCase()}`);

        // Step 1: Navigate to production site
        await page.goto(`${PRODUCTION_URL}/login`);
        await page.waitForLoadState('networkidle');
        console.log(`✅ Production login page loaded`);

        // Step 2: Fill credentials
        await page.fill('input[name="email"]', user.email);
        await page.fill('input[name="password"]', user.password);
        console.log(`✅ ${user.role} credentials filled`);

        // Step 3: Submit and monitor
        const authPromise = page.waitForURL(`${PRODUCTION_URL}${user.route}*`, {
          timeout: 10000,
        });
        await page.click('button[type="submit"]');

        try {
          await authPromise;
          console.log(
            `✅ [${browserType}] ${user.role} authenticated successfully!`
          );

          const finalUrl = page.url();
          expect(finalUrl).toContain(user.route);

          // Step 4: Test dashboard navigation
          if (user.role === 'ADMIN') {
            const adminRoutes = [
              '/admin/usuarios',
              '/admin/calendario',
              '/admin/votaciones',
            ];
            for (const route of adminRoutes) {
              await page.goto(`${PRODUCTION_URL}${route}`);
              await page.waitForLoadState('networkidle');
              expect(page.url()).toContain(route);
              console.log(
                `✅ [${browserType}] Admin navigation to ${route} successful`
              );
            }
          } else if (user.role === 'PROFESOR') {
            const profesorRoutes = [
              '/profesor/planificacion',
              '/profesor/reuniones',
              '/profesor/pme',
            ];
            for (const route of profesorRoutes) {
              await page.goto(`${PRODUCTION_URL}${route}`);
              await page.waitForLoadState('networkidle');
              expect(page.url()).toContain(route);
              console.log(
                `✅ [${browserType}] Profesor navigation to ${route} successful`
              );
            }
          }

          // Step 5: Test session persistence
          await page.reload();
          await page.waitForLoadState('networkidle');
          expect(page.url()).toContain(user.route);
          console.log(
            `✅ [${browserType}] ${user.role} session persists after reload`
          );

          console.log(
            `🎯 [${browserType.toUpperCase()}] ${user.role}: ✅ PERFECT SUCCESS`
          );
        } catch (error) {
          console.error(
            `❌ [${browserType}] ${user.role} authentication FAILED:`,
            error.message
          );

          // Check for error messages
          const errorElement = await page
            .locator('[role="alert"]')
            .first()
            .textContent()
            .catch(() => '');
          if (errorElement) {
            console.error(`❌ Error message: ${errorElement}`);
          }

          throw new Error(
            `Authentication failed for ${user.role} on ${browserType}`
          );
        }
      });
    });
  });

  test('Production database and API health check', async ({ request }) => {
    console.log('🔍 Testing production API health');

    try {
      const healthResponse = await request.get(`${PRODUCTION_URL}/api/health`);
      console.log(`📊 Health check status: ${healthResponse.status()}`);

      if (healthResponse.status() === 200) {
        const healthData = await healthResponse.json();
        console.log('✅ Production API healthy:', healthData);
        expect(healthData.status).toBe('healthy');
        expect(healthData.database).toBe('connected');
      } else {
        throw new Error(
          `Health check failed with status ${healthResponse.status()}`
        );
      }
    } catch (error) {
      console.error('❌ Production health check failed:', error);
      throw error;
    }
  });

  test('Cross-browser compatibility stress test', async ({ browser }) => {
    console.log('🚀 Starting production stress test');

    // Create multiple contexts for parallel authentication
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
    ]);

    const results = await Promise.all(
      contexts.map(async (context, index) => {
        const page = await context.newPage();
        const user = testUsers[index % testUsers.length];

        try {
          await page.goto(`${PRODUCTION_URL}/login`);
          await page.fill('input[name="email"]', user.email);
          await page.fill('input[name="password"]', user.password);
          await page.click('button[type="submit"]');
          await page.waitForURL(`${PRODUCTION_URL}${user.route}*`, {
            timeout: 15000,
          });

          console.log(`✅ Parallel test ${index + 1} (${user.role}) SUCCESS`);
          return true;
        } catch (error) {
          console.error(
            `❌ Parallel test ${index + 1} (${user.role}) FAILED:`,
            error.message
          );
          return false;
        }
      })
    );

    // Clean up contexts
    await Promise.all(contexts.map(ctx => ctx.close()));

    const successRate = (results.filter(r => r).length / results.length) * 100;
    console.log(`📊 Stress test success rate: ${successRate}%`);

    expect(successRate).toBe(100);
    console.log('🎯 PRODUCTION STRESS TEST: ✅ PERFECT SUCCESS');
  });
});
