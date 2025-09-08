import { GET, POST } from '@/lib/auth';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limiter';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Rate limited GET handler (for session requests)
async function rateLimitedGET(request: NextRequest) {
  if (checkRateLimit(request, RATE_LIMITS.SESSION_REQUESTS.limit, RATE_LIMITS.SESSION_REQUESTS.windowMs, 'session')) {
    return NextResponse.json(
      { error: 'Too many session requests. Please try again later.' },
      {
        status: 429,
        headers: getRateLimitHeaders(request, RATE_LIMITS.SESSION_REQUESTS.limit, RATE_LIMITS.SESSION_REQUESTS.windowMs, 'session')
      }
    );
  }

  return GET(request);
}

// Rate limited POST handler
async function rateLimitedPOST(request: NextRequest) {
  if (checkRateLimit(request, RATE_LIMITS.AUTH_ACTIONS.limit, RATE_LIMITS.AUTH_ACTIONS.windowMs, 'auth')) {
    return NextResponse.json(
      { error: 'Too many authentication requests. Please try again later.' },
      {
        status: 429,
        headers: getRateLimitHeaders(request, RATE_LIMITS.AUTH_ACTIONS.limit, RATE_LIMITS.AUTH_ACTIONS.windowMs, 'auth')
      }
    );
  }

  return POST(request);
}

export { rateLimitedGET as GET, rateLimitedPOST as POST };
