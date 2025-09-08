// ⚡ Performance: Web Vitals analytics endpoint
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

interface WebVitalsData {
  metric: {
    name: string;
    value: number;
    id: string;
    delta: number;
  };
  level: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  budget: {
    good: number;
    poor: number;
    target: number;
  };
  timestamp: number;
  url: string;
  userAgent: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: WebVitalsData = await request.json();

    // Validate required fields
    if (!data.metric?.name || typeof data.metric?.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      );
    }

    // Get client info
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const referer = headersList.get('referer') || data.url;

    // Enhanced analytics data
    const analyticsEvent = {
      ...data,
      // Server-side enhancements
      serverTimestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      referer,
      userAgent: userAgent || data.userAgent,

      // Performance categorization
      isCore: ['LCP', 'INP', 'CLS'].includes(data.metric.name),
      needsAttention:
        data.level === 'poor' || data.level === 'needs-improvement',

      // Environment info
      environment: process.env.NODE_ENV,
    };

    // In production, you would send this to your analytics service
    // Examples: Google Analytics, DataDog, New Relic, Custom database

    if (process.env.NODE_ENV === 'production') {
      // Example: Send to external analytics service
      // await sendToAnalyticsService(analyticsEvent);

      // Example: Store in database for internal analysis
      // await storeWebVitalsData(analyticsEvent);

      console.log('📊 Web Vitals collected:', {
        metric: data.metric.name,
        value: data.metric.value,
        level: data.level,
        url: referer,
      });
    }

    // Development logging with detailed info
    if (process.env.NODE_ENV === 'development') {
      console.log('🔥 Web Vitals Development Report:', {
        metric: data.metric.name,
        value: `${data.metric.value}ms`,
        level: data.level,
        budget: data.budget,
        url: referer,
        timestamp: new Date(data.timestamp).toLocaleTimeString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Web Vitals data recorded',
      level: data.level,
    });
  } catch (error) {
    console.error('Web Vitals API error:', error);
    return NextResponse.json(
      { error: 'Failed to process Web Vitals data' },
      { status: 500 }
    );
  }
}

// ⚡ Performance: Health check endpoint for Web Vitals monitoring
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'web-vitals-analytics',
    timestamp: new Date().toISOString(),
    budgets: {
      LCP: { target: '2.0s', good: '2.5s', poor: '4.0s' },
      INP: { target: '100ms', good: '200ms', poor: '500ms' },
      CLS: { target: '0.05', good: '0.1', poor: '0.25' },
      FCP: { target: '1.5s', good: '1.8s', poor: '3.0s' },
      TTFB: { target: '0.6s', good: '0.8s', poor: '1.8s' },
    },
  });
}
