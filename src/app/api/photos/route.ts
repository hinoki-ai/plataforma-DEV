import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission, Permissions } from '@/lib/authorization';
import {
  withApiErrorHandling,
  AuthenticationError,
  ValidationError,
} from '@/lib/error-handler';

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user) {
    throw new AuthenticationError('Authentication required');
  }

  const photos = await db.photo.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    photos,
  });
});

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user) {
    throw new AuthenticationError('Authentication required');
  }

  // Check permissions for upload - only ADMIN can upload photos
  if (session.user.role !== 'ADMIN') {
    throw new AuthenticationError('Only administrators can upload photos');
  }

  const body = await request.json();
  const { title, description, url } = body;

  if (!url) {
    throw new ValidationError('Photo URL is required');
  }

  const photo = await db.photo.create({
    data: {
      title: title || null,
      description: description || null,
      url,
      uploadedBy: session.user.id,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    photo,
    message: 'Photo uploaded successfully',
  });
});
