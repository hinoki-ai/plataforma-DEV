// ⚡ Performance: Web Vitals monitoring and performance budgets
import React from "react";
import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from "web-vitals";

// ⚡ Performance: Define performance budgets for Core Web Vitals
export const PERFORMANCE_BUDGETS = {
  // Largest Contentful Paint - measures loading performance
  LCP: {
    good: 2500, // Good: ≤2.5s
    poor: 4000, // Poor: >4.0s
    target: 2000, // Our target: 2.0s
  },
  // Interaction to Next Paint - measures interactivity (replaces FID in v5)
  INP: {
    good: 200, // Good: ≤200ms
    poor: 500, // Poor: >500ms
    target: 100, // Our target: 100ms
  },
  // Cumulative Layout Shift - measures visual stability
  CLS: {
    good: 0.1, // Good: ≤0.1
    poor: 0.25, // Poor: >0.25
    target: 0.05, // Our target: 0.05
  },
  // First Contentful Paint - measures perceived loading speed
  FCP: {
    good: 1800, // Good: ≤1.8s
    poor: 3000, // Poor: >3.0s
    target: 1500, // Our target: 1.5s
  },
  // Time to First Byte - measures server responsiveness
  TTFB: {
    good: 800, // Good: ≤0.8s
    poor: 1800, // Poor: >1.8s
    target: 600, // Our target: 0.6s
  },
} as const;

// ⚡ Performance: Performance threshold levels
export type PerformanceLevel =
  | "excellent"
  | "good"
  | "needs-improvement"
  | "poor";

export function getPerformanceLevel(
  metricName: keyof typeof PERFORMANCE_BUDGETS,
  value: number,
): PerformanceLevel {
  const budget = PERFORMANCE_BUDGETS[metricName];

  if (value <= budget.target) return "excellent";
  if (value <= budget.good) return "good";
  if (value <= budget.poor) return "needs-improvement";
  return "poor";
}

// ⚡ Performance: Web Vitals analytics interface
interface WebVitalsAnalytics {
  metric: Metric;
  level: PerformanceLevel;
  budget: (typeof PERFORMANCE_BUDGETS)[keyof typeof PERFORMANCE_BUDGETS];
  timestamp: number;
  url: string;
  userAgent: string;
}

// ⚡ Performance: Send metrics to analytics endpoint
async function sendToAnalytics(data: WebVitalsAnalytics) {
  try {
    // Send to analytics service (Google Analytics, custom endpoint, etc.)
    if (typeof window !== "undefined" && "gtag" in window) {
      // Google Analytics 4
      (window as any).gtag("event", data.metric.name, {
        event_category: "Web Vitals",
        value: Math.round(data.metric.value),
        metric_id: data.metric.id,
        custom_map: {
          performance_level: data.level,
        },
      });
    }

    // Send to custom analytics endpoint - only if it exists
    // Wrapped in additional try-catch to prevent console errors
    if (process.env.NODE_ENV === "production") {
      try {
        const response = await fetch("/api/analytics/web-vitals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
          // Don't throw on 404 - the endpoint might not exist yet
          signal: AbortSignal.timeout(5000),
        });

        // Silently ignore if endpoint doesn't exist
        if (!response.ok && response.status !== 404) {
          console.warn(`Analytics endpoint returned ${response.status}`);
        }
      } catch (analyticsError) {
        // Silently fail - analytics should never break the app
        // Only log in development
        if ((process.env.NODE_ENV as string) === "development") {
          console.debug("Analytics endpoint not available:", analyticsError);
        }
      }
    }

    // Console logging for development
    if ((process.env.NODE_ENV as string) === "development") {
      console.log("🔥 Web Vitals:", {
        metric: data.metric.name,
        value: data.metric.value,
        level: data.level,
        budget: data.budget,
      });
    }
  } catch (error) {
    // Silently fail - don't pollute console with analytics errors
    if (process.env.NODE_ENV === "development") {
      console.debug("Web Vitals analytics error:", error);
    }
  }
}

// ⚡ Performance: Enhanced metric handler with budget analysis
function handleMetric(metric: Metric) {
  const metricName = metric.name as keyof typeof PERFORMANCE_BUDGETS;

  // Skip if metric not in our budget tracking
  if (!(metricName in PERFORMANCE_BUDGETS)) return;

  const budget = PERFORMANCE_BUDGETS[metricName];
  const level = getPerformanceLevel(metricName, metric.value);

  const analyticsData: WebVitalsAnalytics = {
    metric,
    level,
    budget,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  // Send to analytics
  sendToAnalytics(analyticsData);

  // Show performance alerts in development
  if (process.env.NODE_ENV === "development") {
    showPerformanceAlert(analyticsData);
  }
}

// ⚡ Performance: Development performance alerts
function showPerformanceAlert(data: WebVitalsAnalytics) {
  const { metric, level, budget } = data;

  let alertType = "";
  let message = "";

  switch (level) {
    case "excellent":
      alertType = "🎯";
      message = `${metric.name}: ${metric.value}ms - Excellent! (Target: ≤${budget.target}ms)`;
      break;
    case "good":
      alertType = "✅";
      message = `${metric.name}: ${metric.value}ms - Good (Target: ≤${budget.good}ms)`;
      break;
    case "needs-improvement":
      alertType = "⚠️";
      message = `${metric.name}: ${metric.value}ms - Needs Improvement (Budget: ≤${budget.good}ms)`;
      break;
    case "poor":
      alertType = "🚨";
      message = `${metric.name}: ${metric.value}ms - Poor Performance! (Budget: ≤${budget.good}ms)`;
      break;
  }

  console.log(`${alertType} ${message}`);

  // Show toast notification for poor performance
  if (level === "poor" && typeof window !== "undefined") {
    const event = new CustomEvent("performance-alert", {
      detail: { metric: metric.name, value: metric.value, level },
    });
    window.dispatchEvent(event);
  }
}

// ⚡ Performance: Initialize Web Vitals monitoring
export function initWebVitals() {
  if (typeof window === "undefined") return;

  // Collect and report Core Web Vitals
  onCLS(handleMetric);
  onINP(handleMetric);
  onFCP(handleMetric);
  onLCP(handleMetric);
  onTTFB(handleMetric);
}

// ⚡ Performance: Performance monitoring hook for React components
export function useWebVitals() {
  // Initialize monitoring on component mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      initWebVitals();
    }
  }, []);
}

// ⚡ Performance: Performance budget checker utility
export function checkPerformanceBudgets() {
  return {
    budgets: PERFORMANCE_BUDGETS,
    getLevel: getPerformanceLevel,
    init: initWebVitals,
  };
}

// ⚡ Performance: Export for Next.js _app.tsx integration
export { handleMetric as reportWebVitals };
