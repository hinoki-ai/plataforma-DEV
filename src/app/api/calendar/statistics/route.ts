import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/server-auth';
import { getCalendarStatistics } from '@/services/calendar/calendar-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = {
      startDate: searchParams.get('startDate')
        ? new Date(searchParams.get('startDate')!)
        : undefined,
      endDate: searchParams.get('endDate')
        ? new Date(searchParams.get('endDate')!)
        : undefined,
      categories: searchParams.get('categories')
        ? (searchParams.get('categories')!.split(',') as any[])
        : undefined,
      priority: searchParams.get('priority') as any,
      search: searchParams.get('search') || undefined,
    };

    const result = await getCalendarStatistics();

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch calendar statistics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Calendar statistics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
