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
  const photos = await client.query(api.media.getPhotos, {});

  // Fetch uploader details for each photo
  const photosWithUploaders = await Promise.all(
    photos.map(async (photo) => {
      const user = photo.uploadedBy
        ? await client.query(api.users.getUserById, { userId: photo.uploadedBy })
        : null;
      return {
        ...photo,
        user: user ? { name: user.name, email: user.email } : null,
      };
    })
  );

  return NextResponse.json({
    success: true,
    photos: photosWithUploaders,
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

  const client = getConvexClient();
  const photoId = await client.mutation(api.media.createPhoto, {
    title: title || undefined,
    description: description || undefined,
    url,
    uploadedBy: session.user.id as any,
  });

  const photo = await client.query(api.media.getPhotoById, { id: photoId });
  const user = await client.query(api.users.getUserById, {
    userId: session.user.id as any,
  });

  return NextResponse.json({
    success: true,
    photo: {
      ...photo,
      user: { name: user?.name, email: user?.email },
    },
    message: 'Photo uploaded successfully',
  });
});
