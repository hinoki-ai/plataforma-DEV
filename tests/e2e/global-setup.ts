import { chromium, FullConfig } from '@playwright/test';
import { createTestUser } from './fixtures/test-data.factory';

/**
 * Global setup for E2E tests
 * Creates test users and sets up authentication state
 */

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up test environment...');

  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();

  try {
    // Create admin user
    console.log('Creating admin user...');
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await adminPage.goto(`${baseURL}/login`);
    // Wait for the form to be fully loaded
    await adminPage.waitForSelector('#email', { timeout: 10000 });
    await adminPage.waitForSelector('#password', { timeout: 10000 });
    await adminPage.locator('#email').fill('admin@manitospintadas.cl');
    await adminPage.locator('#password').fill('admin123');
    await adminPage.getByRole('button', { name: /entrar/i }).click();

    // Wait for redirect
    await adminPage.waitForURL('**/admin');

    // Save admin state
    await adminContext.storageState({
      path: 'tests/e2e/fixtures/admin-state.json',
    });
    console.log('✅ Admin user created and authenticated');

    // Create teacher user
    console.log('Creating teacher user...');
    const teacherContext = await browser.newContext();
    const teacherPage = await teacherContext.newPage();

    await teacherPage.goto(`${baseURL}/login`);
    // Wait for the form to be fully loaded
    await teacherPage.waitForSelector('#email', { timeout: 10000 });
    await teacherPage.waitForSelector('#password', { timeout: 10000 });
    await teacherPage.locator('#email').fill('profesor@manitospintadas.cl');
    await teacherPage.locator('#password').fill('profesor123');
    await teacherPage.getByRole('button', { name: /entrar/i }).click();

    // Wait for redirect
    await teacherPage.waitForURL('**/profesor');

    // Save teacher state
    await teacherContext.storageState({
      path: 'tests/e2e/fixtures/teacher-state.json',
    });
    console.log('✅ Teacher user created and authenticated');

    // Create parent user
    console.log('Creating parent user...');
    const parentContext = await browser.newContext();
    const parentPage = await parentContext.newPage();

    await parentPage.goto(`${baseURL}/login`);
    // Wait for the form to be fully loaded
    await parentPage.waitForSelector('#email', { timeout: 10000 });
    await parentPage.waitForSelector('#password', { timeout: 10000 });
    await parentPage.locator('#email').fill('apoderado@manitospintadas.cl');
    await parentPage.locator('#password').fill('apoderado123');
    await parentPage.getByRole('button', { name: /entrar/i }).click();

    // Wait for redirect
    await parentPage.waitForURL('**/parent');

    // Save parent state
    await parentContext.storageState({
      path: 'tests/e2e/fixtures/parent-state.json',
    });
    console.log('✅ Parent user created and authenticated');

    // Create Centro Consejo user
    console.log('Creating Centro Consejo user...');
    const consejoContext = await browser.newContext();
    const consejoPage = await consejoContext.newPage();

    await consejoPage.goto(`${baseURL}/login`);

    // For OAuth users, we need to simulate the OAuth flow
    await consejoPage
      .getByRole('button', { name: /continuar con google/i })
      .click();

    // In a real scenario, this would redirect to Google OAuth
    // For now, we'll use the test user created in the database
    await consejoPage.goto(`${baseURL}/centro-consejo`);

    // Save Centro Consejo state
    await consejoContext.storageState({
      path: 'tests/e2e/fixtures/consejo-state.json',
    });
    console.log('✅ Centro Consejo user created and authenticated');

    console.log('✨ Test environment setup complete!');
  } catch (error) {
    console.error('❌ Error setting up test environment:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
