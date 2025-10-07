import { auth } from "@/lib/auth";
import { hasPermission, Permissions } from "@/lib/authorization";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { SimpleFileStorage } from "@/lib/simple-upload";
import { rateLimiter, RATE_LIMITS } from "@/lib/rate-limiter";
import {
  withApiErrorHandling,
  AuthenticationError,
  ValidationError,
} from "@/lib/error-handler";
import { sanitizeInput } from "@/lib/sanitization";

export const runtime = "nodejs";

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  // Rate limiting for file uploads
  const clientIp =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const { limit, windowMs } = RATE_LIMITS.UPLOAD;

  if (rateLimiter.isLimited(`upload:${clientIp}`, limit, windowMs)) {
    return NextResponse.json(
      { error: "Too many upload attempts. Please try again later." },
      { status: 429 },
    );
  }

  // Check authentication
  const session = await auth();
  if (!session?.user) {
    throw new AuthenticationError("Authentication required");
  }

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (!files || files.length === 0) {
    throw new ValidationError("No files provided");
  }

  if (files.length > 3) {
    throw new ValidationError("Maximum 3 files allowed");
  }

  // Simple file validation and upload
  const uploadedFiles = [];
  for (const file of files) {
    // Sanitize filename to prevent path traversal and other attacks
    const sanitizedFilename = sanitizeInput(file.name, "filename", {
      maxLength: 255,
    });

    const validation = SimpleFileStorage.validateFile(file);
    if (!validation.valid) {
      throw new ValidationError(validation.error!);
    }

    try {
      const result = await SimpleFileStorage.uploadFile(file);
      uploadedFiles.push(result);
    } catch (error) {
      throw new ValidationError(`Failed to upload ${sanitizedFilename}`);
    }
  }

  return NextResponse.json({
    success: true,
    files: uploadedFiles,
    message: `${uploadedFiles.length} file${uploadedFiles.length !== 1 ? "s" : ""} uploaded successfully`,
  });
});

export const DELETE = withApiErrorHandling(async (request: NextRequest) => {
  // Check authentication
  const session = await auth();
  if (!session?.user) {
    throw new AuthenticationError();
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    throw new ValidationError("Filename required");
  }

  // Sanitize and validate filename to prevent directory traversal and other attacks
  const sanitizedFilename = sanitizeInput(filename, "filename", {
    maxLength: 255,
  });
  if (sanitizedFilename !== filename) {
    throw new ValidationError("Invalid filename characters");
  }

  // Check if file exists before deletion
  const exists = await SimpleFileStorage.fileExists(filename);
  if (!exists) {
    throw new ValidationError("File not found");
  }

  // Delete the file
  await SimpleFileStorage.deleteFile(filename);

  return NextResponse.json({
    success: true,
    message: "File deleted successfully",
  });
});
