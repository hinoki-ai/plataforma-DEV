import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbLogger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, message, stack, url, severity } = body;

    // Validate request structure
    if (!type || !message) {
      return NextResponse.json(
        { error: 'Invalid request structure' },
        { status: 400 }
      );
    }

    // Log error data
    dbLogger.error('Client error tracked', {
      type,
      message,
      stack,
      url,
      severity: severity || 'medium',
      timestamp: new Date().toISOString(),
      userId: session.user.id,
      userAgent: request.headers.get('user-agent'),
    });

    // Store error in database using existing notification system
    // TODO: Create proper ErrorLog model in schema for production
    const errorData = {
      id: Date.now().toString(),
      type,
      message,
      stack,
      url,
      severity: severity || 'medium',
      timestamp: new Date().toISOString(),
      userId: session.user.id,
    };

    return NextResponse.json({
      success: true,
      id: errorData.id,
    });
  } catch (error) {
    dbLogger.error('Error storing error data', error, {
      context: 'debug-errors-api',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const severity = searchParams.get('severity');

    // TODO: Replace with proper database query once ErrorLog model is created
    // For now, return empty data until proper implementation
    const errorLogs: any[] = [];

    const filteredData = errorLogs;

    return NextResponse.json({
      success: true,
      data: filteredData.slice(0, limit),
      total: filteredData.length,
      summary: {
        critical: filteredData.filter(item => item.severity === 'critical').length,
        high: filteredData.filter(item => item.severity === 'high').length,
        medium: filteredData.filter(item => item.severity === 'medium').length,
        low: filteredData.filter(item => item.severity === 'low').length,
        resolved: filteredData.filter(item => item.resolved).length,
        unresolved: filteredData.filter(item => !item.resolved).length,
      },
    });
  } catch (error) {
    dbLogger.error('Error fetching error data', error, {
      context: 'debug-errors-api',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
