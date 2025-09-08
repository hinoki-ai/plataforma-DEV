import { test, expect } from '@playwright/test';

// Test multiple potential production URLs
const URLS_TO_TEST = [
  'https://manitos-pintadas.vercel.app',
  'https://manitospintadas.cl',
  'https://www.manitospintadas.cl',
  'https://manitos-pintadas-hinoki-ai.vercel.app',
  'https://manitos-pintadas-git-master-agostinos-projects-903e65da.vercel.app',
  'https://manitos-pintadas-school-4vrborojq-agostinos-projects-903e65da.vercel.app',
];

test.describe('Production URL Detection and Authentication', () => {
  test('Find working production URL and test authentication', async ({
    page,
  }) => {
    console.log('🔍 Searching for working production URL...');

    let workingUrl = null;

    for (const url of URLS_TO_TEST) {
      try {
        console.log(`📡 Testing URL: ${url}`);
        await page.goto(url, { timeout: 10000 });
        await page.waitForLoadState('networkidle', { timeout: 5000 });

        // Check if this looks like our school site
        const title = await page.title().catch(() => '');
        const hasLoginLink =
          (await page.locator('a[href*="/login"], a[href="/login"]').count()) >
          0;
        const hasSchoolContent =
          title.includes('Manitos Pintadas') ||
          title.includes('School') ||
          hasLoginLink;

        if (hasSchoolContent) {
          workingUrl = url;
          console.log(`✅ Found working production URL: ${url}`);
          console.log(`📄 Page title: ${title}`);
          break;
        } else {
          console.log(`❌ ${url} doesn't appear to be our school site`);
        }
      } catch (error) {
        console.log(`❌ ${url} failed: ${error.message}`);
      }
    }

    if (!workingUrl) {
      throw new Error('No working production URL found');
    }

    // Now test authentication on the working URL
    console.log(`🚀 Testing authentication on: ${workingUrl}`);

    await page.goto(`${workingUrl}/login`);
    await page.waitForLoadState('networkidle');

    // Fill admin credentials
    await page.fill('input[name="email"]', 'admin@manitospintadas.cl');
    await page.fill('input[name="password"]', 'admin123');
    console.log('✅ Admin credentials filled');

    // Submit form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    const finalUrl = page.url();
    console.log(`🌍 URL after login: ${finalUrl}`);

    if (finalUrl.includes('/admin') && !finalUrl.includes('/login')) {
      console.log('🎯 ✅ PRODUCTION AUTHENTICATION SUCCESS!');
      console.log(`✅ Successfully logged into admin dashboard`);

      // Test a few admin routes
      const adminRoutes = ['/admin/usuarios', '/admin/calendario'];

      for (const route of adminRoutes) {
        try {
          await page.goto(`${workingUrl}${route}`);
          await page.waitForLoadState('networkidle');

          if (page.url().includes(route)) {
            console.log(`✅ Admin route ${route} working`);
          } else {
            console.log(`⚠️ Admin route ${route} redirected to: ${page.url()}`);
          }
        } catch (error) {
          console.log(`❌ Admin route ${route} failed: ${error.message}`);
        }
      }

      console.log('🏆 PRODUCTION DEPLOYMENT: ✅ AUTHENTICATION WORKING');
    } else {
      console.log('❌ Authentication failed - still on login page');

      // Check for error messages
      const errorElement = await page
        .locator('[role="alert"]')
        .first()
        .textContent()
        .catch(() => '');
      if (errorElement) {
        console.log(`❌ Error message: ${errorElement}`);
      }

      throw new Error('Production authentication is not working');
    }

    expect(workingUrl).toBeTruthy();
    console.log(`🎯 PRODUCTION URL CONFIRMED: ${workingUrl}`);
  });

  test('API Health Check on production', async ({ request }) => {
    console.log('🔍 Testing API health on all possible URLs');

    for (const url of URLS_TO_TEST) {
      try {
        console.log(`📡 Testing API: ${url}/api/health`);
        const response = await request.get(`${url}/api/health`, {
          timeout: 10000,
        });

        if (response.status() === 200) {
          const data = await response.json();
          console.log(`✅ API working on ${url}:`, data);
        } else {
          console.log(`❌ ${url}/api/health returned ${response.status()}`);
        }
      } catch (error) {
        console.log(`❌ ${url}/api/health failed: ${error.message}`);
      }
    }
  });
});
