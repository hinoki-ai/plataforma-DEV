// Simple in-memory rate limiter for Edge Runtime compatibility
// Uses Edge-compatible Map storage, no Node.js dependencies

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private storage = new Map<string, RateLimitEntry>();

  /**
   * Check if request should be rate limited
   * @param key - Unique identifier (IP, user ID, etc)
   * @param limit - Max requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if rate limited, false if allowed
   */
  isLimited(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const existing = this.storage.get(key);

    if (!existing || now > existing.resetTime) {
      // Reset counter for new window
      this.storage.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return false;
    }

    if (existing.count >= limit) {
      return true;
    }

    // Increment counter
    existing.count++;
    return false;
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key: string, limit: number, windowMs: number): number {
    const now = Date.now();
    const existing = this.storage.get(key);

    if (!existing || now > existing.resetTime) {
      return limit;
    }

    return Math.max(0, limit - existing.count);
  }

  /**
   * Clean up expired entries (optional cleanup)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (now > entry.resetTime) {
        this.storage.delete(key);
      }
    }
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Predefined rate limits for common use cases
export const RATE_LIMITS = {
  LOGIN: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  UPLOAD: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 uploads per hour
  API: { limit: 200, windowMs: 15 * 60 * 1000 }, // 200 requests per 15 minutes (increased for development)
  GENERAL: { limit: 100, windowMs: 60 * 1000 }, // 100 requests per minute (increased for development)
  PARENT_REQUESTS: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 meeting requests per hour
  ADMIN_ACTIONS: { limit: 20, windowMs: 60 * 1000 }, // 20 admin actions per minute
  SESSION_REQUESTS: { limit: 100, windowMs: 5 * 60 * 1000 }, // 100 session requests per 5 minutes (increased for development)
  AUTH_ACTIONS: { limit: 50, windowMs: 15 * 60 * 1000 }, // 50 auth actions per 15 minutes (increased for development)
} as const;

/**
 * Rate limiting middleware for API routes
 * @param request - NextRequest object
 * @param limit - Max requests allowed
 * @param windowMs - Time window in milliseconds
 * @param keyPrefix - Prefix for the rate limit key (e.g., 'api', 'auth')
 * @returns boolean - true if rate limited, false if allowed
 */
export function checkRateLimit(
  request: Request,
  limit: number,
  windowMs: number,
  keyPrefix: string = 'api'
): boolean {
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown';

  const rateLimitKey = `${keyPrefix}:${clientIp}`;

  return rateLimiter.isLimited(rateLimitKey, limit, windowMs);
}

/**
 * Get rate limit headers for response
 * @param request - NextRequest object
 * @param limit - Max requests allowed
 * @param windowMs - Time window in milliseconds
 * @param keyPrefix - Prefix for the rate limit key
 * @returns headers object with rate limit info
 */
export function getRateLimitHeaders(
  request: Request,
  limit: number,
  windowMs: number,
  keyPrefix: string = 'api'
): Record<string, string> {
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown';

  const rateLimitKey = `${keyPrefix}:${clientIp}`;
  const remaining = rateLimiter.getRemaining(rateLimitKey, limit, windowMs);

  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': Math.max(0, remaining).toString(),
    'X-RateLimit-Reset': (Date.now() + windowMs).toString(),
  };
}
