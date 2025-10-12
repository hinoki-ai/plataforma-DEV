import { writeFile, mkdir, unlink, access } from "fs/promises";
import { join } from "path";
import { isCornerstoneLocked, lockCornerstone } from "./cornerstone";

export interface SimpleFileMetadata {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  uploadedAt: string;
  path: string;
}

export class SimpleFileStorage {
  private static uploadDir = join(process.cwd(), "public", "uploads");

  /**
   * Simple file upload to local storage
   */
  static async uploadFile(
    file: File,
    options?: { cornerstone?: boolean; note?: string },
  ): Promise<SimpleFileMetadata> {
    try {
      // Ensure upload directory exists
      await mkdir(this.uploadDir, { recursive: true });

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `${timestamp}_${sanitizedName}`;
      const filePath = join(this.uploadDir, filename);

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      const meta: SimpleFileMetadata = {
        id: filename,
        filename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        path: `/uploads/${filename}`,
      };

      // Optionally mark as cornerstone (locked) right after upload
      if (options?.cornerstone) {
        await lockCornerstone(filename, options.note);
      }
      return meta;
    } catch (error) {
      // Production: Silently handle errors with proper error messages
      throw new Error("Failed to upload file");
    }
  }

  /**
   * Simple file validation
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 15 * 1024 * 1024; // 15MB
    const allowedTypes = [
      "image/jpeg",
      "image/jpg", // Also accept jpg mime type
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File ${file.name} exceeds 15MB limit`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} not allowed`,
      };
    }

    return { valid: true };
  }

  /**
   * Delete a file from storage
   */
  static async deleteFile(filename: string): Promise<void> {
    try {
      const filePath = join(this.uploadDir, filename);

      // Check if file exists before attempting deletion
      try {
        await access(filePath);
      } catch {
        throw new Error("File not found");
      }

      // Prevent deletion if file is cornerstone-locked
      if (await isCornerstoneLocked(filename)) {
        throw new Error("File is cornerstone-locked");
      }

      // Delete the file
      await unlink(filePath);
    } catch (error) {
      // Production: Silently handle errors
      throw new Error(
        `Failed to delete file: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Check if a file exists
   */
  static async fileExists(filename: string): Promise<boolean> {
    try {
      const filePath = join(this.uploadDir, filename);
      await access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

export default SimpleFileStorage;
