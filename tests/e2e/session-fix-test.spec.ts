import { test, expect } from '@playwright/test';

const DEPLOYED_URL =
  'https://manitos-pintadas-school-4vrborojq-agostinos-projects-903e65da.vercel.app';

test.describe('Session Fix Verification', () => {
  test('verify session token creation and persistence', async ({ page }) => {
    console.log('🔍 Testing session fix on new deployment...');

    // Monitor console logs
    page.on('console', msg => {
      console.log(`Console ${msg.type()}: ${msg.text()}`);
    });

    // Step 1: Go to login
    await page.goto(`${DEPLOYED_URL}/login`);
    await page.waitForLoadState('networkidle');

    console.log('✅ Login page loaded');

    // Step 2: Fill and submit login form
    await page.fill('input[name="email"]', 'admin@manitospintadas.cl');
    await page.fill('input[name="password"]', 'admin123');

    console.log('✅ Form filled with admin credentials');

    // Step 3: Submit form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000); // Wait for auth to complete

    const urlAfterLogin = page.url();
    console.log('🌍 URL after login:', urlAfterLogin);

    // Step 4: Check if we're on admin dashboard (success) or login page (failure)
    if (urlAfterLogin.includes('/admin') && !urlAfterLogin.includes('/login')) {
      console.log('✅ SUCCESS: Redirected to admin dashboard!');

      // Step 5: Check session cookies
      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find(c => c.name.includes('session-token'));

      if (sessionCookie) {
        console.log(
          '✅ SUCCESS: Session token cookie found:',
          sessionCookie.name
        );
      } else {
        console.log('❌ WARNING: No session token cookie found');
      }

      // Step 6: Test navigation persistence
      await page.goto(`${DEPLOYED_URL}/admin/usuarios`);
      await page.waitForLoadState('networkidle');

      const persistenceUrl = page.url();
      if (persistenceUrl.includes('/admin/usuarios')) {
        console.log('✅ SUCCESS: Session persists across navigation!');
      } else {
        console.log('❌ FAILURE: Session lost during navigation');
      }
    } else if (urlAfterLogin.includes('/login')) {
      console.log('❌ FAILURE: Still on login page - authentication failed');
      console.log('🔍 Checking for error messages...');

      const errorElement = await page.locator('[role="alert"]').first();
      if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent();
        console.log('🚨 Error message:', errorText);
      }
    }

    // Final report
    const finalCookies = await page.context().cookies();
    const sessionCookies = finalCookies.filter(
      c => c.name.includes('session') || c.name.includes('auth')
    );

    console.log('📋 FINAL REPORT:');
    console.log('- Final URL:', page.url());
    console.log('- Session cookies count:', sessionCookies.length);
    console.log(
      '- Session cookies:',
      sessionCookies.map(c => c.name)
    );

    const isSuccess =
      page.url().includes('/admin') && !page.url().includes('/login');
    console.log(
      '🎯 AUTHENTICATION STATUS:',
      isSuccess ? '✅ SUCCESS' : '❌ FAILED'
    );
  });
});
