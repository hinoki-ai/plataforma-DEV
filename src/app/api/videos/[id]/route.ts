import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/../convex/_generated/api";
import { hasPermission, Permissions } from "@/lib/authorization";
import {
  withApiErrorHandling,
  AuthenticationError,
  ValidationError,
  NotFoundError,
} from "@/lib/error-handler";

export const PUT = withApiErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError("Authentication required");
    }

    // Check permissions for edit - only ADMIN can edit videos
    if (session.user.role !== "ADMIN") {
      throw new AuthenticationError("Only administrators can edit videos");
    }

    const { id } = await params;
    const body = await request.json();
    const { title, url } = body;

    const client = getConvexClient();

    // Check if video exists
    const existingVideo = await client.query(api.media.getVideoById, {
      id: id as any,
    });

    if (!existingVideo) {
      throw new NotFoundError("Video not found");
    }

    const updatedVideo = await client.mutation(api.media.updateVideo, {
      id: id as any,
      title: title || existingVideo.title,
      // url is not updatable in the current schema
    });

    const uploader = existingVideo.uploadedBy
      ? await client.query(api.users.getUserById, {
          userId: existingVideo.uploadedBy,
        })
      : null;

    const video = {
      ...updatedVideo,
      uploader: uploader
        ? { name: uploader.name, email: uploader.email }
        : null,
    };

    return NextResponse.json({
      success: true,
      video,
      message: "Video updated successfully",
    });
  },
);

export const DELETE = withApiErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    const session = await auth();
    if (!session?.user) {
      throw new AuthenticationError("Authentication required");
    }

    // Check permissions for delete - only ADMIN can delete videos
    if (session.user.role !== "ADMIN") {
      throw new AuthenticationError("Only administrators can delete videos");
    }

    const { id } = await params;

    const client = getConvexClient();

    // Check if video exists
    const existingVideo = await client.query(api.media.getVideoById, {
      id: id as any,
    });

    if (!existingVideo) {
      throw new NotFoundError("Video not found");
    }

    await client.mutation(api.media.deleteVideo, {
      id: id as any,
    });

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully",
    });
  },
);
