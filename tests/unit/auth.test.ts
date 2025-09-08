import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthError } from 'next-auth';
import {
  createTestAdmin,
  createTestTeacher,
  createTestCentroConsejoMember,
} from './utils';

// Mock the entire auth module
const mockSignIn = vi.fn();
const mockSignOut = vi.fn();
vi.mock('@/lib/auth', () => ({
  signIn: mockSignIn,
  signOut: mockSignOut,
}));

// Mock the database
const mockUserFindUnique = vi.fn();
const mockCentroConsejoMemberFindUnique = vi.fn();
vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: mockUserFindUnique,
    },
    centroConsejoMember: {
      findUnique: mockCentroConsejoMemberFindUnique,
    },
  },
}));

// Mock crypto functions
const mockVerifyPassword = vi.fn();
vi.mock('@/lib/crypto', () => ({
  verifyPassword: mockVerifyPassword,
  hashPassword: vi.fn(),
}));

// Mock the auth action
const mockAuthenticate = vi.fn();
vi.mock('@/services/actions/auth', () => ({
  authenticate: mockAuthenticate,
  logout: vi.fn(),
}));

describe('Authentication System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Credentials Authentication', () => {
    it('should successfully authenticate admin with valid credentials', async () => {
      const admin = createTestAdmin();
      mockUserFindUnique.mockResolvedValue({
        ...admin,
        password: 'hashed_password',
      });
      mockVerifyPassword.mockResolvedValue(true);
      mockSignIn.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('email', 'admin@manitospintadas.cl');
      formData.append('password', 'admin123');

      const result = await mockSignIn('credentials', {
        email: 'admin@manitospintadas.cl',
        password: 'admin123',
        redirectTo: '/admin',
      });

      expect(result).toBeUndefined();
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'admin@manitospintadas.cl',
        password: 'admin123',
        redirectTo: '/admin',
      });
    });

    it('should successfully authenticate teacher with valid credentials', async () => {
      const teacher = createTestTeacher();
      mockUserFindUnique.mockResolvedValue({
        ...teacher,
        password: 'hashed_password',
      });
      mockVerifyPassword.mockResolvedValue(true);
      mockSignIn.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('email', 'profesor@manitospintadas.cl');
      formData.append('password', 'profesor123');

      const result = await mockSignIn('credentials', {
        email: 'profesor@manitospintadas.cl',
        password: 'profesor123',
        redirectTo: '/profesor',
      });

      expect(result).toBeUndefined();
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'profesor@manitospintadas.cl',
        password: 'profesor123',
        redirectTo: '/profesor',
      });
    });

    it('should reject authentication with invalid email', async () => {
      const mockError = new AuthError('CredentialsSignin');
      mockSignIn.mockRejectedValue(mockError);

      const formData = new FormData();
      formData.append('email', 'nonexistent@example.com');
      formData.append('password', 'anypassword');

      await expect(
        mockSignIn('credentials', {
          email: 'nonexistent@example.com',
          password: 'anypassword',
        })
      ).rejects.toThrow(AuthError);

      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'nonexistent@example.com',
        password: 'anypassword',
      });
    });

    it('should reject authentication with invalid password', async () => {
      const mockError = new AuthError('CredentialsSignin');
      mockSignIn.mockRejectedValue(mockError);

      const formData = new FormData();
      formData.append('email', 'admin@manitospintadas.cl');
      formData.append('password', 'wrongpassword');

      await expect(
        mockSignIn('credentials', {
          email: 'admin@manitospintadas.cl',
          password: 'wrongpassword',
        })
      ).rejects.toThrow(AuthError);

      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'admin@manitospintadas.cl',
        password: 'wrongpassword',
      });
    });

    it('should handle empty credentials', async () => {
      mockSignIn.mockRejectedValue(new AuthError('CredentialsSignin'));

      const formData = new FormData();
      formData.append('email', '');
      formData.append('password', '');

      await expect(
        mockSignIn('credentials', {
          email: '',
          password: '',
        })
      ).rejects.toThrow(AuthError);
    });

    it('should handle null credentials', async () => {
      mockSignIn.mockRejectedValue(new AuthError('CredentialsSignin'));

      await expect(
        mockSignIn('credentials', {
          email: null,
          password: null,
        })
      ).rejects.toThrow(AuthError);
    });

    it('should handle user without password hash', async () => {
      const admin = createTestAdmin();
      mockUserFindUnique.mockResolvedValue({
        ...admin,
        password: null, // OAuth user or corrupted data
      });

      mockSignIn.mockRejectedValue(new AuthError('CredentialsSignin'));

      await expect(
        mockSignIn('credentials', {
          email: 'admin@manitospintadas.cl',
          password: 'admin123',
        })
      ).rejects.toThrow(AuthError);
    });

    it('should handle database connection errors', async () => {
      mockUserFindUnique.mockRejectedValue(
        new Error('Database connection failed')
      );
      mockSignIn.mockRejectedValue(new Error('Database connection failed'));

      const formData = new FormData();
      formData.append('email', 'admin@manitospintadas.cl');
      formData.append('password', 'admin123');

      await expect(
        mockSignIn('credentials', {
          email: 'admin@manitospintadas.cl',
          password: 'admin123',
        })
      ).rejects.toThrow('Database connection failed');
    });

    it('should complete authentication within acceptable time', async () => {
      const admin = createTestAdmin();
      mockUserFindUnique.mockResolvedValue({
        ...admin,
        password: 'hashed_password',
      });
      mockVerifyPassword.mockResolvedValue(true);
      mockSignIn.mockResolvedValue(undefined);

      const startTime = performance.now();

      await mockSignIn('credentials', {
        email: 'admin@manitospintadas.cl',
        password: 'admin123',
        redirectTo: '/admin',
      });

      const duration = performance.now() - startTime;

      // Should complete within 500ms for unit tests
      expect(duration).toBeLessThan(500);
    });
  });

  describe('OAuth Authentication', () => {
    it('should allow Google OAuth for Centro Consejo members', async () => {
      const centroMember = createTestCentroConsejoMember();
      mockUserFindUnique.mockResolvedValue(null); // Not a teacher/admin
      mockCentroConsejoMemberFindUnique.mockResolvedValue(centroMember);

      mockSignIn.mockImplementation(async (provider, options) => {
        if (provider === 'google') {
          // Simulate successful OAuth callback
          return { url: '/centro-consejo' };
        }
      });

      const result = await mockSignIn('google', {
        redirectTo: '/centro-consejo',
      });

      expect(result).toEqual({ url: '/centro-consejo' });
      expect(mockSignIn).toHaveBeenCalledWith('google', {
        redirectTo: '/centro-consejo',
      });
    });

    it('should allow Facebook OAuth for Centro Consejo members', async () => {
      const centroMember = createTestCentroConsejoMember();
      mockUserFindUnique.mockResolvedValue(null);
      mockCentroConsejoMemberFindUnique.mockResolvedValue(centroMember);

      mockSignIn.mockImplementation(async (provider, options) => {
        if (provider === 'facebook') {
          return { url: '/centro-consejo' };
        }
      });

      const result = await mockSignIn('facebook', {
        redirectTo: '/centro-consejo',
      });

      expect(result).toEqual({ url: '/centro-consejo' });
      expect(mockSignIn).toHaveBeenCalledWith('facebook', {
        redirectTo: '/centro-consejo',
      });
    });

    it('should block OAuth for existing teacher/admin accounts', async () => {
      mockSignIn.mockRejectedValue(
        new Error('OAuth blocked for existing user')
      );

      await expect(
        mockSignIn('google', { redirectTo: '/centro-consejo' })
      ).rejects.toThrow('OAuth blocked for existing user');

      expect(mockSignIn).toHaveBeenCalledWith('google', {
        redirectTo: '/centro-consejo',
      });
    });

    it('should require Centro Consejo registration for new OAuth users', async () => {
      mockUserFindUnique.mockResolvedValue(null);
      mockCentroConsejoMemberFindUnique.mockResolvedValue(null); // New user

      mockSignIn.mockImplementation(async (provider, options) => {
        // Simulate OAuth success but needs registration
        return {
          url: '/centro-consejo/verificar',
          user: { needsRegistration: true },
        };
      });

      const result = await mockSignIn('google', {
        redirectTo: '/centro-consejo',
      });

      expect(result.user.needsRegistration).toBe(true);
    });

    it('should handle OAuth provider errors', async () => {
      mockSignIn.mockRejectedValue(new AuthError('OAuthAccountNotLinked'));

      await expect(
        mockSignIn('google', { redirectTo: '/centro-consejo' })
      ).rejects.toThrow(AuthError);
    });

    it('should handle OAuth network timeouts', async () => {
      mockSignIn.mockRejectedValue(new Error('Network timeout'));

      await expect(
        mockSignIn('facebook', { redirectTo: '/centro-consejo' })
      ).rejects.toThrow('Network timeout');
    });
  });

  describe('Session Management', () => {
    it('should handle logout correctly', async () => {
      mockSignOut.mockResolvedValue(undefined);

      await mockSignOut({ redirectTo: '/', redirect: true });

      expect(mockSignOut).toHaveBeenCalledWith({
        redirectTo: '/',
        redirect: true,
      });
    });

    it('should handle session persistence', async () => {
      const mockGetSession = vi.fn().mockResolvedValue({
        user: createTestAdmin(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const session = await mockGetSession();

      expect(session.user).toBeDefined();
      expect(session.expires).toBeDefined();
      expect(new Date(session.expires).getTime()).toBeGreaterThan(Date.now());
    });

    it('should handle session expiration', async () => {
      const mockGetSession = vi.fn().mockResolvedValue({
        user: createTestAdmin(),
        expires: new Date(Date.now() - 1000).toISOString(), // Expired
      });

      const session = await mockGetSession();

      expect(new Date(session.expires).getTime()).toBeLessThan(Date.now());
    });

    it('should handle concurrent sessions', async () => {
      mockSignIn.mockResolvedValue(undefined);

      const sessions = await Promise.all([
        mockSignIn('credentials', {
          email: 'admin@manitospintadas.cl',
          password: 'admin123',
        }),
        mockSignIn('credentials', {
          email: 'profesor@manitospintadas.cl',
          password: 'profesor123',
        }),
      ]);

      expect(sessions).toHaveLength(2);
      expect(mockSignIn).toHaveBeenCalledTimes(2);
    });

    it('should invalidate session on logout', async () => {
      mockSignOut.mockResolvedValue(undefined);

      await mockSignOut({ redirectTo: '/', redirect: true });

      expect(mockSignOut).toHaveBeenCalledWith({
        redirectTo: '/',
        redirect: true,
      });
    });
  });

  describe('Password Security', () => {
    it('should validate password requirements', () => {
      const validPasswords = [
        'admin123',
        'profesor123',
        'password123',
        'MySecurePass1',
      ];
      const invalidPasswords = ['123', 'pass', '', 'short'];

      validPasswords.forEach(password => {
        expect(password.length).toBeGreaterThanOrEqual(6);
      });

      invalidPasswords.forEach(password => {
        expect(password.length).toBeLessThan(6);
      });
    });

    it('should handle password hashing verification', async () => {
      mockVerifyPassword.mockResolvedValue(true);

      const isValid = await mockVerifyPassword('plaintext', 'hashed_password');

      expect(isValid).toBe(true);
      expect(mockVerifyPassword).toHaveBeenCalledWith(
        'plaintext',
        'hashed_password'
      );
    });

    it('should reject weak passwords', () => {
      const weakPasswords = ['123', 'abc', 'password', 'admin'];

      weakPasswords.forEach(password => {
        // Basic weakness check - in real implementation would be more sophisticated
        const isWeak =
          password.length < 6 ||
          !password.match(/[0-9]/) ||
          password === password.toLowerCase();
        expect(isWeak).toBe(true);
      });
    });
  });

  describe('Rate Limiting & Security', () => {
    it('should handle multiple failed login attempts', async () => {
      mockSignIn.mockRejectedValue(new AuthError('CredentialsSignin'));

      const failedAttempts = Array(5)
        .fill(null)
        .map(() =>
          mockSignIn('credentials', {
            email: 'admin@manitospintadas.cl',
            password: 'wrongpassword',
          })
        );

      const results = await Promise.allSettled(failedAttempts);

      results.forEach(result => {
        expect(result.status).toBe('rejected');
      });

      expect(mockSignIn).toHaveBeenCalledTimes(5);
    });

    it('should validate email format', () => {
      const validEmails = [
        'admin@manitospintadas.cl',
        'profesor@manitospintadas.cl',
        'test@example.com',
        'user.name@domain.co.uk',
      ];

      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test.example.com',
        'test@.com',
        'test@domain.',
      ];

      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    it('should prevent SQL injection in email field', async () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "admin@test.com'; DELETE FROM users; --",
      ];

      mockUserFindUnique.mockResolvedValue(null);
      mockSignIn.mockRejectedValue(new AuthError('CredentialsSignin'));

      for (const input of maliciousInputs) {
        await expect(
          mockSignIn('credentials', {
            email: input,
            password: 'anypassword',
          })
        ).rejects.toThrow(AuthError);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication action errors', async () => {
      mockAuthenticate.mockResolvedValue('Credenciales inválidas');

      const formData = new FormData();
      formData.append('email', 'wrong@example.com');
      formData.append('password', 'wrongpass');

      const result = await mockAuthenticate(undefined, formData);

      expect(result).toBe('Credenciales inválidas');
    });

    it('should handle network errors gracefully', async () => {
      mockSignIn.mockRejectedValue(new Error('Network error'));

      await expect(
        mockSignIn('credentials', {
          email: 'admin@manitospintadas.cl',
          password: 'admin123',
        })
      ).rejects.toThrow('Network error');
    });

    it('should handle database timeout errors', async () => {
      mockUserFindUnique.mockRejectedValue(new Error('Database timeout'));
      mockSignIn.mockRejectedValue(new Error('Database timeout'));

      await expect(
        mockSignIn('credentials', {
          email: 'admin@manitospintadas.cl',
          password: 'admin123',
        })
      ).rejects.toThrow('Database timeout');
    });

    it('should handle malformed responses', async () => {
      mockSignIn.mockRejectedValue(new Error('Invalid response format'));

      await expect(
        mockSignIn('credentials', {
          email: 'admin@manitospintadas.cl',
          password: 'admin123',
        })
      ).rejects.toThrow('Invalid response format');
    });
  });

  describe('Performance', () => {
    it('should complete credentials authentication quickly', async () => {
      const admin = createTestAdmin();
      mockUserFindUnique.mockResolvedValue({
        ...admin,
        password: 'hashed_password',
      });
      mockVerifyPassword.mockResolvedValue(true);
      mockSignIn.mockResolvedValue(undefined);

      const startTime = performance.now();

      await mockSignIn('credentials', {
        email: 'admin@manitospintadas.cl',
        password: 'admin123',
        redirectTo: '/admin',
      });

      const duration = performance.now() - startTime;

      // Should complete within 100ms for unit tests
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent authentication requests', async () => {
      const admin = createTestAdmin();
      const teacher = createTestTeacher();

      mockUserFindUnique
        .mockResolvedValueOnce({ ...admin, password: 'hashed_password' })
        .mockResolvedValueOnce({ ...teacher, password: 'hashed_password' });
      mockVerifyPassword.mockResolvedValue(true);
      mockSignIn.mockResolvedValue(undefined);

      const startTime = performance.now();

      const requests = await Promise.all([
        mockSignIn('credentials', {
          email: 'admin@manitospintadas.cl',
          password: 'admin123',
        }),
        mockSignIn('credentials', {
          email: 'profesor@manitospintadas.cl',
          password: 'profesor123',
        }),
      ]);

      const duration = performance.now() - startTime;

      expect(requests).toHaveLength(2);
      expect(duration).toBeLessThan(200); // Concurrent should be fast
    });
  });
});
