import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      result,
    });
  } catch (error: any) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        code: error.code,
        name: error.name,
        timestamp: new Date().toISOString(),
        env_check: {
          has_db_url: !!process.env.DATABASE_URL,
          db_url_prefix: process.env.DATABASE_URL?.substring(0, 20) + '...',
          provider: process.env.DATABASE_PROVIDER,
        },
      },
      { status: 503 }
    );
  }
}
