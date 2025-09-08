import { test, expect } from '@playwright/test';

const DEPLOYED_URL =
  'https://manitos-pintadas-school-4vrborojq-agostinos-projects-903e65da.vercel.app';

test.describe('Form Submission Debug', () => {
  test('debug form submission behavior', async ({ page }) => {
    console.log('🔍 Testing form submission behavior...');

    // Monitor all requests
    const requests: any[] = [];
    page.on('request', request => {
      console.log(`📤 REQUEST: ${request.method()} ${request.url()}`);
      requests.push({
        method: request.method(),
        url: request.url(),
        headers: request.headers(),
      });
    });

    // Monitor all responses
    page.on('response', response => {
      console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`);
    });

    // Monitor console logs
    page.on('console', msg => {
      console.log(`🖥️ Console ${msg.type()}: ${msg.text()}`);
    });

    // Go to login
    await page.goto(`${DEPLOYED_URL}/login`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Login page loaded');

    // Fill form
    await page.fill('input[name="email"]', 'admin@manitospintadas.cl');
    await page.fill('input[name="password"]', 'admin123');
    console.log('✅ Form filled');

    // Check if form has action attribute
    const formAction = await page.locator('form').getAttribute('action');
    console.log('🎯 Form action attribute:', formAction);

    // Check for submit button type
    const submitButton = page.locator('button[type="submit"]');
    const buttonText = await submitButton.textContent();
    console.log('🔘 Submit button text:', buttonText);

    // Monitor for network activity on form submission
    let formSubmitted = false;
    const submissionPromise = new Promise(resolve => {
      page.on('request', request => {
        if (
          request.method() === 'POST' ||
          request.url().includes('authenticate')
        ) {
          formSubmitted = true;
          console.log(
            '📮 FORM SUBMISSION DETECTED:',
            request.method(),
            request.url()
          );
          resolve(request);
        }
      });
    });

    // Submit form and wait for any activity
    console.log('🚀 Submitting form...');
    await submitButton.click();

    // Wait up to 5 seconds for form submission
    try {
      await Promise.race([
        submissionPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('No submission detected')), 5000)
        ),
      ]);
      console.log('✅ Form submission detected');
    } catch {
      console.log('❌ No form submission detected in 5 seconds');
    }

    // Wait a bit more and check URL
    await page.waitForTimeout(3000);
    console.log('🌍 URL after submission:', page.url());

    // Check for any error messages
    const errorMessages = await page
      .locator('[role="alert"]')
      .allTextContents();
    if (errorMessages.length > 0) {
      console.log('🚨 Error messages found:', errorMessages);
    } else {
      console.log('ℹ️ No error messages displayed');
    }

    // Final report
    console.log('📊 SUBMISSION ANALYSIS:');
    console.log('- Form submitted:', formSubmitted);
    console.log('- Total requests:', requests.length);
    console.log('- URL changed:', page.url() !== `${DEPLOYED_URL}/login`);
    console.log(
      '- Auth-related requests:',
      requests.filter(
        r =>
          r.url.includes('auth') ||
          r.url.includes('authenticate') ||
          r.method === 'POST'
      ).length
    );
  });
});
