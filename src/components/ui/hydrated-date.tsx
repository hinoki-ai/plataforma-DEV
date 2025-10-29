"use client";

import { useMemo } from "react";
import { useSyncExternalStore } from "react";
import { format as dateFnsFormat } from "date-fns";
import { es } from "date-fns/locale";

interface HydratedDateProps {
  date: Date | string | number;
  format?: string;
  locale?: any;
  placeholder?: string;
  className?: string;
  relative?: boolean;
}

/**
 * Component for rendering dates that prevents hydration mismatches
 * Shows a placeholder during SSR and the formatted date after hydration
 */
export function HydratedDate({
  date,
  format = "dd MMM yyyy",
  locale = es,
  placeholder = "...",
  className,
  relative = false,
}: HydratedDateProps) {
  const subscribe = (callback: () => void) => {
    if (typeof window === "undefined") {
      return () => {};
    }

    if (typeof queueMicrotask === "function") {
      queueMicrotask(callback);
    } else {
      setTimeout(callback, 0);
    }

    return () => {};
  };

  const getClientSnapshot = () => true;
  const getServerSnapshot = () => false;

  const isHydrated = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const formattedDate = useMemo(() => {
    if (!isHydrated) {
      return placeholder;
    }

    try {
      const dateObj =
        typeof date === "string" || typeof date === "number"
          ? new Date(date)
          : date;

      if (relative) {
        const now = new Date();
        const diffInSeconds = Math.floor(
          (now.getTime() - dateObj.getTime()) / 1000,
        );

        if (diffInSeconds < 60) {
          return "hace un momento";
        } else if (diffInSeconds < 3600) {
          return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
        } else if (diffInSeconds < 86400) {
          return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
        } else if (diffInSeconds < 604800) {
          return `hace ${Math.floor(diffInSeconds / 86400)} días`;
        } else {
          return dateFnsFormat(dateObj, format, { locale });
        }
      } else {
        return dateFnsFormat(dateObj, format, { locale });
      }
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  }, [date, format, locale, relative, isHydrated, placeholder]);

  return (
    <span className={className} suppressHydrationWarning>
      {formattedDate}
    </span>
  );
}

interface HydratedTimeProps {
  date: Date | string | number;
  placeholder?: string;
  className?: string;
}

/**
 * Component for rendering times that prevents hydration mismatches
 */
export function HydratedTime({
  date,
  placeholder = "...",
  className,
}: HydratedTimeProps) {
  return (
    <HydratedDate
      date={date}
      format="HH:mm"
      placeholder={placeholder}
      className={className}
    />
  );
}

interface HydratedDateTimeProps {
  date: Date | string | number;
  placeholder?: string;
  className?: string;
}

/**
 * Component for rendering date and time that prevents hydration mismatches
 */
export function HydratedDateTime({
  date,
  placeholder = "...",
  className,
}: HydratedDateTimeProps) {
  return (
    <HydratedDate
      date={date}
      format="dd MMM yyyy HH:mm"
      placeholder={placeholder}
      className={className}
    />
  );
}

interface HydratedRelativeTimeProps {
  date: Date | string | number;
  placeholder?: string;
  className?: string;
}

/**
 * Component for rendering relative time that prevents hydration mismatches
 */
export function HydratedRelativeTime({
  date,
  placeholder = "...",
  className,
}: HydratedRelativeTimeProps) {
  return (
    <HydratedDate
      date={date}
      relative={true}
      placeholder={placeholder}
      className={className}
    />
  );
}
