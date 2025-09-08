import { test, expect } from '@playwright/test';

const DEPLOYED_URL =
  'https://manitos-pintadas-school-4vrborojq-agostinos-projects-903e65da.vercel.app';

test.describe('Deployed Site Authentication Debug', () => {
  test('comprehensive authentication flow analysis', async ({ page }) => {
    console.log('🚀 Starting comprehensive authentication debug...');

    // Enable console logging
    page.on('console', msg => {
      console.log(`🖥️  Console ${msg.type()}: ${msg.text()}`);
    });

    // Monitor network requests
    const requests: any[] = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        timestamp: Date.now(),
      });
    });

    // Monitor responses
    const responses: any[] = [];
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        headers: response.headers(),
        timestamp: Date.now(),
      });
    });

    // Step 1: Navigate to deployed site
    console.log('📍 Step 1: Navigating to deployed site...');
    await page.goto(DEPLOYED_URL);
    await page.waitForLoadState('networkidle');

    console.log('✅ Current URL:', page.url());
    console.log('✅ Page title:', await page.title());

    // Step 2: Check initial cookies
    console.log('📍 Step 2: Checking initial cookies...');
    const initialCookies = await page.context().cookies();
    console.log('🍪 Initial cookies:', initialCookies);

    // Step 3: Navigate to login page
    console.log('📍 Step 3: Navigating to login page...');
    await page.goto(`${DEPLOYED_URL}/login`);
    await page.waitForLoadState('networkidle');

    console.log('✅ Login page URL:', page.url());

    // Check if login form exists
    const loginForm = page.locator('form');
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');

    console.log('🔍 Login form exists:', (await loginForm.count()) > 0);
    console.log('🔍 Email input exists:', (await emailInput.count()) > 0);
    console.log('🔍 Password input exists:', (await passwordInput.count()) > 0);
    console.log('🔍 Submit button exists:', (await submitButton.count()) > 0);

    // Step 4: Fill login form
    console.log('📍 Step 4: Filling login form...');
    await emailInput.fill('admin@manitospintadas.cl');
    await passwordInput.fill('admin123');

    console.log('✅ Form filled with admin credentials');

    // Step 5: Monitor for redirects and submit form
    console.log('📍 Step 5: Submitting form and monitoring redirects...');

    let redirectCount = 0;
    const redirects: string[] = [];

    page.on('response', response => {
      if ([301, 302, 303, 307, 308].includes(response.status())) {
        redirectCount++;
        redirects.push(
          `${response.status()}: ${response.url()} → ${response.headers()['location']}`
        );
        console.log(
          `🔄 Redirect ${redirectCount}: ${response.status()} ${response.url()} → ${response.headers()['location']}`
        );
      }
    });

    // Submit form and wait for navigation
    const navigationPromise = page.waitForNavigation({
      waitUntil: 'networkidle',
    });
    await submitButton.click();

    try {
      await navigationPromise;
      console.log('✅ Navigation completed');
    } catch (error) {
      console.log('⚠️  Navigation timeout or error:', error);
    }

    // Step 6: Check post-login state
    console.log('📍 Step 6: Analyzing post-login state...');
    const currentUrl = page.url();
    console.log('🌍 Current URL after login:', currentUrl);

    // Check cookies after login
    const postLoginCookies = await page.context().cookies();
    console.log('🍪 Post-login cookies:', postLoginCookies);

    // Look for session cookies specifically
    const sessionCookies = postLoginCookies.filter(
      cookie => cookie.name.includes('session') || cookie.name.includes('auth')
    );
    console.log('🔐 Session-related cookies:', sessionCookies);

    // Step 7: Wait and check for automatic redirects
    console.log('📍 Step 7: Monitoring for automatic redirects...');

    let urlAfterWait = currentUrl;
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(1000);
      const newUrl = page.url();
      if (newUrl !== urlAfterWait) {
        console.log(
          `🔄 URL changed after ${i + 1}s: ${urlAfterWait} → ${newUrl}`
        );
        urlAfterWait = newUrl;
      }
    }

    console.log('✅ Final URL after 10s:', page.url());

    // Step 8: Try to access admin dashboard directly
    console.log('📍 Step 8: Testing direct admin dashboard access...');
    await page.goto(`${DEPLOYED_URL}/admin`);
    await page.waitForLoadState('networkidle');

    const adminUrl = page.url();
    console.log('🏛️  Admin dashboard URL:', adminUrl);

    if (adminUrl.includes('/login')) {
      console.log('❌ Redirected back to login - authentication failed');
    } else if (adminUrl.includes('/admin')) {
      console.log('✅ Successfully accessed admin dashboard');
    }

    // Step 9: Check for JavaScript errors
    console.log('📍 Step 9: Checking for JavaScript errors...');
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
      console.log('🚨 JavaScript error:', error.message);
    });

    // Step 10: Analyze middleware logs
    console.log('📍 Step 10: Network analysis...');
    console.log('📊 Total requests:', requests.length);
    console.log('📊 Total responses:', responses.length);
    console.log('📊 Total redirects:', redirectCount);

    // Filter auth-related requests
    const authRequests = requests.filter(
      req => req.url.includes('/api/auth') || req.url.includes('/login')
    );
    console.log('🔐 Auth-related requests:', authRequests);

    // Step 11: Final diagnosis
    console.log('📍 Step 11: Final diagnosis...');
    console.log('🔍 Redirect chain:', redirects);
    console.log('🔍 JavaScript errors:', errors);
    console.log('🔍 Final authentication state:', {
      currentUrl: page.url(),
      hasSessionCookies: sessionCookies.length > 0,
      redirectCount,
      errors: errors.length,
    });

    // Generate comprehensive report
    const report = {
      timestamp: new Date().toISOString(),
      finalUrl: page.url(),
      sessionCookies,
      redirects,
      errors,
      authRequests,
      totalRequests: requests.length,
      totalResponses: responses.length,
    };

    console.log('📋 COMPREHENSIVE AUTHENTICATION REPORT:');
    console.log(JSON.stringify(report, null, 2));
  });
});
