"use client";

import { useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import type { SimpleFileMetadata as FileMetadata } from "@/lib/simple-upload";
import { useLanguage } from "@/components/language/LanguageContext";

// i18n
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

interface AttachmentListProps {
  attachments: FileMetadata[];
  showActions?: boolean;
  onDelete?: (fileId: string) => void;
}

export function AttachmentList({
  attachments,
  showActions = false,
  onDelete,
}: AttachmentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { t, language } = useLanguage();

  if (!attachments || attachments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p>{t("attachment.empty", "common")}</p>
      </div>
    );
  }

  const getFileIcon = (fileType: string) => {
    if (
      fileType.startsWith("image/") ||
      ["jpg", "jpeg", "png", "gif", "webp"].includes(fileType)
    ) {
      return <ImageIcon className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  const isImageFile = (fileType: string) => {
    return (
      fileType.startsWith("image/") ||
      ["jpg", "jpeg", "png", "gif", "webp"].includes(fileType)
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatUploadDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(
        language === "es" ? "es-CL" : "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
      );
    } catch (error) {
      return t("attachment.unknown_date", "common");
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!onDelete) return;

    setDeletingId(fileId);
    try {
      await onDelete(fileId);
    } catch (error) {
      console.error("Error deleting file:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {attachments.map((file) => (
        <Card key={file.id} className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {isImageFile(file.type) ? (
                  <div className="shrink-0">
                    <img
                      src={file.path}
                      alt={file.filename}
                      width={60}
                      height={60}
                      className="rounded-md object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="shrink-0 text-gray-500">
                    {getFileIcon(file.type)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {file.filename}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>
                      {t("attachment.uploaded", "common")}{" "}
                      {formatUploadDate(file.uploadedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {/* View/Download Button */}
                <Button variant="outline" size="sm" asChild className="h-8">
                  <a
                    href={file.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span className="hidden sm:inline">
                      {t("attachment.view", "common")}
                    </span>
                  </a>
                </Button>

                {/* Download Button */}
                <Button variant="outline" size="sm" asChild className="h-8">
                  <a
                    href={file.path}
                    download={file.filename}
                    className="flex items-center space-x-1"
                  >
                    <Download className="h-3 w-3" />
                    <span className="hidden sm:inline">
                      {t("attachment.download", "common")}
                    </span>
                  </a>
                </Button>

                {/* Delete Button */}
                {showActions && onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                    disabled={deletingId === file.id}
                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="hidden sm:inline">
                      {deletingId === file.id
                        ? t("planning.deleting", "common")
                        : t("planning.file.delete", "common")}
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default AttachmentList;
