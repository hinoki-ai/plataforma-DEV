import { Page } from "@playwright/test";
import { test as base } from "@playwright/test";

export interface AuthFixture {
  loginAsAdmin: () => Promise<void>;
  loginAsTeacher: () => Promise<void>;
  logout: () => Promise<void>;
}

export const test = base.extend<{
  auth: AuthFixture;
}>({
  auth: async ({ page }, use) => {
    const auth = {
      async loginAsAdmin() {
        await page.goto("/login");
        await page.fill('input[name="email"]', "admin@manitospintadas.cl");
        await page.fill('input[name="password"]', "admin123");
        await page.click('button[type="submit"]');
        await page.waitForURL("/admin");
      },

      async loginAsTeacher() {
        await page.goto("/login");
        await page.fill('input[name="email"]', "profesor@manitospintadas.cl");
        await page.fill('input[name="password"]', "profesor123");
        await page.click('button[type="submit"]');
        await page.waitForURL("/profesor");
      },

      async logout() {
        await page.click('button[data-testid="logout-button"]');
        await page.waitForURL("/login");
      },
    };

    await use(auth);
  },
});
