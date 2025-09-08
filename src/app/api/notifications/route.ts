import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendNotificationToUser } from '@/lib/notification-utils';

// Reset connection helper to avoid prepared statement conflicts
const resetConnection = async () => {
  try {
    await prisma.$disconnect();
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.warn('Error resetting connection:', error);
  }
};

export const runtime = 'nodejs';

// GET /api/notifications - Get notifications for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Reset connection to avoid prepared statement conflicts
    await resetConnection();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Try to fetch notifications, but handle database errors gracefully
    try {
      let whereClause = {};

      if (status === 'unread') {
        whereClause = { read: false };
      } else if (status === 'read') {
        whereClause = { read: true };
      }

      const notifications = await prisma.notification.findMany({
        where: {
          recipientId: session.user.id,
          ...whereClause,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return NextResponse.json({
        notifications,
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length,
      });
    } catch (dbError) {
      console.error('Database error fetching notifications:', dbError);

      // Return empty notifications with a warning
      return NextResponse.json({
        notifications: [],
        total: 0,
        unread: 0,
        warning: 'Notifications temporarily unavailable due to database issues'
      });
    }
  } catch (error) {
    console.error('Error in notifications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Reset connection to avoid prepared statement conflicts
    await resetConnection();

    const body = await request.json();
    const { notificationIds, markAll } = body;

    try {
      if (markAll) {
        await prisma.notification.updateMany({
          where: {
            recipientId: session.user.id,
            read: false,
          },
          data: {
            read: true,
            readAt: new Date(),
          },
        });
      } else if (notificationIds?.length > 0) {
        await prisma.notification.updateMany({
          where: {
            id: { in: notificationIds },
            recipientId: session.user.id,
          },
          data: {
            read: true,
            readAt: new Date(),
          },
        });
      }

      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error('Database error updating notifications:', dbError);
      return NextResponse.json(
        { error: 'Unable to update notifications due to database issues' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in notifications PATCH:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to create notifications (admin/professor)
    if (!['ADMIN', 'PROFESOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Reset connection to avoid prepared statement conflicts
    await resetConnection();

    const body = await request.json();
    const {
      title,
      message,
      type,
      category,
      recipientIds,
      isBroadcast,
      priority = 'medium',
      actionUrl,
      expiresAt,
    } = body;

    try {
      const notificationData = {
        title,
        message,
        type,
        category,
        priority,
        actionUrl,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        senderId: session.user.id,
      };

      if (isBroadcast) {
        // Create notification for all users
        const allUsers = await prisma.user.findMany({
          select: { id: true },
        });

        const notifications = allUsers.map(user => ({
          ...notificationData,
          recipientId: user.id,
        }));

        await prisma.notification.createMany({
          data: notifications,
        });
      } else if (recipientIds?.length > 0) {
        // Create notifications for specific users
        const notifications = recipientIds.map((recipientId: string) => ({
          ...notificationData,
          recipientId,
        }));

        await prisma.notification.createMany({
          data: notifications,
        });
      }

      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error('Database error creating notification:', dbError);
      return NextResponse.json(
        { error: 'Unable to create notification due to database issues' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in notifications POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}