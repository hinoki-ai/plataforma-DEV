import { NextResponse } from 'next/server';
import { registerParent } from '@/services/actions/unified-registration';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limiter';
import { sanitizeFormData, SANITIZATION_SCHEMAS } from '@/lib/sanitization';

export async function POST(request: Request) {
  try {
    // Rate limiting for registration attempts
    if (checkRateLimit(request, RATE_LIMITS.AUTH_ACTIONS.limit, RATE_LIMITS.AUTH_ACTIONS.windowMs, 'register')) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(request, RATE_LIMITS.AUTH_ACTIONS.limit, RATE_LIMITS.AUTH_ACTIONS.windowMs, 'register')
        }
      );
    }

    const formData = await request.formData();
    // Sanitize form data before processing
    const sanitizedData = sanitizeFormData(formData, SANITIZATION_SCHEMAS.USER_PROFILE);
    const result = await registerParent(formData); // Keep original formData for file handling
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
