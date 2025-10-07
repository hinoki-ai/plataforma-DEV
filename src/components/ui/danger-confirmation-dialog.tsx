"use client";

import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";

interface DangerConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmationText: string;
  confirmButtonText?: string;
  onConfirm: () => void;
  variant?: "destructive" | "warning";
}

export function DangerConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmationText,
  confirmButtonText = "Confirm",
  onConfirm,
  variant = "destructive",
}: DangerConfirmationDialogProps) {
  const [typedText, setTypedText] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setTypedText("");
      setError(null);
      setIsConfirming(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (typedText !== confirmationText) {
      setError("Confirmation text does not match");
      return;
    }

    setIsConfirming(true);
    setError(null);

    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Confirmation action failed:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleInputChange = (value: string) => {
    setTypedText(value);
    if (error && value !== confirmationText) {
      setError(null);
    }
  };

  const isValid = typedText === confirmationText;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={`max-w-md ${
          variant === "destructive"
            ? "border-red-200 dark:border-red-800"
            : "border-yellow-200 dark:border-yellow-800"
        }`}
      >
        <AlertDialogHeader>
          <AlertDialogTitle
            className={`flex items-center gap-2 ${
              variant === "destructive"
                ? "text-red-700 dark:text-red-300"
                : "text-yellow-700 dark:text-yellow-300"
            }`}
          >
            <AlertTriangle
              className={`h-5 w-5 ${
                variant === "destructive" ? "text-red-600" : "text-yellow-600"
              }`}
            />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="confirmation-input" className="text-sm font-medium">
              Type{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                {confirmationText}
              </code>{" "}
              to confirm:
            </label>
            <Input
              id="confirmation-input"
              value={typedText}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={`Type &quot;${confirmationText}&quot;`}
              className={`font-mono ${
                (typedText && !isValid) || error
                  ? "border-red-300 focus:border-red-500"
                  : ""
              }`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isValid && !isConfirming) {
                  handleConfirm();
                }
              }}
              disabled={isConfirming}
              aria-describedby={error ? "confirmation-error" : undefined}
              aria-invalid={
                !!error || (typedText && !isValid) ? "true" : "false"
              }
            />
            {error && (
              <p
                id="confirmation-error"
                className="text-xs text-red-600 dark:text-red-400"
                role="alert"
              >
                {error}
              </p>
            )}
            {typedText && !isValid && !error && (
              <p className="text-xs text-red-600 dark:text-red-400">
                Confirmation text doesn&apos;t match
              </p>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isConfirming}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isValid || isConfirming}
            className={
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                : "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-600"
            }
          >
            {isConfirming ? "Confirming..." : confirmButtonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
