import { test, expect } from '@playwright/test';

const BASE_URL = 'https://school.aramac.dev';

test.describe('Direct API Authentication Test', () => {
  test('Test Direct API Authentication for ADMIN', async ({ page }) => {
    console.log('\n=== DIRECT API AUTH TEST FOR ADMIN ===');

    // Track all requests
    page.on('request', request => {
      if (request.url().includes('api/auth') || request.method() === 'POST') {
        console.log(`REQUEST: ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', response => {
      if (response.url().includes('api/auth')) {
        console.log(`RESPONSE: ${response.status()} ${response.url()}`);
      }
    });

    try {
      // First, get the CSRF token
      console.log('1. Getting CSRF token...');
      const csrfResponse = await page.request.get(`${BASE_URL}/api/auth/csrf`);
      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.csrfToken;
      console.log(`CSRF Token: ${csrfToken?.substring(0, 20)}...`);

      // Try direct API authentication
      console.log('2. Attempting direct API authentication...');
      const authResponse = await page.request.post(
        `${BASE_URL}/api/auth/signin/credentials`,
        {
          form: {
            email: 'admin@manitospintadas.cl',
            password: 'admin123',
            csrfToken: csrfToken,
            callbackUrl: `${BASE_URL}/admin`,
          },
        }
      );

      console.log(`Direct API auth status: ${authResponse.status()}`);
      const authHeaders = authResponse.headers();
      console.log('Auth response headers:', Object.keys(authHeaders));

      if (authHeaders['set-cookie']) {
        console.log(
          'Set-Cookie headers present:',
          authHeaders['set-cookie'].substring(0, 200)
        );
      }

      if (authHeaders['location']) {
        console.log('Redirect location:', authHeaders['location']);
      }

      // Get response text to see what's returned
      const authText = await authResponse.text();
      console.log('Auth response body:', authText.substring(0, 500));

      // Now try to access admin dashboard
      console.log('3. Trying to access admin dashboard...');
      await page.goto(`${BASE_URL}/admin`);

      await page.waitForTimeout(3000);
      const currentUrl = page.url();
      console.log(`Current URL: ${currentUrl}`);

      if (currentUrl.includes('/admin')) {
        console.log('✅ Successfully accessed admin dashboard');
        await page.screenshot({ path: 'debug-admin-dashboard-success.png' });

        // Check for admin-specific content
        const pageContent = await page.textContent('body');
        const adminKeywords = ['admin', 'gestión', 'usuarios', 'configuración'];
        const foundKeywords = adminKeywords.filter(keyword =>
          pageContent?.toLowerCase().includes(keyword.toLowerCase())
        );
        console.log(`Found admin keywords: ${foundKeywords.join(', ')}`);
      } else if (currentUrl.includes('/login')) {
        console.log('❌ Redirected back to login - authentication failed');
      } else {
        console.log(`⚠️ Redirected to unexpected URL: ${currentUrl}`);
      }
    } catch (error) {
      console.log('❌ Error during direct API test:', error);
    }
  });

  test('Test Current Form Submission Process', async ({ page }) => {
    console.log('\n=== TESTING CURRENT FORM SUBMISSION PROCESS ===');

    // Track form submission
    let formSubmissionData = null;
    page.on('request', request => {
      if (request.url().includes('/login') && request.method() === 'POST') {
        console.log(`FORM POST to: ${request.url()}`);
        console.log(`Form data: ${request.postData()?.substring(0, 500)}...`);
        formSubmissionData = request.postData();
      }
      if (request.url().includes('api/auth')) {
        console.log(`AUTH API: ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', async response => {
      if (
        response.url().includes('/login') &&
        response.request().method() === 'POST'
      ) {
        console.log(`FORM RESPONSE: ${response.status()}`);
        const headers = response.headers();
        if (headers['location']) {
          console.log(`Redirect to: ${headers['location']}`);
        }
        if (headers['set-cookie']) {
          console.log(
            `Set cookies: ${headers['set-cookie'].substring(0, 200)}...`
          );
        }

        try {
          const responseText = await response.text();
          console.log(
            `Response body preview: ${responseText.substring(0, 300)}...`
          );
        } catch (e) {
          console.log('Could not read response body');
        }
      }
    });

    try {
      // Navigate to login page
      console.log('1. Navigating to login page...');
      await page.goto(`${BASE_URL}/login`);

      // Fill the form
      console.log('2. Filling login form...');
      await page.fill('input[name="email"]', 'admin@manitospintadas.cl');
      await page.fill('input[name="password"]', 'admin123');

      // Submit the form
      console.log('3. Submitting form...');
      await page.click('button[type="submit"]');

      // Wait and observe
      await page.waitForTimeout(5000);

      const currentUrl = page.url();
      console.log(`Final URL: ${currentUrl}`);

      if (formSubmissionData) {
        console.log('Form submission captured successfully');
      } else {
        console.log('❌ Form submission not captured');
      }

      // Check session after form submission
      console.log('4. Checking session after form submission...');
      const sessionResponse = await page.request.get(
        `${BASE_URL}/api/auth/session`
      );
      const sessionData = await sessionResponse.text();
      console.log(`Session data: ${sessionData}`);

      if (sessionData !== 'null' && sessionData.includes('user')) {
        console.log('✅ Session established after login');
      } else {
        console.log('❌ No session established');
      }
    } catch (error) {
      console.log('❌ Error during form submission test:', error);
    }
  });

  test('Manual NextAuth Credentials Test', async ({ page }) => {
    console.log('\n=== MANUAL NEXTAUTH CREDENTIALS TEST ===');

    try {
      // Navigate to the NextAuth credentials signin page directly
      console.log('1. Going to NextAuth credentials signin page...');
      await page.goto(`${BASE_URL}/api/auth/signin/credentials`);
      await page.waitForTimeout(2000);

      const signinUrl = page.url();
      console.log(`Signin page URL: ${signinUrl}`);

      await page.screenshot({ path: 'debug-nextauth-signin-page.png' });

      // Check if there's a NextAuth form
      const formExists = await page.locator('form').count();
      console.log(`Found ${formExists} forms on NextAuth signin page`);

      if (formExists > 0) {
        // Try to fill the NextAuth form if it exists
        console.log('2. Attempting to use NextAuth form...');

        const emailInput = page
          .locator(
            'input[name="username"], input[name="email"], input[type="email"]'
          )
          .first();
        const passwordInput = page
          .locator('input[name="password"], input[type="password"]')
          .first();
        const submitButton = page
          .locator('button[type="submit"], input[type="submit"]')
          .first();

        if (
          (await emailInput.isVisible()) &&
          (await passwordInput.isVisible())
        ) {
          await emailInput.fill('admin@manitospintadas.cl');
          await passwordInput.fill('admin123');

          console.log('3. Submitting NextAuth form...');
          await submitButton.click();

          await page.waitForTimeout(3000);

          const finalUrl = page.url();
          console.log(`Final URL after NextAuth submission: ${finalUrl}`);

          if (finalUrl.includes('/admin')) {
            console.log('✅ NextAuth credentials authentication successful');
          } else {
            console.log('❌ NextAuth credentials authentication failed');
          }
        } else {
          console.log('❌ NextAuth form inputs not found');
        }
      } else {
        console.log('❌ No forms found on NextAuth signin page');

        // Check page content
        const pageContent = await page.textContent('body');
        console.log('Page content:', pageContent?.substring(0, 500));
      }
    } catch (error) {
      console.log('❌ Error during NextAuth test:', error);
    }
  });
});
