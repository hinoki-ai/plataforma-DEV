import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Reset connection helper
const resetConnection = async () => {
  try {
    await prisma.$disconnect();
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.warn('Error resetting connection:', error);
  }
};

export const runtime = 'nodejs';

// GET /api/test-db - Test database connection
export async function GET() {
  try {
    // Reset connection to avoid prepared statement conflicts
    await resetConnection();

    // Test database connection
    await prisma.$connect();

    // Test simple user query
    const userCount = await prisma.user.count();

    // Test notifications table specifically
    let notificationsCount = 0;
    let notificationsStatus = 'available';
    try {
      notificationsCount = await prisma.notification.count();
    } catch (notificationError) {
      console.warn('Notifications table not available:', notificationError instanceof Error ? notificationError.message : String(notificationError));
      notificationsStatus = 'unavailable';
    }

    return NextResponse.json({
      status: 'success',
      databaseUrlAvailable: !!process.env.DATABASE_URL,
      userCount,
      notifications: {
        count: notificationsCount,
        status: notificationsStatus
      },
      message: 'Database query successful'
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        databaseUrlAvailable: !!process.env.DATABASE_URL,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Database connection failed'
      },
      { status: 500 }
    );
  }
}