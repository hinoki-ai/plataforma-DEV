import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission, Permissions } from '@/lib/authorization';
import {
  withApiErrorHandling,
  AuthenticationError,
  ValidationError,
  NotFoundError,
} from '@/lib/error-handler';

export const PUT = withApiErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Check permissions for edit - only ADMIN can edit videos
    if (session.user.role !== 'ADMIN') {
      throw new AuthenticationError('Only administrators can edit videos');
    }

    const { id } = await params;
    const body = await request.json();
    const { title, url } = body;

    // Check if video exists
    const existingVideo = await db.video.findUnique({
      where: { id },
    });

    if (!existingVideo) {
      throw new NotFoundError('Video not found');
    }

    const video = await db.video.update({
      where: { id },
      data: {
        title: title || existingVideo.title,
        url: url || existingVideo.url,
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

    return NextResponse.json({
      success: true,
      video,
      message: 'Video updated successfully',
    });
  }
);

export const DELETE = withApiErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Check permissions for delete - only ADMIN can delete videos
    if (session.user.role !== 'ADMIN') {
      throw new AuthenticationError('Only administrators can delete videos');
    }

    const { id } = await params;

    // Check if video exists
    const existingVideo = await db.video.findUnique({
      where: { id },
    });

    if (!existingVideo) {
      throw new NotFoundError('Video not found');
    }

    await db.video.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully',
    });
  }
);
