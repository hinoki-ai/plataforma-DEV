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

  const videos = await db.video.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      uploader: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    videos,
  });
});

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  console.log('Video upload API called');

  const session = await auth();
  console.log('Session:', session);

  if (!session?.user) {
    console.log('No session or user found');
    throw new AuthenticationError('Authentication required');
  }

  console.log('User:', session.user);
  console.log('User role:', session.user.role);

  // Check permissions for upload - only ADMIN can upload videos
  if (session.user.role !== 'ADMIN') {
    console.log('Insufficient permissions for user:', session.user.role);
    throw new AuthenticationError('Only administrators can upload videos');
  }

  const body = await request.json();
  const { title, url } = body;

  console.log('Request body:', { title, url });

  if (!title) {
    throw new ValidationError('Video title is required');
  }

  if (!url) {
    throw new ValidationError('Video URL is required');
  }

  console.log('Creating video in database...');

  const video = await db.video.create({
    data: {
      title,
      url,
      uploadedBy: session.user.id,
    },
    include: {
      uploader: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  console.log('Video created successfully:', video);

  return NextResponse.json({
    success: true,
    video,
    message: 'Video uploaded successfully',
  });
});
