import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, properties, userId, traits } = body;

    console.log('Analytics Event:', {
      event,
      properties,
      userId,
      traits,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'analytics api active',
    timestamp: new Date().toISOString(),
  });
}
