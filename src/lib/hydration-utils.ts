"use client";

import { format as dateFnsFormat } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Hydration-safe utilities to prevent SSR/Client mismatches
 */

/**
 * Format date/time with hydration safety
 * Returns a placeholder during SSR and actual formatted date on client
 */
export function formatDateSafe(
  date: Date | string | number,
  formatStr: string = "dd MMM yyyy",
  options: { locale?: any; placeholder?: string } = {},
) {
  // During SSR, return a placeholder to avoid timezone differences
  if (typeof window === "undefined") {
    return options.placeholder || "...";
  }

  try {
    const dateObj =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;

    return dateFnsFormat(dateObj, formatStr, {
      locale: options.locale || es,
    });
  } catch (error) {
    return options.placeholder || "Invalid date";
  }
}

/**
 * Format time with hydration safety
 */
export function formatTimeSafe(
  date: Date | string | number,
  options: { placeholder?: string } = {},
) {
  return formatDateSafe(date, "HH:mm", { ...options, locale: es });
}

/**
 * Format date and time with hydration safety
 */
export function formatDateTimeSafe(
  date: Date | string | number,
  options: { placeholder?: string } = {},
) {
  return formatDateSafe(date, "dd MMM yyyy HH:mm", { ...options, locale: es });
}

/**
 * Get relative time string with hydration safety
 */
export function getRelativeTimeSafe(
  date: Date | string | number,
  options: { placeholder?: string } = {},
): string {
  if (typeof window === "undefined") {
    return options.placeholder || "...";
  }

  try {
    const dateObj =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;

    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - dateObj.getTime()) / 1000,
    );

    if (diffInSeconds < 60) return "hace un momento";
    if (diffInSeconds < 3600)
      return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400)
      return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800)
      return `hace ${Math.floor(diffInSeconds / 86400)} días`;

    return formatDateSafe(dateObj);
  } catch (error) {
    return options.placeholder || "Invalid date";
  }
}

/**
 * Safe localStorage access
 */
export function getLocalStorageSafe<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Safe localStorage setter
 */
export function setLocalStorageSafe<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Safe sessionStorage access
 */
export function getSessionStorageSafe<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Safe sessionStorage setter
 */
export function setSessionStorageSafe<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Safe window dimensions getter
 */
export function getWindowDimensionsSafe() {
  if (typeof window === "undefined") {
    return { width: 1024, height: 768 }; // Default desktop dimensions
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Safe user agent checker
 */
export function getUserAgentSafe() {
  if (typeof navigator === "undefined") {
    return "";
  }

  return navigator.userAgent || "";
}

/**
 * Check if running on mobile device
 */
export function isMobileSafe() {
  if (typeof window === "undefined") {
    return false; // Default to desktop during SSR
  }

  return (
    window.innerWidth < 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
  );
}

/**
 * Safe document title setter
 */
export function setDocumentTitleSafe(title: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.title = title;
}

/**
 * Safe cookie getter
 */
export function getCookieSafe(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }

  return null;
}

/**
 * Generate stable ID that's consistent between server and client
 */
export function generateStableId(prefix: string, index: number): string {
  return `${prefix}-${index}`;
}

/**
 * Safe random number generator that's stable during hydration
 */
export function getRandomSafe(seed?: number): number {
  // During SSR, return a predictable value
  if (typeof window === "undefined") {
    return seed || 0.5;
  }

  // On client, use actual random
  return Math.random();
}
