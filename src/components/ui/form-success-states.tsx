import React from "react";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormSuccessStatesProps {
  type: "success" | "warning" | "loading";
  title: string;
  description?: string;
  className?: string;
}

export function FormSuccessStates({
  type,
  title,
  description,
  className,
}: FormSuccessStatesProps) {
  const states = {
    success: {
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    warning: {
      icon: AlertCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    loading: {
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
  };

  const current = states[type];
  const Icon = current.icon;

  return (
    <div
      className={cn(
        "flex items-start space-x-3 rounded-lg border p-4",
        current.bgColor,
        current.borderColor,
        className,
      )}
    >
      <Icon className={cn("h-5 w-5 mt-0.5", current.color)} />
      <div className="flex-1">
        <h4 className={cn("text-sm font-medium", current.color)}>{title}</h4>
        {description && (
          <p
            className={cn(
              "text-sm mt-1",
              current.color.replace("text-", "text-").replace("-600", "-500"),
            )}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default FormSuccessStates;

export function useFormFieldStates() {
  return {
    isLoading: false,
    error: null,
    success: null,
    setFieldValid: () => {},
    setFieldInvalid: () => {},
    setFieldDirty: () => {},
    clearAllStates: () => {},
  };
}

export function EnhancedInput({ fieldName, validation, ...props }: any) {
  return <input {...props} className="border rounded-md px-3 py-2" />;
}

export function SuccessAnimation({
  show,
  message,
}: {
  show: boolean;
  message: string;
}) {
  if (!show) return null;
  return <div className="text-green-600">{message}</div>;
}
