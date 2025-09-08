import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Simple fix to test database connection with proper environment variable handling
export async function GET() {
  try {
    // Force use of Vercel environment variables
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl || dbUrl.includes('${')) {
      return NextResponse.json(
        {
          error: 'DATABASE_URL not properly configured',
          dbUrl: dbUrl,
          suggestion: 'Check Vercel environment variables',
        },
        { status: 500 }
      );
    }

    // Test database connection
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    });

    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1 as test`;
    await prisma.$disconnect();

    return NextResponse.json({
      status: 'success',
      message: 'Database connection working',
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
