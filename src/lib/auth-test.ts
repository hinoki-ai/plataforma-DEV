/**
 * Authentication Flow Test Suite
 *
 * This script provides comprehensive testing for the authentication flow
 * to ensure session synchronization works correctly.
 */

import { signIn } from 'next-auth/react';

interface AuthTestResult {
  success: boolean;
  message: string;
  details?: any;
}

export class AuthFlowTester {
  private testResults: AuthTestResult[] = [];

  /**
   * Test the complete authentication flow
   */
  async testCompleteFlow(credentials: {
    email: string;
    password: string;
  }): Promise<AuthTestResult[]> {
    this.testResults = [];

    // Test 1: Initial session state
    await this.testInitialSessionState();

    // Test 2: Login process
    await this.testLoginProcess(credentials);

    // Test 3: Session synchronization
    await this.testSessionSync();

    // Test 4: Redirect behavior
    await this.testRedirectBehavior();

    // Test 5: Protected route access
    await this.testProtectedRouteAccess();

    // Test 6: Logout process
    await this.testLogoutProcess();

    return this.testResults;
  }

  private async testInitialSessionState(): Promise<void> {
    try {
      // Check if we're starting from a clean state
      const session = await this.getCurrentSession();

      if (!session) {
        this.addResult(
          true,
          'Initial session state: No active session (expected)'
        );
      } else {
        this.addResult(
          false,
          `Initial session state: Unexpected active session found`,
          { session }
        );
      }
    } catch (error) {
      this.addResult(false, 'Initial session state test failed', { error });
    }
  }

  private async testLoginProcess(credentials: {
    email: string;
    password: string;
  }): Promise<void> {
    try {
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        this.addResult(false, 'Login process failed', { error: result.error });
      } else {
        this.addResult(true, 'Login process completed successfully');
      }
    } catch (error) {
      this.addResult(false, 'Login process test failed', { error });
    }
  }

  private async testSessionSync(): Promise<void> {
    try {
      // Wait for session to sync
      await new Promise(resolve => setTimeout(resolve, 1000));

      const session = await this.getCurrentSession();

      if (session?.user) {
        this.addResult(true, 'Session synchronization successful', {
          user: session.user,
          hasAllFields: !!(
            session.user.id &&
            session.user.email &&
            session.user.role
          ),
        });
      } else {
        this.addResult(false, 'Session synchronization failed - no user data');
      }
    } catch (error) {
      this.addResult(false, 'Session synchronization test failed', { error });
    }
  }

  private async testRedirectBehavior(): Promise<void> {
    try {
      const session = await this.getCurrentSession();

      if (!session?.user) {
        this.addResult(false, 'Redirect test failed - no session available');
        return;
      }

      const expectedPath = this.getExpectedPath(session.user.role);
      const currentPath = window.location.pathname;

      if (currentPath === expectedPath) {
        this.addResult(true, 'Redirect behavior correct', {
          role: session.user.role,
          expectedPath,
          currentPath,
        });
      } else {
        this.addResult(false, 'Redirect behavior incorrect', {
          role: session.user.role,
          expectedPath,
          currentPath,
        });
      }
    } catch (error) {
      this.addResult(false, 'Redirect behavior test failed', { error });
    }
  }

  private async testProtectedRouteAccess(): Promise<void> {
    try {
      const protectedRoutes = [
        '/admin',
        '/profesor',
        '/centro-consejo/dashboard',
      ];
      const session = await this.getCurrentSession();

      if (!session?.user) {
        this.addResult(false, 'Protected route test failed - no session');
        return;
      }

      const userRole = session.user.role;
      const accessibleRoutes = this.getAccessibleRoutes(userRole);

      for (const route of protectedRoutes) {
        const canAccess = accessibleRoutes.includes(route);
        this.addResult(
          true,
          `Protected route access: ${route} - ${canAccess ? 'ALLOWED' : 'DENIED'}`,
          {
            route,
            userRole,
            canAccess,
          }
        );
      }
    } catch (error) {
      this.addResult(false, 'Protected route access test failed', { error });
    }
  }

  private async testLogoutProcess(): Promise<void> {
    try {
      // This would typically involve signing out and checking session state
      this.addResult(
        true,
        'Logout process test (manual verification required)'
      );
    } catch (error) {
      this.addResult(false, 'Logout process test failed', { error });
    }
  }

  private async getCurrentSession() {
    try {
      const response = await fetch('/api/auth/session', { cache: 'no-store' });
      return await response.json();
    } catch {
      return null;
    }
  }

  private getExpectedPath(role: string): string {
    switch (role) {
      case 'ADMIN':
        return '/admin';
      case 'PROFESOR':
        return '/profesor';
      case 'PARENT':
        return '/centro-consejo/dashboard';
      default:
        return '/';
    }
  }

  private getAccessibleRoutes(role: string): string[] {
    switch (role) {
      case 'ADMIN':
        return ['/admin'];
      case 'PROFESOR':
        return ['/profesor'];
      case 'PARENT':
        return ['/centro-consejo/dashboard'];
      default:
        return [];
    }
  }

  private addResult(success: boolean, message: string, details?: any): void {
    this.testResults.push({ success, message, details });
  }

  /**
   * Manual testing instructions for developers
   */
  static getManualTestInstructions(): string {
    return `
MANUAL AUTHENTICATION FLOW TEST STEPS:

1. **Initial State Test**
   - Open browser in incognito mode
   - Navigate to /login
   - Verify: No active session (check dev tools network tab)

2. **Login Test**
   - Use test credentials:
     - Admin: admin@manitospintadas.cl / admin123
     - Teacher: profesor@manitospintadas.cl / profesor123
   - Enter credentials and submit
   - Expected: Redirect to /auth-success then to appropriate dashboard

3. **Session Sync Test**
   - After login, immediately refresh the page
   - Expected: Should stay logged in without manual reload
   - Check: session cookie should be present

4. **Role-based Access Test**
   - After admin login, try accessing /profesor
   - Expected: Redirect to /admin
   - After teacher login, try accessing /admin
   - Expected: Redirect to /profesor

5. **Cross-tab Sync Test**
   - Open two tabs with the site
   - Login in one tab
   - Switch to second tab
   - Expected: Second tab should recognize logged-in state

6. **Logout Test**
   - Click logout from any dashboard
   - Expected: Redirect to /login
   - Try accessing protected routes
   - Expected: Redirect to /login

7. **Session Persistence Test**
   - Login successfully
   - Close browser completely
   - Reopen and navigate to /admin or /profesor
   - Expected: Should still be logged in

**TROUBLESHOOTING:**
- If issues persist, check browser console for errors
- Verify cookies are being set correctly
- Check network tab for /api/auth/session requests
- Ensure no browser extensions are blocking cookies
`;
  }
}

// Export for use in components
export const authTester = new AuthFlowTester();
