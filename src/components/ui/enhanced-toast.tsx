import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

interface EnhancedToastProps {
  title?: string;
  description?: string;
  type?: "success" | "error" | "warning" | "info";
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  duration?: number;
  className?: string;
}

export function EnhancedToast({
  title,
  description,
  type = "info",
  action,
  onClose,
  className,
}: EnhancedToastProps) {
  const { t } = useDivineParsing(["common"]);

  const typeStyles = {
    success: "border-green-500/50 bg-green-50 text-green-900",
    error: "border-red-500/50 bg-red-50 text-red-900",
    warning: "border-yellow-500/50 bg-yellow-50 text-yellow-900",
    info: "border-blue-500/50 bg-blue-50 text-blue-900",
  };

  return (
    <div className={cn("fixed top-4 right-4 z-50 max-w-sm", className)}>
      <Alert className={cn(typeStyles[type], "shadow-lg")}>
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && <AlertDescription>{description}</AlertDescription>}

        {(action || onClose) && (
          <div className="flex gap-2 mt-2">
            {action && (
              <Button
                variant="outline"
                size="sm"
                onClick={action.onClick}
                className="text-xs"
              >
                {action.label}
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-xs"
              >
                {t("toast.close")}
              </Button>
            )}
          </div>
        )}
      </Alert>
    </div>
  );
}

export default EnhancedToast;

export function enhancedToast(type: string, message: string) {
  console.log(`Toast: ${type} - ${message}`);
}
