"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language/LanguageContext";

export interface UploadProgressProps {
  files: File[];
  onProgress?: (progress: number) => void;
  onComplete?: (results: UploadResult[]) => void;
  onError?: (error: string) => void;
}

export interface UploadResult {
  file: File;
  success: boolean;
  url?: string;
  error?: string;
  progress: number;
}

export function UploadProgress({
  files,
  onProgress,
  onComplete,
  onError,
}: UploadProgressProps) {
  const [uploadState, setUploadState] = useState<UploadResult[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (files.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUploadState(
        files.map((file) => ({
          file,
          success: false,
          progress: 0,
        })),
      );
    }
  }, [files]);

  useEffect(() => {
    if (uploadState.length > 0) {
      const totalProgress = uploadState.reduce(
        (sum, state) => sum + state.progress,
        0,
      );
      const averageProgress = totalProgress / uploadState.length;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOverallProgress(averageProgress);
      onProgress?.(averageProgress);

      // Check if all uploads are complete
      const allComplete = uploadState.every((state) => state.progress === 100);
      if (allComplete) {
        onComplete?.(uploadState);
        setIsUploading(false);
      }
    }
  }, [uploadState, onProgress, onComplete]);

  const updateProgress = (fileName: string, progress: number) => {
    setUploadState((prev) =>
      prev.map((state) =>
        state.file.name === fileName ? { ...state, progress } : state,
      ),
    );
  };

  const updateSuccess = (fileName: string, url: string) => {
    setUploadState((prev) =>
      prev.map((state) =>
        state.file.name === fileName
          ? { ...state, success: true, url, progress: 100 }
          : state,
      ),
    );
  };

  const updateError = (fileName: string, error: string) => {
    setUploadState((prev) =>
      prev.map((state) =>
        state.file.name === fileName
          ? { ...state, success: false, error, progress: 100 }
          : state,
      ),
    );
    onError?.(error);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 " + t("upload.bytes", "common");
    const k = 1024;
    const sizes = [
      t("upload.bytes", "common"),
      t("upload.kb", "common"),
      t("upload.mb", "common"),
      t("upload.gb", "common"),
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusIcon = (state: UploadResult) => {
    if (state.progress === 100) {
      return state.success ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500" />
      );
    }
    return <AlertCircle className="h-5 w-5 text-blue-500" />;
  };

  const getStatusText = (state: UploadResult) => {
    if (state.error) return state.error;
    if (state.progress === 100 && state.success)
      return t("upload.success_message", "common");
    if (state.progress === 100 && !state.success)
      return t("upload.error_message", "common");
    return `${Math.round(state.progress)}%`;
  };

  return (
    <div className="space-y-4">
      {/* Overall progress bar */}
      {isUploading && (
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">
              {t("upload.progress", "common")}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Individual file progress */}
      <div className="space-y-3">
        {uploadState.map((state, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              state.error
                ? "border-red-200 bg-red-50"
                : "border-border bg-background",
            )}
          >
            <div className="flex items-center space-x-3 flex-1">
              {getStatusIcon(state)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">
                    {state.file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(state.file.size)}
                  </span>
                </div>
                <div className="mt-1">
                  <div className="text-xs text-muted-foreground">
                    {getStatusText(state)}
                  </div>
                  {state.progress < 100 && !state.error && (
                    <div className="w-full bg-secondary rounded-full h-1 mt-1">
                      <div
                        className="bg-primary h-1 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${state.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Success summary */}
      {overallProgress === 100 && (
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-green-700">
            {uploadState.filter((s) => s.success).length}{" "}
            {t("common.of", "common")} {uploadState.length}{" "}
            {t("upload.files_uploaded_success", "common")}
          </p>
        </div>
      )}
    </div>
  );
}

// Hook for managing upload state
export function useUploadProgress() {
  const [uploadState, setUploadState] = useState<UploadResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const startUpload = (files: File[]) => {
    setUploadState(
      files.map((file) => ({
        file,
        success: false,
        progress: 0,
      })),
    );
    setIsUploading(true);
  };

  const updateFileProgress = (fileName: string, progress: number) => {
    setUploadState((prev) =>
      prev.map((state) =>
        state.file.name === fileName ? { ...state, progress } : state,
      ),
    );
  };

  const completeFileUpload = (fileName: string, url: string) => {
    setUploadState((prev) =>
      prev.map((state) =>
        state.file.name === fileName
          ? { ...state, success: true, url, progress: 100 }
          : state,
      ),
    );
  };

  const failFileUpload = (fileName: string, error: string) => {
    setUploadState((prev) =>
      prev.map((state) =>
        state.file.name === fileName
          ? { ...state, success: false, error, progress: 100 }
          : state,
      ),
    );
  };

  const resetUpload = () => {
    setUploadState([]);
    setIsUploading(false);
  };

  return {
    uploadState,
    isUploading,
    startUpload,
    updateFileProgress,
    completeFileUpload,
    failFileUpload,
    resetUpload,
  };
}

export default UploadProgress;
