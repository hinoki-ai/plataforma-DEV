import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  withApiErrorHandling,
  AuthenticationError,
  ValidationError,
  NotFoundError,
} from '@/lib/error-handler';

// GET - Retrieve the video capsule
export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user) {
    throw new AuthenticationError('Authentication required');
  }

  // Get the single video capsule (we'll use a fixed ID for simplicity)
  const videoCapsule = await db.videoCapsule.findFirst({
    where: { id: 'default-capsule' },
  });

  // If no capsule exists, return default structure
  if (!videoCapsule) {
    return NextResponse.json({
      success: true,
      videoCapsule: {
        id: 'default-capsule',
        title: 'Cápsula de Video Educativo',
        url: '',
        description: 'Video sobre nuestro enfoque educativo',
        isActive: false,
      },
    });
  }

  return NextResponse.json({
    success: true,
    videoCapsule,
  });
});

// PUT - Update the video capsule (admin only)
export const PUT = withApiErrorHandling(async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user) {
    throw new AuthenticationError('Authentication required');
  }

  // Check permissions - only ADMIN can update
  if (session.user.role !== 'ADMIN') {
    throw new AuthenticationError(
      'Only administrators can update video capsules'
    );
  }

  const body = await request.json();
  const { title, url, description, isActive } = body;

  if (!title) {
    throw new ValidationError('Video capsule title is required');
  }

  // Validate URL format for YouTube or Vimeo
  if (url && !isValidVideoUrl(url)) {
    throw new ValidationError(
      'Invalid video URL. Please provide a valid YouTube or Vimeo URL'
    );
  }

  // Check if video capsule exists
  const existingCapsule = await db.videoCapsule.findFirst({
    where: { id: 'default-capsule' },
  });

  let videoCapsule;

  if (existingCapsule) {
    // Update existing capsule
    videoCapsule = await db.videoCapsule.update({
      where: { id: 'default-capsule' },
      data: {
        title: title || existingCapsule.title,
        url: url || existingCapsule.url,
        description: description || existingCapsule.description,
        isActive: isActive !== undefined ? isActive : existingCapsule.isActive,
      },
    });
  } else {
    // Create new capsule
    videoCapsule = await db.videoCapsule.create({
      data: {
        id: 'default-capsule',
        title,
        url: url || '',
        description: description || '',
        isActive: isActive || false,
      },
    });
  }

  return NextResponse.json({
    success: true,
    videoCapsule,
    message: 'Video capsule updated successfully',
  });
});

// DELETE - Reset the video capsule (admin only)
export const DELETE = withApiErrorHandling(async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user) {
    throw new AuthenticationError('Authentication required');
  }

  // Check permissions - only ADMIN can delete
  if (session.user.role !== 'ADMIN') {
    throw new AuthenticationError(
      'Only administrators can delete video capsules'
    );
  }

  // Check if video capsule exists
  const existingCapsule = await db.videoCapsule.findFirst({
    where: { id: 'default-capsule' },
  });

  if (existingCapsule) {
    await db.videoCapsule.delete({
      where: { id: 'default-capsule' },
    });
  }

  return NextResponse.json({
    success: true,
    message: 'Video capsule deleted successfully',
  });
});

// Helper function to validate video URLs
function isValidVideoUrl(url: string): boolean {
  if (!url) return true; // Empty URL is allowed

  const youtubePattern =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+/;
  const vimeoPattern = /^(https?:\/\/)?(www\.)?(vimeo\.com\/)[0-9]+/;

  return youtubePattern.test(url) || vimeoPattern.test(url);
}
