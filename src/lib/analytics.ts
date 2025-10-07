/**
 * Basic usage analytics for $1K sale product
 * Lightweight tracking without external services
 */

import { useState, useEffect } from "react";

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: Set<string>;
  actions: {
    login: number;
    reservation: number;
    upload: number;
    meeting: number;
  };
  lastReset: string;
}

class SimpleAnalytics {
  private data: AnalyticsData;
  private storageKey = "manitos-analytics";

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): AnalyticsData {
    if (typeof window === "undefined") {
      return {
        pageViews: 0,
        uniqueVisitors: new Set(),
        actions: { login: 0, reservation: 0, upload: 0, meeting: 0 },
        lastReset: new Date().toISOString(),
      };
    }

    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        uniqueVisitors: new Set(parsed.uniqueVisitors),
      };
    }

    return {
      pageViews: 0,
      uniqueVisitors: new Set(),
      actions: { login: 0, reservation: 0, upload: 0, meeting: 0 },
      lastReset: new Date().toISOString(),
    };
  }

  private saveData() {
    if (typeof window === "undefined") return;

    localStorage.setItem(
      this.storageKey,
      JSON.stringify({
        ...this.data,
        uniqueVisitors: Array.from(this.data.uniqueVisitors),
      }),
    );
  }

  /**
   * Track page view
   */
  trackPageView(visitorId?: string) {
    this.data.pageViews++;
    if (visitorId) {
      this.data.uniqueVisitors.add(visitorId);
    }
    this.saveData();
  }

  /**
   * Track user action
   */
  trackAction(action: keyof AnalyticsData["actions"]) {
    this.data.actions[action]++;
    this.saveData();
  }

  /**
   * Get analytics summary
   */
  getSummary() {
    return {
      totalPageViews: this.data.pageViews,
      uniqueVisitors: this.data.uniqueVisitors.size,
      totalActions: Object.values(this.data.actions).reduce((a, b) => a + b, 0),
      actions: this.data.actions,
      lastReset: this.data.lastReset,
    };
  }

  /**
   * Reset analytics
   */
  reset() {
    this.data = {
      pageViews: 0,
      uniqueVisitors: new Set(),
      actions: { login: 0, reservation: 0, upload: 0, meeting: 0 },
      lastReset: new Date().toISOString(),
    };
    this.saveData();
  }

  /**
   * Export analytics data
   */
  exportData() {
    return {
      ...this.getSummary(),
      dailyStats: this.getDailyStats(),
    };
  }

  /**
   * Generate daily stats (mock for demo)
   */
  private getDailyStats() {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return {
        date: date.toLocaleDateString("es-CL"),
        pageViews: Math.floor(Math.random() * 50) + 10,
        actions: {
          login: Math.floor(Math.random() * 10) + 1,
          reservation: Math.floor(Math.random() * 5) + 1,
          upload: Math.floor(Math.random() * 3) + 1,
          meeting: Math.floor(Math.random() * 2) + 1,
        },
      };
    }).reverse();

    return days;
  }
}

// Global instance
export const analytics = new SimpleAnalytics();

/**
 * React hook for analytics
 */
export function useAnalytics() {
  const trackPageView = (visitorId?: string) => {
    analytics.trackPageView(visitorId);
  };

  const trackAction = (action: keyof AnalyticsData["actions"]) => {
    analytics.trackAction(action);
  };

  const getSummary = () => analytics.getSummary();

  return { trackPageView, trackAction, getSummary };
}

/**
 * Analytics dashboard component
 */
export function AnalyticsDashboard() {
  const [summary, setSummary] = useState(analytics.getSummary());

  useEffect(() => {
    const interval = setInterval(() => {
      setSummary(analytics.getSummary());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    summary,
    reset: () => analytics.reset(),
    export: () => analytics.exportData(),
  };
}

/**
 * Track specific events
 */
export const analyticsEvents = {
  trackLogin: () => analytics.trackAction("login"),
  trackReservation: () => analytics.trackAction("reservation"),
  trackUpload: () => analytics.trackAction("upload"),
  trackMeeting: () => analytics.trackAction("meeting"),
  trackPageView: (visitorId?: string) => analytics.trackPageView(visitorId),
};

/**
 * Analytics API endpoints (server-side tracking)
 */
export const analyticsAPI = {
  getStats: () => analytics.getSummary(),
  reset: () => analytics.reset(),
  export: () => analytics.exportData(),
};
