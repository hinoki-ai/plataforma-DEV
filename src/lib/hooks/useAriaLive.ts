"use client";

import { useCallback } from "react";

/**
 * Custom hook for announcing content changes to screen readers
 * using ARIA live regions
 */
export function useAriaLive() {
  const announce = useCallback(
    (
      message: string,
      type: "polite" | "assertive" | "notification" = "polite",
    ) => {
      if (typeof window === "undefined") return;

      let region: HTMLElement | null = null;

      switch (type) {
        case "assertive":
          region = document.getElementById("alerts");
          break;
        case "notification":
          region = document.getElementById("notifications");
          break;
        default:
          region = document.getElementById("announcements");
      }

      if (!region) return;

      // Clear previous content
      region.textContent = "";

      // Use setTimeout to ensure screen readers pick up the change
      setTimeout(() => {
        region!.textContent = message;
      }, 100);

      // Clear after announcement
      setTimeout(() => {
        region!.textContent = "";
      }, 1000);
    },
    [],
  );

  return { announce };
}

/**
 * Utility function to announce form submissions
 */
export function announceFormSubmission(formName: string, success: boolean) {
  const message = success
    ? `${formName} guardado exitosamente`
    : `Error al guardar ${formName}`;

  const type = success ? "polite" : "assertive";

  if (typeof window !== "undefined") {
    const region = document.getElementById(
      success ? "announcements" : "alerts",
    );
    if (region) {
      region.textContent = "";
      setTimeout(() => {
        region.textContent = message;
      }, 100);
      setTimeout(() => {
        region.textContent = "";
      }, 2000);
    }
  }
}

/**
 * Utility function to announce page changes
 */
export function announcePageChange(pageTitle: string) {
  const message = `Navegado a: ${pageTitle}`;

  if (typeof window !== "undefined") {
    const region = document.getElementById("announcements");
    if (region) {
      region.textContent = "";
      setTimeout(() => {
        region.textContent = message;
      }, 100);
      setTimeout(() => {
        region.textContent = "";
      }, 1000);
    }
  }
}

/**
 * Utility function to announce dynamic content updates
 */
export function announceDynamicUpdate(contentType: string, action: string) {
  const message = `${contentType} ${action}`;

  if (typeof window !== "undefined") {
    const region = document.getElementById("notifications");
    if (region) {
      region.textContent = "";
      setTimeout(() => {
        region.textContent = message;
      }, 100);
      setTimeout(() => {
        region.textContent = "";
      }, 1500);
    }
  }
}
