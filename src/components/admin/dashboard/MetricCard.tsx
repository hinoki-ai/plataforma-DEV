"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Calendar,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

interface MetricCardProps {
  title: string;
  value: number;
  subtitle?: string;
  change?: {
    value: number;
    label: string;
    trend: "up" | "down" | "neutral";
  };
  icon: React.ReactNode;
  href: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  icon,
  href,
  variant = "default",
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!change) return null;

    switch (change.trend) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-green-600" />;
      case "down":
        return <TrendingDown className="w-3 h-3 text-red-600" />;
      default:
        return null;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20";
      case "warning":
        return "border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20";
      case "danger":
        return "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20";
      default:
        return "";
    }
  };

  return (
    <Link href={href} className="block">
      <Card
        className={`transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer ${getVariantStyles()}`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="text-muted-foreground">{icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {change && (
            <div className="flex items-center mt-2">
              <Badge
                variant={
                  change.trend === "up"
                    ? "default"
                    : change.trend === "down"
                      ? "destructive"
                      : "secondary"
                }
                className="text-xs flex items-center gap-1"
              >
                {getTrendIcon()}
                {change.value > 0 ? "+" : ""}
                {change.value} {change.label}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// Pre-configured metric card variants
export function UserMetricCard({
  total,
  active,
  recent,
}: {
  total: number;
  active: number;
  recent: number;
}) {
  const { t } = useDivineParsing(["common"]);

  return (
    <MetricCard
      title={t("dashboard.metrics.users.total", "dashboard")}
      value={total}
      subtitle={`${active} ${t("dashboard.metrics.users.active", "dashboard")}`}
      change={
        recent > 0
          ? {
              value: recent,
              label: t("dashboard.metrics.users.recent", "dashboard"),
              trend: "up",
            }
          : undefined
      }
      icon={<Users className="w-4 h-4" />}
      href="/admin/usuarios"
      variant="default"
    />
  );
}

export function MeetingMetricCard({
  total,
  upcoming,
  recent,
}: {
  total: number;
  upcoming: number;
  recent: number;
}) {
  const { t } = useDivineParsing(["common"]);

  return (
    <MetricCard
      title={t("dashboard.metrics.meetings.title", "dashboard")}
      value={total}
      subtitle={`${upcoming} ${t("dashboard.metrics.meetings.upcoming", "dashboard")}`}
      change={
        recent > 0
          ? {
              value: recent,
              label: t("dashboard.metrics.meetings.recent", "dashboard"),
              trend: "up",
            }
          : undefined
      }
      icon={<Calendar className="w-4 h-4" />}
      href="/admin/reuniones"
      variant="warning"
    />
  );
}

export function DocumentMetricCard({
  total,
  recent,
}: {
  total: number;
  recent: number;
}) {
  const { t } = useDivineParsing(["common"]);

  return (
    <MetricCard
      title={t("dashboard.metrics.documents.title", "dashboard")}
      value={total}
      subtitle={t("dashboard.metrics.documents.uploaded", "dashboard")}
      change={
        recent > 0
          ? {
              value: recent,
              label: t("dashboard.metrics.documents.recent", "dashboard"),
              trend: "up",
            }
          : undefined
      }
      icon={<FileText className="w-4 h-4" />}
      href="/admin/documentos"
      variant="success"
    />
  );
}

export function TeamMetricCard({
  total,
  active,
}: {
  total: number;
  active: number;
}) {
  const { t } = useDivineParsing(["common"]);

  return (
    <MetricCard
      title={t("dashboard.metrics.team.title", "dashboard")}
      value={total}
      subtitle={`${active} ${t("dashboard.metrics.team.active", "dashboard")}`}
      icon={<Users2 className="w-4 h-4" />}
      href="/admin/equipo-multidisciplinario"
      variant="default"
    />
  );
}
