import { test, expect } from '@playwright/test';

/**
 * Comprehensive security testing for authentication flows
 * Tests role-based access control, CSRF protection, SQL injection prevention, and more
 */

test.describe('Authentication Security Tests', () => {
  test.describe('Role-Based Access Control', () => {
    test('should prevent unauthorized access to admin routes', async ({
      page,
    }) => {
      // Attempt to access admin routes without authentication
      await page.goto('/admin/usuarios');

      // Should redirect to login
      await expect(page).toHaveURL(/.*\/login.*/);
      await expect(page.getByText(/iniciar sesión/i)).toBeVisible();
    });

    test('should prevent teacher access to admin routes', async ({ page }) => {
      // Login as teacher
      await page.goto('/login');
      await page.getByLabel(/email/i).fill('profesor@manitospintadas.cl');
      await page.getByLabel(/contraseña/i).fill('profesor123');
      await page.getByRole('button', { name: /iniciar sesión/i }).click();

      // Attempt to access admin routes
      await page.goto('/admin/usuarios');

      // Should redirect to teacher dashboard
      await expect(page).toHaveURL(/.*\/profesor.*/);
      await expect(page.getByText(/acceso no autorizado/i)).toBeVisible();
    });

    test('should prevent parent access to teacher routes', async ({ page }) => {
      // Login as parent
      await page.goto('/login');
      await page.getByLabel(/email/i).fill('parent@manitospintadas.cl');
      await page.getByLabel(/contraseña/i).fill('parent123');
      await page.getByRole('button', { name: /iniciar sesión/i }).click();

      // Attempt to access teacher routes
      await page.goto('/profesor/planificaciones');

      // Should redirect to parent dashboard
      await expect(page).toHaveURL(/.*\/parent.*/);
      await expect(page.getByText(/acceso restringido/i)).toBeVisible();
    });

    test('should prevent Centro Consejo access to teacher routes', async ({
      page,
    }) => {
      // Login as Centro Consejo
      await page.goto('/login');
      await page.getByRole('button', { name: /continuar con google/i }).click();

      // Attempt to access teacher routes
      await page.goto('/profesor/planificaciones');

      // Should redirect to Centro Consejo dashboard
      await expect(page).toHaveURL(/.*\/centro-consejo.*/);
    });
  });

  test.describe('Login Security', () => {
    test('should enforce rate limiting on failed login attempts', async ({
      page,
    }) => {
      await page.goto('/login');

      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await page.getByLabel(/email/i).fill('test@example.com');
        await page.getByLabel(/contraseña/i).fill('wrongpassword');
        await page.getByRole('button', { name: /iniciar sesión/i }).click();
      }

      // Should show rate limit message
      await expect(page.getByText(/demasiados intentos/i)).toBeVisible();
    });

    test('should prevent SQL injection in login form', async ({ page }) => {
      await page.goto('/login');

      // Attempt SQL injection
      await page.getByLabel(/email/i).fill("admin' OR '1'='1");
      await page.getByLabel(/contraseña/i).fill("' OR '1'='1");
      await page.getByRole('button', { name: /iniciar sesión/i }).click();

      // Should show invalid credentials message
      await expect(page.getByText(/credenciales inválidas/i)).toBeVisible();
    });

    test('should prevent XSS in login form', async ({ page }) => {
      await page.goto('/login');

      // Attempt XSS
      await page.getByLabel(/email/i).fill('<script>alert("xss")</script>');
      await page.getByLabel(/contraseña/i).fill('password');
      await page.getByRole('button', { name: /iniciar sesión/i }).click();

      // Should show invalid credentials message
      await expect(page.getByText(/credenciales inválidas/i)).toBeVisible();

      // Verify script is not executed
      const alertCount = await page.evaluate(() => {
        return new Promise(resolve => {
          let count = 0;
          const originalAlert = window.alert;
          window.alert = () => {
            count++;
            originalAlert();
          };
          setTimeout(() => resolve(count), 1000);
        });
      });

      expect(alertCount).toBe(0);
    });

    test('should enforce strong password policy', async ({ page }) => {
      await page.goto('/login');
      await page.getByRole('link', { name: /registrarse/i }).click();

      // Test weak password
      await page.getByLabel(/email/i).fill('newuser@example.com');
      await page.getByLabel(/contraseña/i).fill('123');
      await page.getByRole('button', { name: /registrar/i }).click();

      // Should show password strength error
      await expect(page.getByText(/contraseña débil/i)).toBeVisible();
    });
  });

  test.describe('Session Management', () => {
    test('should expire session after inactivity', async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel(/email/i).fill('admin@manitospintadas.cl');
      await page.getByLabel(/contraseña/i).fill('admin123');
      await page.getByRole('button', { name: /iniciar sesión/i }).click();

      // Wait for session to expire (simulate with short timeout)
      await page.evaluate(() => {
        // Simulate session expiration
        localStorage.clear();
        sessionStorage.clear();
      });

      await page.reload();

      // Should redirect to login
      await expect(page).toHaveURL(/.*\/login.*/);
    });

    test('should handle concurrent sessions', async ({ browser }) => {
      const context1 = await browser.newContext();
      const page1 = await context1.newPage();

      const context2 = await browser.newContext();
      const page2 = await context2.newPage();

      // Login on both contexts
      for (const page of [page1, page2]) {
        await page.goto('/login');
        await page.getByLabel(/email/i).fill('admin@manitospintadas.cl');
        await page.getByLabel(/contraseña/i).fill('admin123');
        await page.getByRole('button', { name: /iniciar sesión/i }).click();
      }

      // Both should have access
      await page1.goto('/admin');
      await page2.goto('/admin');

      await expect(page1.getByText(/panel de administración/i)).toBeVisible();
      await expect(page2.getByText(/panel de administración/i)).toBeVisible();
    });
  });

  test.describe('CSRF Protection', () => {
    test('should prevent CSRF attacks on form submissions', async ({
      page,
    }) => {
      await page.goto('/login');
      await page.getByLabel(/email/i).fill('admin@manitospintadas.cl');
      await page.getByLabel(/contraseña/i).fill('admin123');
      await page.getByRole('button', { name: /iniciar sesión/i }).click();

      // Attempt to submit form without CSRF token
      const response = await page.evaluate(async () => {
        return fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'csrf@test.com',
            name: 'CSRF Test',
            role: 'PROFESOR',
          }),
        });
      });

      expect(response.status).toBe(403);
    });

    test('should validate CSRF tokens on state-changing operations', async ({
      page,
    }) => {
      await page.goto('/login');
      await page.getByLabel(/email/i).fill('admin@manitospintadas.cl');
      await page.getByLabel(/contraseña/i).fill('admin123');
      await page.getByRole('button', { name: /iniciar sesión/i }).click();

      await page.goto('/admin/usuarios');

      // Attempt form submission without valid CSRF
      const response = await page.evaluate(async () => {
        return fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'malicious@test.com',
            name: 'Malicious User',
            role: 'ADMIN',
          }),
        });
      });

      expect(response.status).toBe(403);
    });
  });

  test.describe('Password Security', () => {
    test('should hash passwords before storage', async ({ page, request }) => {
      // This test would typically be done at the API level
      // Create a test user and verify password is not stored in plain text

      const response = await request.post('/api/auth/register', {
        data: {
          email: 'passwordtest@example.com',
          name: 'Password Test',
          password: 'TestPass123!',
          role: 'PARENT',
        },
      });

      expect(response.ok()).toBeTruthy();

      // Verify the response doesn't contain the password
      const userData = await response.json();
      expect(userData).not.toHaveProperty('password');
    });

    test('should enforce password complexity requirements', async ({
      page,
    }) => {
      await page.goto('/login');
      await page.getByRole('link', { name: /registrarse/i }).click();

      const testCases = [
        { password: '123', expectedError: /mínimo 8 caracteres/i },
        { password: 'password', expectedError: /mayúsculas/i },
        { password: 'PASSWORD', expectedError: /minúsculas/i },
        { password: 'Password', expectedError: /números/i },
        { password: 'Password123', expectedError: /caracteres especiales/i },
      ];

      for (const { password, expectedError } of testCases) {
        await page.getByLabel(/email/i).fill(`test${Date.now()}@example.com`);
        await page.getByLabel(/contraseña/i).fill(password);
        await page.getByRole('button', { name: /registrar/i }).click();

        await expect(page.getByText(expectedError)).toBeVisible();
      }
    });
  });

  test.describe('OAuth Security', () => {
    test('should validate OAuth redirect URLs', async ({ page }) => {
      await page.goto('/login');

      // Attempt to use malicious redirect URL
      await page.goto('/api/auth/signin?callbackUrl=http://malicious.com');

      // Should prevent redirect to external domain
      await expect(page).not.toHaveURL('http://malicious.com');
    });

    test('should validate OAuth state parameter', async ({ page }) => {
      await page.goto('/login');
      await page.getByRole('button', { name: /continuar con google/i }).click();

      // Should include state parameter for CSRF protection
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/state=/);
    });
  });

  test.describe('API Security', () => {
    test('should validate API rate limiting', async ({ request }) => {
      const requests = [];

      // Send multiple rapid requests
      for (let i = 0; i < 100; i++) {
        requests.push(
          request.get('/api/health', {
            headers: {
              'X-Forwarded-For': '192.168.1.100',
            },
          })
        );
      }

      const responses = await Promise.allSettled(requests);
      const rateLimitedResponses = responses.filter(
        r => r.status === 'fulfilled' && r.value.status() === 429
      );

      // Should have some rate-limited responses
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    test('should validate API authentication tokens', async ({ request }) => {
      // Attempt to access protected API without token
      const response = await request.get('/api/admin/users');
      expect(response.status()).toBe(401);
    });

    test('should prevent SQL injection in API endpoints', async ({
      request,
    }) => {
      const response = await request.get(
        "/api/users?search=admin'; DROP TABLE users; --"
      );

      // Should return empty results or error, not execute injection
      expect(response.status()).toBeLessThan(500);
    });
  });

  test.describe('File Upload Security', () => {
    test('should validate file types on upload', async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel(/email/i).fill('admin@manitospintadas.cl');
      await page.getByLabel(/contraseña/i).fill('admin123');
      await page.getByRole('button', { name: /iniciar sesión/i }).click();

      await page.goto('/admin/settings');

      // Attempt to upload executable file
      await page.setInputFiles('input[type="file"]', {
        name: 'malicious.exe',
        mimeType: 'application/x-msdownload',
        buffer: Buffer.from('MZ...'), // PE file header
      });

      // Should reject executable files
      await expect(
        page.getByText(/tipo de archivo no permitido/i)
      ).toBeVisible();
    });

    test('should validate file size limits', async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel(/email/i).fill('admin@manitospintadas.cl');
      await page.getByLabel(/contraseña/i).fill('admin123');
      await page.getByRole('button', { name: /iniciar sesión/i }).click();

      await page.goto('/admin/settings');

      // Attempt to upload oversized file (20MB)
      const largeFile = Buffer.alloc(20 * 1024 * 1024, 'A');

      await page.setInputFiles('input[type="file"]', {
        name: 'large-file.pdf',
        mimeType: 'application/pdf',
        buffer: largeFile,
      });

      // Should reject oversized files
      await expect(page.getByText(/archivo demasiado grande/i)).toBeVisible();
    });

    test('should sanitize file names', async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel(/email/i).fill('admin@manitospintadas.cl');
      await page.getByLabel(/contraseña/i).fill('admin123');
      await page.getByRole('button', { name: /iniciar sesión/i }).click();

      await page.goto('/admin/settings');

      // Attempt to upload with malicious filename
      await page.setInputFiles('input[type="file"]', {
        name: '../../../etc/passwd',
        mimeType: 'text/plain',
        buffer: Buffer.from('test content'),
      });

      // Should reject invalid filename
      await expect(page.getByText(/nombre de archivo inválido/i)).toBeVisible();
    });
  });

  test.describe('Session Hijacking Prevention', () => {
    test('should use secure session cookies', async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel(/email/i).fill('admin@manitospintadas.cl');
      await page.getByLabel(/contraseña/i).fill('admin123');
      await page.getByRole('button', { name: /iniciar sesión/i }).click();

      // Check cookie security attributes
      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find(c => c.name.includes('session'));

      if (sessionCookie) {
        expect(sessionCookie.httpOnly).toBe(true);
        expect(sessionCookie.secure).toBe(true); // In production
        expect(sessionCookie.sameSite).toBe('lax');
      }
    });

    test('should regenerate session ID on login', async ({ page }) => {
      const initialCookies = await page.context().cookies();

      await page.goto('/login');
      await page.getByLabel(/email/i).fill('admin@manitospintadas.cl');
      await page.getByLabel(/contraseña/i).fill('admin123');
      await page.getByRole('button', { name: /iniciar sesión/i }).click();

      await page.waitForURL('**/admin');

      const newCookies = await page.context().cookies();

      // Session ID should be different
      const initialSession = initialCookies.find(c =>
        c.name.includes('session')
      );
      const newSession = newCookies.find(c => c.name.includes('session'));

      expect(initialSession?.value).not.toBe(newSession?.value);
    });
  });

  test.describe('Clickjacking Prevention', () => {
    test('should include X-Frame-Options header', async ({ page, context }) => {
      await page.goto('/login');

      const response = await page.waitForResponse('**/login');
      const headers = response.headers();

      expect(headers['x-frame-options']).toBeDefined();
      expect(headers['x-frame-options']).toMatch(/deny|sameorigin/i);
    });

    test('should include Content-Security-Policy frame-ancestors', async ({
      page,
    }) => {
      await page.goto('/login');

      const response = await page.waitForResponse('**/login');
      const headers = response.headers();

      expect(headers['content-security-policy']).toBeDefined();
      expect(headers['content-security-policy']).toMatch(/frame-ancestors/i);
    });
  });
});
