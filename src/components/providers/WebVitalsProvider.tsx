// ⚡ Performance: Web Vitals monitoring provider
"use client";

import { useEffect } from "react";
import { initWebVitals } from "@/lib/web-vitals";
import { toast } from "sonner";

export function WebVitalsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Web Vitals monitoring
    initWebVitals();

    // Listen for performance alerts
    const handlePerformanceAlert = (event: CustomEvent) => {
      const { metric, value, level } = event.detail;

      if (level === "poor") {
        toast.warning(`Performance Alert: ${metric}`, {
          description: `${metric} is ${value}ms - consider optimizing this page`,
          duration: 5000,
        });
      }
    };

    window.addEventListener(
      "performance-alert",
      handlePerformanceAlert as EventListener,
    );

    return () => {
      window.removeEventListener(
        "performance-alert",
        handlePerformanceAlert as EventListener,
      );
    };
  }, []);

  return <>{children}</>;
}
