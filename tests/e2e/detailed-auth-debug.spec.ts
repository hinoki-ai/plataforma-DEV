import { test, expect } from '@playwright/test';

const BASE_URL = 'https://school.aramac.dev';

test.describe('Detailed Authentication Debug', () => {
  test('Debug ADMIN Login Flow', async ({ page }) => {
    console.log('\n=== DETAILED ADMIN LOGIN DEBUG ===');

    // Track network requests
    const requests = [];
    const responses = [];

    page.on('request', request => {
      if (request.url().includes('api/auth') || request.method() === 'POST') {
        requests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData(),
        });
        console.log(`REQUEST: ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', response => {
      if (response.url().includes('api/auth') || response.status() >= 400) {
        responses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers(),
        });
        console.log(`RESPONSE: ${response.status()} ${response.url()}`);
      }
    });

    // Enable console logging
    page.on('console', msg => {
      if (
        msg.type() === 'error' ||
        msg.text().includes('error') ||
        msg.text().includes('fail')
      ) {
        console.log(`BROWSER ERROR: ${msg.text()}`);
      }
    });

    try {
      // Step 1: Navigate to login
      console.log('1. Navigating to login page...');
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

      // Step 2: Take screenshot of login page
      await page.screenshot({
        path: 'debug-login-page-detailed.png',
        fullPage: true,
      });

      // Step 3: Inspect the actual form HTML
      console.log('2. Inspecting login form HTML...');
      const formHTML = await page
        .innerHTML('form')
        .catch(() => 'No form found');
      console.log('Form HTML:', formHTML.substring(0, 1000));

      // Step 4: Find input fields more specifically
      console.log('3. Finding input fields...');
      const allInputs = await page.locator('input').all();
      console.log(`Found ${allInputs.length} input fields`);

      for (let i = 0; i < allInputs.length; i++) {
        const input = allInputs[i];
        const type = await input.getAttribute('type');
        const name = await input.getAttribute('name');
        const id = await input.getAttribute('id');
        const placeholder = await input.getAttribute('placeholder');
        console.log(
          `Input ${i}: type="${type}" name="${name}" id="${id}" placeholder="${placeholder}"`
        );
      }

      // Step 5: Fill form with different approach
      console.log('4. Attempting to fill login form...');

      // Try multiple selectors for email field
      const emailSelectors = [
        'input[name="email"]',
        'input[type="email"]',
        'input[id*="email"]',
        'input[placeholder*="email"]',
        'input[placeholder*="Email"]',
      ];

      let emailField = null;
      for (const selector of emailSelectors) {
        try {
          emailField = page.locator(selector).first();
          if (await emailField.isVisible()) {
            console.log(`Found email field with selector: ${selector}`);
            break;
          }
        } catch {
          continue;
        }
      }

      // Try multiple selectors for password field
      const passwordSelectors = [
        'input[name="password"]',
        'input[type="password"]',
        'input[id*="password"]',
        'input[placeholder*="password"]',
        'input[placeholder*="Password"]',
      ];

      let passwordField = null;
      for (const selector of passwordSelectors) {
        try {
          passwordField = page.locator(selector).first();
          if (await passwordField.isVisible()) {
            console.log(`Found password field with selector: ${selector}`);
            break;
          }
        } catch {
          continue;
        }
      }

      if (emailField && passwordField) {
        await emailField.fill('admin@manitospintadas.cl');
        await passwordField.fill('admin123');
        console.log('✅ Credentials filled successfully');

        await page.screenshot({
          path: 'debug-form-filled.png',
          fullPage: true,
        });

        // Step 6: Find and click submit button
        console.log('5. Finding submit button...');
        const submitSelectors = [
          'button[type="submit"]',
          'input[type="submit"]',
          'button:has-text("Sign")',
          'button:has-text("Login")',
          'button:has-text("Iniciar")',
          'button:has-text("Acceder")',
          '[data-testid="submit-button"]',
        ];

        let submitButton = null;
        for (const selector of submitSelectors) {
          try {
            submitButton = page.locator(selector).first();
            if (await submitButton.isVisible()) {
              console.log(`Found submit button with selector: ${selector}`);
              const buttonText = await submitButton.textContent();
              console.log(`Submit button text: "${buttonText}"`);
              break;
            }
          } catch {
            continue;
          }
        }

        if (submitButton) {
          console.log('6. Submitting form...');

          // Clear previous requests/responses
          requests.length = 0;
          responses.length = 0;

          await submitButton.click();

          // Wait for network activity
          await page.waitForTimeout(5000);

          console.log(
            `\nCaptured ${requests.length} requests and ${responses.length} responses after form submission:`
          );
          requests.forEach((req, i) => {
            console.log(`Request ${i + 1}: ${req.method} ${req.url}`);
            if (req.postData) {
              console.log(`  Post data: ${req.postData.substring(0, 200)}...`);
            }
          });

          responses.forEach((res, i) => {
            console.log(`Response ${i + 1}: ${res.status} ${res.url}`);
          });

          await page.screenshot({
            path: 'debug-after-submit-detailed.png',
            fullPage: true,
          });

          const currentUrl = page.url();
          console.log(`Current URL after submission: ${currentUrl}`);

          // Check for specific error messages in the page
          const errorMessages = await page
            .locator('text=/error|fail|invalid|incorrect/i')
            .allTextContents();
          if (errorMessages.length > 0) {
            console.log('Found error messages:', errorMessages);
          }

          // Check for success indicators
          if (currentUrl.includes('/admin')) {
            console.log('✅ Successfully redirected to admin dashboard');
          } else if (currentUrl.includes('/login')) {
            console.log('❌ Still on login page - authentication failed');

            // Look for any changes in the page content
            const newFormHTML = await page
              .innerHTML('form')
              .catch(() => 'No form found');
            if (newFormHTML !== formHTML) {
              console.log('Form HTML changed after submission');
            } else {
              console.log('Form HTML unchanged - possible submission issue');
            }
          }
        } else {
          console.log('❌ Could not find submit button');
        }
      } else {
        console.log('❌ Could not find email or password fields');
      }
    } catch (error) {
      console.log('❌ Error during debug:', error);
      await page.screenshot({
        path: 'debug-error-detailed.png',
        fullPage: true,
      });
    }

    console.log('=== DEBUG COMPLETE ===\n');
  });

  test('Check Authentication API Directly', async ({ page }) => {
    console.log('\n=== API AUTHENTICATION CHECK ===');

    try {
      // Check if session endpoint is working
      console.log('1. Checking session endpoint...');
      const sessionResponse = await page.goto(`${BASE_URL}/api/auth/session`);
      console.log(`Session endpoint status: ${sessionResponse?.status()}`);

      const sessionData = await page.textContent('body');
      console.log('Session data:', sessionData?.substring(0, 200));

      // Check providers endpoint
      console.log('2. Checking providers endpoint...');
      const providersResponse = await page.goto(
        `${BASE_URL}/api/auth/providers`
      );
      console.log(`Providers endpoint status: ${providersResponse?.status()}`);

      const providersData = await page.textContent('body');
      console.log('Providers data:', providersData?.substring(0, 500));

      // Check CSRF endpoint
      console.log('3. Checking CSRF endpoint...');
      const csrfResponse = await page.goto(`${BASE_URL}/api/auth/csrf`);
      console.log(`CSRF endpoint status: ${csrfResponse?.status()}`);

      const csrfData = await page.textContent('body');
      console.log('CSRF data:', csrfData?.substring(0, 200));
    } catch (error) {
      console.log('❌ Error checking API endpoints:', error);
    }
  });
});
