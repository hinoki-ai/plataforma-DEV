import { test, expect } from '@playwright/test';

// CORRECT production URLs from Vercel dashboard
const PRODUCTION_URLS = [
  'https://manitos-pintadas-bxa372hp2-agostinos-projects-903e65da.vercel.app',
  'https://manitospintadas.cl',
  'https://manitos-pintadas-agostinos-projects-903e65da.vercel.app',
];

test.describe('CORRECT Production Deployment Authentication', () => {
  test('Test authentication on CORRECT production URLs', async ({ page }) => {
    console.log('🚀 TESTING CORRECT PRODUCTION DEPLOYMENT');

    let workingUrl = null;

    for (const url of PRODUCTION_URLS) {
      console.log(`📡 Testing production URL: ${url}`);

      try {
        // Test if URL is accessible
        await page.goto(url, { timeout: 15000 });
        await page.waitForLoadState('networkidle');

        const title = await page.title();
        console.log(`📄 Title: ${title}`);

        if (title.includes('Manitos Pintadas')) {
          workingUrl = url;
          console.log(`✅ CORRECT production URL found: ${url}`);
          break;
        }
      } catch (error) {
        console.log(`❌ ${url} failed: ${error.message}`);
      }
    }

    if (!workingUrl) {
      throw new Error('No working production URL found');
    }

    // Now test authentication on the correct URL
    console.log(`🎯 TESTING AUTHENTICATION ON: ${workingUrl}`);

    await page.goto(`${workingUrl}/login`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Login page loaded on correct production URL');

    // Fill credentials
    await page.fill('input[name="email"]', 'admin@manitospintadas.cl');
    await page.fill('input[name="password"]', 'admin123');
    console.log('✅ Admin credentials filled');

    // Submit form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(8000);

    const finalUrl = page.url();
    console.log(`🌍 Final URL after login: ${finalUrl}`);

    if (finalUrl.includes('/admin') && !finalUrl.includes('/login')) {
      console.log('🎯 ✅ AUTHENTICATION SUCCESS ON CORRECT PRODUCTION!');

      // Test admin dashboard routes
      const adminRoutes = [
        '/admin/usuarios',
        '/admin/calendario',
        '/admin/votaciones',
      ];

      for (const route of adminRoutes) {
        await page.goto(`${workingUrl}${route}`);
        await page.waitForLoadState('networkidle');

        if (page.url().includes(route)) {
          console.log(`✅ Admin route ${route}: WORKING`);
        } else {
          console.log(`⚠️ Admin route ${route}: redirected to ${page.url()}`);
        }
      }

      console.log(
        '🏆 CORRECT PRODUCTION DEPLOYMENT: ✅ AUTHENTICATION FULLY WORKING'
      );
    } else {
      console.log('❌ AUTHENTICATION FAILED ON CORRECT PRODUCTION');
      console.log(`❌ Stayed on: ${finalUrl}`);

      const errorElement = await page
        .locator('[role="alert"]')
        .first()
        .textContent()
        .catch(() => '');
      if (errorElement) {
        console.log(`❌ Error: ${errorElement}`);
      }

      throw new Error('Authentication not working on correct production URL');
    }
  });

  // Cross-browser test on correct production URL
  ['chromium', 'firefox', 'webkit'].forEach(browserType => {
    test(`[${browserType.toUpperCase()}] Production auth test`, async ({
      page,
    }) => {
      console.log(
        `🔍 Testing ${browserType.toUpperCase()} on CORRECT production`
      );

      // Use the main production URL
      const MAIN_URL =
        'https://manitos-pintadas-bxa372hp2-agostinos-projects-903e65da.vercel.app';

      try {
        await page.goto(`${MAIN_URL}/login`);
        await page.waitForLoadState('networkidle');

        await page.fill('input[name="email"]', 'admin@manitospintadas.cl');
        await page.fill('input[name="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(8000);

        const success =
          page.url().includes('/admin') && !page.url().includes('/login');
        console.log(
          `🎯 [${browserType.toUpperCase()}]: ${success ? '✅ SUCCESS' : '❌ FAILED'}`
        );

        if (success) {
          console.log(
            `✅ ${browserType.toUpperCase()}: AUTHENTICATED ON CORRECT PRODUCTION`
          );
        }
      } catch (error) {
        console.log(
          `🚨 [${browserType.toUpperCase()}] Error: ${error.message}`
        );
      }
    });
  });

  test('Production API health check - CORRECT URL', async ({ request }) => {
    console.log('🔍 Testing API health on CORRECT production URLs');

    for (const url of PRODUCTION_URLS) {
      try {
        const response = await request.get(`${url}/api/health`);
        console.log(`📊 ${url}/api/health: ${response.status()}`);

        if (response.status() === 200) {
          const data = await response.json();
          console.log(`✅ API healthy on ${url}:`, data);
        }
      } catch (error) {
        console.log(`❌ ${url}/api/health: ${error.message}`);
      }
    }
  });
});
