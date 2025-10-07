import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "IN_PROGRESS"
  | "DRAFT";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig = {
  PENDING: {
    label: "Pendiente",
    variant: "secondary" as const,
    className:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800",
  },
  CONFIRMED: {
    label: "Confirmada",
    variant: "secondary" as const,
    className:
      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800",
  },
  CANCELLED: {
    label: "Cancelada",
    variant: "secondary" as const,
    className:
      "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800",
  },
  COMPLETED: {
    label: "Completada",
    variant: "secondary" as const,
    className:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800",
  },
  IN_PROGRESS: {
    label: "En Progreso",
    variant: "secondary" as const,
    className:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800",
  },
  DRAFT: {
    label: "Borrador",
    variant: "secondary" as const,
    className:
      "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-800",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
