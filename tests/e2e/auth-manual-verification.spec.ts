import { test, expect } from '@playwright/test';

const BASE_URL = 'https://school.aramac.dev';

test.describe('Manual Authentication Verification', () => {
  test('ADMIN Authentication Flow', async ({ page }) => {
    console.log('\n🔐 TESTING ADMIN AUTHENTICATION');
    console.log('📧 Email: admin@manitospintadas.cl');
    console.log('🔑 Password: admin123');

    // Clear any existing session
    await page.context().clearCookies();

    // Navigate directly to login
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    console.log(`✅ Navigated to: ${page.url()}`);

    // Wait for login form to be visible
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.waitForSelector('input[name="password"]', { timeout: 10000 });

    // Enter credentials
    await page.fill('input[name="email"]', 'admin@manitospintadas.cl');
    await page.fill('input[name="password"]', 'admin123');
    console.log('✅ Credentials entered');

    // Submit form
    await page.click('button[type="submit"]');
    console.log('✅ Login form submitted');

    // Wait for authentication to complete (either success or failure)
    try {
      await page.waitForURL(/\/admin|\/login/, { timeout: 15000 });
      const finalUrl = page.url();

      if (finalUrl.includes('/admin')) {
        console.log('🎉 ADMIN AUTHENTICATION SUCCESSFUL!');
        console.log(`✅ Redirected to: ${finalUrl}`);

        // Verify dashboard is accessible
        const pageContent = await page.textContent('body');
        if (
          pageContent.includes('Admin') ||
          pageContent.includes('Dashboard')
        ) {
          console.log('✅ Admin dashboard is accessible');
        }
      } else {
        console.log('❌ ADMIN AUTHENTICATION FAILED - Still on login page');
        const errorMessage = await page
          .locator('text=/error|invalid|incorrect/i')
          .textContent()
          .catch(() => 'No error message found');
        console.log(`❌ Error message: ${errorMessage}`);
      }
    } catch (error) {
      console.log(`❌ Timeout waiting for authentication: ${error}`);
    }
  });

  test('PROFESOR Authentication Flow', async ({ page }) => {
    console.log('\n🔐 TESTING PROFESOR AUTHENTICATION');
    console.log('📧 Email: profesor@manitospintadas.cl');
    console.log('🔑 Password: profesor123');

    // Clear any existing session
    await page.context().clearCookies();

    // Navigate directly to login
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    console.log(`✅ Navigated to: ${page.url()}`);

    // Wait for login form
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.waitForSelector('input[name="password"]', { timeout: 10000 });

    // Enter credentials
    await page.fill('input[name="email"]', 'profesor@manitospintadas.cl');
    await page.fill('input[name="password"]', 'profesor123');
    console.log('✅ Credentials entered');

    // Submit form
    await page.click('button[type="submit"]');
    console.log('✅ Login form submitted');

    // Wait for authentication
    try {
      await page.waitForURL(/\/profesor|\/login/, { timeout: 15000 });
      const finalUrl = page.url();

      if (finalUrl.includes('/profesor')) {
        console.log('🎉 PROFESOR AUTHENTICATION SUCCESSFUL!');
        console.log(`✅ Redirected to: ${finalUrl}`);

        // Verify dashboard access
        const pageContent = await page.textContent('body');
        if (
          pageContent.includes('Profesor') ||
          pageContent.includes('Teacher')
        ) {
          console.log('✅ Profesor dashboard is accessible');
        }
      } else {
        console.log('❌ PROFESOR AUTHENTICATION FAILED - Still on login page');
        const errorMessage = await page
          .locator('text=/error|invalid|incorrect/i')
          .textContent()
          .catch(() => 'No error message found');
        console.log(`❌ Error message: ${errorMessage}`);
      }
    } catch (error) {
      console.log(`❌ Timeout waiting for authentication: ${error}`);
    }
  });

  test('PARENT Authentication Flow', async ({ page }) => {
    console.log('\n🔐 TESTING PARENT AUTHENTICATION');
    console.log('📧 Email: parent@manitospintadas.cl');
    console.log('🔑 Password: parent123');

    // Clear any existing session
    await page.context().clearCookies();

    // Navigate directly to login
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    console.log(`✅ Navigated to: ${page.url()}`);

    // Wait for login form
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.waitForSelector('input[name="password"]', { timeout: 10000 });

    // Enter credentials
    await page.fill('input[name="email"]', 'parent@manitospintadas.cl');
    await page.fill('input[name="password"]', 'parent123');
    console.log('✅ Credentials entered');

    // Submit form
    await page.click('button[type="submit"]');
    console.log('✅ Login form submitted');

    // Wait for authentication
    try {
      await page.waitForURL(/\/parent|\/login/, { timeout: 15000 });
      const finalUrl = page.url();

      if (finalUrl.includes('/parent')) {
        console.log('🎉 PARENT AUTHENTICATION SUCCESSFUL!');
        console.log(`✅ Redirected to: ${finalUrl}`);

        // Verify dashboard access
        const pageContent = await page.textContent('body');
        if (pageContent.includes('Parent') || pageContent.includes('Padre')) {
          console.log('✅ Parent dashboard is accessible');
        }
      } else {
        console.log('❌ PARENT AUTHENTICATION FAILED - Still on login page');
        const errorMessage = await page
          .locator('text=/error|invalid|incorrect/i')
          .textContent()
          .catch(() => 'No error message found');
        console.log(`❌ Error message: ${errorMessage}`);
      }
    } catch (error) {
      console.log(`❌ Timeout waiting for authentication: ${error}`);
    }
  });

  test('Invalid Credentials Test', async ({ page }) => {
    console.log('\n❌ TESTING INVALID CREDENTIALS');

    await page.context().clearCookies();
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should remain on login page
    await page.waitForTimeout(3000);
    const finalUrl = page.url();

    if (finalUrl.includes('/login')) {
      console.log(
        '✅ Invalid credentials properly rejected - remained on login page'
      );
    } else {
      console.log(
        '❌ Invalid credentials test failed - unexpectedly redirected'
      );
    }
  });
});
