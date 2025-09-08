import { test, expect } from '@playwright/test';

const DEPLOYED_URL =
  'https://manitos-pintadas-school-4vrborojq-agostinos-projects-903e65da.vercel.app';

test.describe('Browser Compatibility Debug', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserType => {
    test(`[${browserType.toUpperCase()}] Deep browser compatibility analysis`, async ({
      page,
    }) => {
      console.log(`🔍 Deep analysis for ${browserType.toUpperCase()}`);

      // Monitor JavaScript errors
      const jsErrors: string[] = [];
      page.on('pageerror', error => {
        jsErrors.push(error.message);
        console.error(`🚨 [${browserType}] JavaScript error: ${error.message}`);
      });

      // Monitor console logs
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.error(`🖥️ [${browserType}] Console error: ${msg.text()}`);
        }
      });

      // Monitor network requests/responses
      const authRequests: any[] = [];
      const allResponses: any[] = [];

      page.on('request', req => {
        if (req.method() === 'POST' || req.url().includes('auth')) {
          authRequests.push({
            method: req.method(),
            url: req.url(),
            headers: req.headers(),
            timestamp: Date.now(),
          });
          console.log(
            `📤 [${browserType}] AUTH REQUEST: ${req.method()} ${req.url()}`
          );
        }
      });

      page.on('response', res => {
        if (
          res.url().includes('login') ||
          res.url().includes('auth') ||
          res.status() >= 300
        ) {
          allResponses.push({
            status: res.status(),
            url: res.url(),
            headers: res.headers(),
            timestamp: Date.now(),
          });
          console.log(
            `📥 [${browserType}] AUTH RESPONSE: ${res.status()} ${res.url()}`
          );
        }
      });

      // Step 1: Navigate to login
      await page.goto(`${DEPLOYED_URL}/login`);
      await page.waitForLoadState('networkidle');
      console.log(`✅ [${browserType}] Login page loaded`);

      // Step 2: Check initial cookies
      const initialCookies = await page.context().cookies();
      const csrfCookie = initialCookies.find(c => c.name.includes('csrf'));
      console.log(
        `🍪 [${browserType}] Initial CSRF cookie: ${csrfCookie ? 'Found' : 'Missing'}`
      );

      // Step 3: Check form action and method
      const form = page.locator('form');
      const formAction = await form.getAttribute('action');
      const formMethod = await form.getAttribute('method');
      console.log(`📋 [${browserType}] Form action: ${formAction}`);
      console.log(`📋 [${browserType}] Form method: ${formMethod}`);

      // Step 4: Check if NextAuth CSRF token is present
      const csrfInput = page.locator('input[name="csrfToken"]');
      const hasCsrfInput = (await csrfInput.count()) > 0;
      console.log(
        `🔐 [${browserType}] CSRF token input: ${hasCsrfInput ? 'Present' : 'Missing'}`
      );

      if (hasCsrfInput) {
        const csrfValue = await csrfInput.getAttribute('value');
        console.log(
          `🔐 [${browserType}] CSRF token value length: ${csrfValue?.length || 0}`
        );
      }

      // Step 5: Fill form
      await page.fill('input[name="email"]', 'admin@manitospintadas.cl');
      await page.fill('input[name="password"]', 'admin123');
      console.log(`✅ [${browserType}] Form filled`);

      // Step 6: Check form data before submission
      const emailValue = await page.inputValue('input[name="email"]');
      const passwordValue = await page.inputValue('input[name="password"]');
      console.log(`📝 [${browserType}] Email value: ${emailValue}`);
      console.log(
        `📝 [${browserType}] Password length: ${passwordValue.length}`
      );

      // Step 7: Submit form and monitor what happens
      console.log(`🚀 [${browserType}] Submitting form...`);

      let formSubmissionDetected = false;
      let redirectDetected = false;

      // Monitor form submission
      const submissionPromise = new Promise(resolve => {
        const timeout = setTimeout(() => {
          console.log(`⏰ [${browserType}] Form submission timeout after 10s`);
          resolve(false);
        }, 10000);

        page.on('request', request => {
          if (request.method() === 'POST' && request.url().includes('login')) {
            formSubmissionDetected = true;
            console.log(`📮 [${browserType}] Form submission detected!`);
            clearTimeout(timeout);
            resolve(true);
          }
        });

        page.on('response', response => {
          if ([301, 302, 303, 307, 308].includes(response.status())) {
            redirectDetected = true;
            const location = response.headers()['location'];
            console.log(
              `🔄 [${browserType}] Redirect detected: ${response.status()} -> ${location}`
            );
          }
        });
      });

      await page.click('button[type="submit"]');
      await submissionPromise;

      // Wait for potential navigation
      await page.waitForTimeout(5000);

      // Step 8: Check final state
      const finalUrl = page.url();
      const finalCookies = await page.context().cookies();
      const sessionCookie = finalCookies.find(c =>
        c.name.includes('session-token')
      );

      console.log(`📊 [${browserType.toUpperCase()}] FINAL ANALYSIS:`);
      console.log(`- JavaScript errors: ${jsErrors.length}`);
      console.log(`- Form submitted: ${formSubmissionDetected}`);
      console.log(`- Redirect detected: ${redirectDetected}`);
      console.log(`- Final URL: ${finalUrl}`);
      console.log(`- Session cookie: ${sessionCookie ? 'Created' : 'Missing'}`);
      console.log(`- Auth requests: ${authRequests.length}`);
      console.log(`- Auth responses: ${allResponses.length}`);

      // Step 9: Browser-specific checks
      if (browserType === 'firefox') {
        // Check if Firefox has specific issues
        const userAgent = await page.evaluate(() => navigator.userAgent);
        console.log(`🦊 [${browserType}] User Agent: ${userAgent}`);

        // Check if cookies are being set properly
        const cookieNames = finalCookies.map(c => c.name);
        console.log(
          `🦊 [${browserType}] All cookies: ${cookieNames.join(', ')}`
        );
      }

      if (browserType === 'webkit') {
        // Check WebKit specific issues
        const userAgent = await page.evaluate(() => navigator.userAgent);
        console.log(`🍎 [${browserType}] User Agent: ${userAgent}`);

        // Check if WebKit is blocking third-party cookies
        const cookieSettings = await page.evaluate(() => {
          return {
            cookieEnabled: navigator.cookieEnabled,
            storage: typeof localStorage !== 'undefined',
          };
        });
        console.log(`🍎 [${browserType}] Cookie settings:`, cookieSettings);
      }

      // Report success/failure
      const isSuccess = finalUrl.includes('/admin') && sessionCookie;
      console.log(
        `🎯 [${browserType.toUpperCase()}]: ${isSuccess ? '✅ SUCCESS' : '❌ FAILED'}`
      );

      if (jsErrors.length > 0) {
        console.log(`🚨 [${browserType}] JavaScript errors found:`, jsErrors);
      }
    });
  });
});
