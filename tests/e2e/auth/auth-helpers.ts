import { Page, BrowserContext } from '@playwright/test';

export class AuthHelper {
  constructor(
    private page: Page,
    private context: BrowserContext
  ) {}

  async loginAsAdmin(): Promise<void> {
    await this.page.goto('/login');
    await this.page.fill('input[name="email"]', 'admin@manitospintadas.cl');
    await this.page.fill('input[name="password"]', 'admin123');
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('/admin');
  }

  async loginAsTeacher(): Promise<void> {
    await this.page.goto('/login');
    await this.page.fill('input[name="email"]', 'profesor@manitospintadas.cl');
    await this.page.fill('input[name="password"]', 'profesor123');
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('/profesor');
  }

  async loginAsParent(): Promise<void> {
    await this.page.goto('/login');
    await this.page.fill('input[name="email"]', 'apoderado@manitospintadas.cl');
    await this.page.fill('input[name="password"]', 'apoderado123');
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('/parent');
  }

  async logout(): Promise<void> {
    try {
      await this.page.click('button[data-testid="logout-button"]');
      await this.page.waitForURL('/login');
    } catch (error) {
      // If logout button doesn't exist, just navigate to home
      await this.page.goto('/');
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      // Check if we're on a protected page
      const currentUrl = this.page.url();
      return !currentUrl.includes('/login') && !currentUrl.includes('/auth');
    } catch {
      return false;
    }
  }
}
