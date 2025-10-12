"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, File, Image, FileText, Video } from "lucide-react";
import { Button } from "./button";
import { Progress } from "./progress";
import { cn } from "@/lib/utils";

export interface UploadFile extends File {
  preview?: string;
  uploadProgress?: number;
  uploadStatus?: "pending" | "uploading" | "success" | "error";
  error?: string;
}

interface FileUploadProgressProps {
  onFilesUpload: (files: UploadFile[]) => Promise<void>;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: Record<string, string[]>;
  className?: string;
  disabled?: boolean;
  uploadEndpoint?: string;
  onUploadComplete?: (files: UploadFile[]) => void;
  onUploadError?: (error: string) => void;
}

export function FileUploadProgress({
  onFilesUpload,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = {
    "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
      ".xlsx",
    ],
    "text/plain": [".txt"],
  },
  className,
  disabled = false,
  onUploadComplete,
  onUploadError,
}: FileUploadProgressProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => {
        const uploadFile = Object.assign(file, {
          preview: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : undefined,
          uploadProgress: 0,
          uploadStatus: "pending" as const,
        });
        return uploadFile;
      });

      const updatedFiles = [...files, ...newFiles].slice(0, maxFiles);
      setFiles(updatedFiles);
    },
    [files, maxFiles],
  );

  const simulateUpload = async (file: UploadFile): Promise<UploadFile> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve({
            ...file,
            uploadProgress: 100,
            uploadStatus: "success",
          });
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              f === file
                ? { ...f, uploadProgress: progress, uploadStatus: "uploading" }
                : f,
            ),
          );
        }
      }, 200);
    });
  };

  const uploadFiles = async () => {
    setIsUploading(true);
    try {
      const pendingFiles = files.filter((f) => f.uploadStatus === "pending");

      for (const file of pendingFiles) {
        await simulateUpload(file);
      }

      const completedFiles = files.map((f) => ({
        ...f,
        uploadStatus: "success" as const,
        uploadProgress: 100,
      }));

      setFiles(completedFiles);
      onUploadComplete?.(completedFiles);
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      // Revoke preview URL to prevent memory leaks
      if (files[index]?.preview) {
        URL.revokeObjectURL(files[index].preview!);
      }
      setFiles(newFiles);
    },
    [files],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: acceptedFileTypes,
      maxSize,
      maxFiles:
        maxFiles - files.filter((f) => f.uploadStatus !== "error").length,
      disabled: disabled || isUploading,
    });

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <Image className="h-4 w-4" alt="Image file" />;
    if (file.type.includes("pdf")) return <FileText className="h-4 w-4" />;
    if (file.type.startsWith("video/")) return <Video className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "uploading":
        return "text-blue-600";
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusText = (status?: string, progress?: number) => {
    switch (status) {
      case "pending":
        return "En espera";
      case "uploading":
        return `Subiendo... ${Math.round(progress || 0)}%`;
      case "success":
        return "Completado";
      case "error":
        return "Error";
      default:
        return "Pendiente";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          "hover:border-gray-400 transition-transform",
          isDragActive ? "border-primary bg-primary/5" : "border-gray-300",
          disabled && "opacity-50 cursor-not-allowed",
          files.length >= maxFiles && "opacity-50 cursor-not-allowed",
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-primary">Suelta los archivos aquí...</p>
        ) : (
          <div>
            <p className="text-muted-foreground mb-2">
              Arrastra y suelta archivos aquí, o{" "}
              <span className="text-primary underline">busca</span>
            </p>
            <p className="text-sm text-gray-500">
              Máximo {maxFiles} archivos, hasta {formatFileSize(maxSize)} cada
              uno
            </p>
          </div>
        )}
      </div>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div
              key={file.name}
              className="text-sm text-red-600 bg-red-50 p-3 rounded-lg"
            >
              <strong>{file.name}</strong> -{" "}
              {errors.map((e) => e.message).join(", ")}
            </div>
          ))}
        </div>
      )}

      {/* File Preview with Progress */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">
            Archivos ({files.filter((f) => f.uploadStatus !== "error").length}/
            {maxFiles})
          </h4>
          <div className="space-y-3">
            {files.map((file, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                        {getFileIcon(file)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                        <p
                          className={cn(
                            "text-xs font-medium",
                            getStatusColor(file.uploadStatus),
                          )}
                        >
                          {getStatusText(
                            file.uploadStatus,
                            file.uploadProgress,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                    disabled={file.uploadStatus === "uploading"}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progress Bar */}
                {file.uploadStatus === "uploading" &&
                  file.uploadProgress !== undefined && (
                    <div className="w-full">
                      <Progress value={file.uploadProgress} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>
                          {Math.round(file.uploadProgress)}% completado
                        </span>
                        <span>
                          {file.uploadProgress < 100 ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-primary"></div>
                          ) : (
                            "✓"
                          )}
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>

          {/* Upload Button */}
          {files.some((f) => f.uploadStatus === "pending") && (
            <Button
              onClick={uploadFiles}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <span className="flex items-center justify-center">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary mr-2"></div>
                  Subiendo archivos...
                </span>
              ) : (
                "Subir archivos"
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
