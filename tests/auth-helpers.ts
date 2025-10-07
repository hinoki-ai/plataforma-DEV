import { Page, BrowserContext } from "@playwright/test";
import { existsSync } from "fs";
import { readFileSync } from "fs";

// Authentication helpers for Playwright E2E tests
export class AuthHelper {
  constructor(
    private page: Page,
    private context: BrowserContext,
  ) {}

  /**
   * Login as admin user
   */
  async loginAsAdmin() {
    await this.page.goto("/login");
    await this.page.fill('input[name="email"]', "admin@manitospintadas.cl");
    await this.page.fill('input[name="password"]', "admin123");
    await this.page.click('button[type="submit"]');

    // Wait for redirect to admin dashboard
    await this.page.waitForURL("/admin", { timeout: 10000 });

    // Store session for reuse
    await this.storeAuthState("admin");
  }

  /**
   * Login as teacher user
   */
  async loginAsTeacher() {
    await this.page.goto("/login");
    await this.page.fill('input[name="email"]', "profesor@manitospintadas.cl");
    await this.page.fill('input[name="password"]', "profesor123");
    await this.page.click('button[type="submit"]');

    // Wait for redirect to teacher dashboard
    await this.page.waitForURL("/profesor", { timeout: 10000 });

    // Store session for reuse
    await this.storeAuthState("teacher");
  }

  /**
   * Login as parent user
   */
  async loginAsParent() {
    await this.page.goto("/login");
    await this.page.fill('input[name="email"]', "parent@example.com");
    await this.page.fill('input[name="password"]', "parent123");
    await this.page.click('button[type="submit"]');

    await this.page.waitForURL("/parent", { timeout: 10000 });
    await this.storeAuthState("parent");
  }

  /**
   * Simulate Centro Consejo OAuth login
   */
  async loginAsCentroConsejo() {
    // This would need to be adapted based on actual OAuth implementation
    // For now, we'll simulate the end result
    await this.page.goto("/centro-consejo");

    // Mock OAuth success by directly setting session data
    await this.context.addCookies([
      {
        name: "next-auth.session-token",
        value: "mock-centro-consejo-session-token",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    await this.page.reload();
    await this.storeAuthState("centro-consejo");
  }

  /**
   * Store authentication state for session reuse
   */
  private async storeAuthState(role: string) {
    try {
      await this.context.storageState({
        path: `tests/auth-states/${role}-auth.json`,
      });
    } catch (error) {
      console.warn(`Could not store auth state for ${role}:`, error);
    }
  }

  /**
   * Load stored authentication state
   */
  static async loadAuthState(context: BrowserContext, role: string) {
    const authFile = `tests/auth-states/${role}-auth.json`;
    try {
      if (existsSync(authFile)) {
        const authData = JSON.parse(readFileSync(authFile, "utf8"));
        await context.addCookies(authData.cookies || []);
      }
    } catch (error) {
      console.warn(`Could not load auth state for ${role}:`, error);
    }
  }

  /**
   * Logout current user
   */
  async logout() {
    try {
      // Try to find logout button/link
      const logoutSelectors = [
        'button:has-text("Cerrar Sesión")',
        'a:has-text("Cerrar Sesión")',
        'button:has-text("Logout")',
        '[data-testid="logout-button"]',
        'button:has-text("Salir")',
      ];

      for (const selector of logoutSelectors) {
        try {
          const element = await this.page.locator(selector).first();
          if (await element.isVisible()) {
            await element.click();
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }

      // Wait for redirect to login or home page
      await this.page.waitForURL(
        (url) => url.pathname === "/login" || url.pathname === "/",
        { timeout: 5000 },
      );
    } catch (error) {
      // If logout fails, just navigate to home
      await this.page.goto("/");
    }
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // Look for user menu or dashboard elements
      const userIndicators = [
        '[data-testid="user-menu"]',
        'button:has-text("Dashboard")',
        ".user-avatar",
        '[data-testid="dashboard"]',
        'h1:has-text("Dashboard")',
      ];

      for (const selector of userIndicators) {
        const element = this.page.locator(selector).first();
        if (await element.isVisible()) {
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current user role from UI
   */
  async getCurrentRole(): Promise<string | null> {
    try {
      const url = this.page.url();

      if (url.includes("/admin")) return "ADMIN";
      if (url.includes("/profesor")) return "PROFESOR";
      if (url.includes("/parent")) return "PARENT";
      if (url.includes("/centro-consejo")) return "CENTRO_CONSEJO";

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create test user via API (for setup)
   */
  async createTestUser(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    const response = await this.page.request.post("/api/admin/users", {
      data: userData,
    });

    if (!response.ok()) {
      throw new Error(`Failed to create test user: ${response.status()}`);
    }

    return response.json();
  }

  /**
   * Clean up test users (for teardown)
   */
  async cleanupTestUsers() {
    // This would call an API endpoint to clean up test data
    // Implementation depends on having a test cleanup endpoint
    try {
      await this.page.request.delete("/api/test/cleanup-users");
    } catch (error) {
      console.warn("Could not cleanup test users:", error);
    }
  }
}
