import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/../convex/_generated/api';
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

  const client = getConvexClient();
  const videos = await client.query(api.media.getVideos, {});

  // Fetch uploader details for each video
  const videosWithUploaders = await Promise.all(
    videos.map(async (video) => {
      const uploader = video.uploadedBy
        ? await client.query(api.users.getUserById, { userId: video.uploadedBy })
        : null;
      return {
        ...video,
        uploader: uploader
          ? { name: uploader.name, email: uploader.email }
          : null,
      };
    })
  );

  return NextResponse.json({
    success: true,
    videos: videosWithUploaders,
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
  const { title, url, description, thumbnail, category, isPublic } = body;

  console.log('Request body:', { title, url });

  if (!title) {
    throw new ValidationError('Video title is required');
  }

  if (!url) {
    throw new ValidationError('Video URL is required');
  }

  console.log('Creating video in database...');

  const client = getConvexClient();
  const videoId = await client.mutation(api.media.createVideo, {
    title,
    url,
    description,
    thumbnail,
    category,
    isPublic,
    uploadedBy: session.user.id as any, // Convex ID
  });

  const video = await client.query(api.media.getVideoById, { id: videoId });
  const uploader = await client.query(api.users.getUserById, {
    userId: session.user.id as any,
  });

  console.log('Video created successfully:', video);

  return NextResponse.json({
    success: true,
    video: {
      ...video,
      uploader: { name: uploader?.name, email: uploader?.email },
    },
    message: 'Video uploaded successfully',
  });
});
