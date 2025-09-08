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

    // Check permissions for edit - only ADMIN can edit photos
    if (session.user.role !== 'ADMIN') {
      throw new AuthenticationError('Only administrators can edit photos');
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, url } = body;

    // Check if photo exists
    const existingPhoto = await db.photo.findUnique({
      where: { id },
    });

    if (!existingPhoto) {
      throw new NotFoundError('Photo not found');
    }

    const photo = await db.photo.update({
      where: { id },
      data: {
        title: title || null,
        description: description || null,
        url: url || existingPhoto.url,
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
      message: 'Photo updated successfully',
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

    // Check permissions for delete - only ADMIN can delete photos
    if (session.user.role !== 'ADMIN') {
      throw new AuthenticationError('Only administrators can delete photos');
    }

    const { id } = await params;

    // Check if photo exists
    const existingPhoto = await db.photo.findUnique({
      where: { id },
    });

    if (!existingPhoto) {
      throw new NotFoundError('Photo not found');
    }

    await db.photo.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully',
    });
  }
);
