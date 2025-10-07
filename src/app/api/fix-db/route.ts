import { NextResponse } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

// Simple test to verify Convex connection
export async function GET() {
  try {
    // Check if Convex URL is configured
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!convexUrl) {
      return NextResponse.json(
        {
          error: 'NEXT_PUBLIC_CONVEX_URL not properly configured',
          convexUrl: convexUrl,
          suggestion: 'Check environment variables and run: npx convex dev',
        },
        { status: 500 }
      );
    }

    // Test Convex connection by querying users
    const client = getConvexClient();
    const users = await client.query(api.users.getUsers, {});

    return NextResponse.json({
      status: 'success',
      message: 'Convex connection working',
      convexUrl: convexUrl,
      userCount: users.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
