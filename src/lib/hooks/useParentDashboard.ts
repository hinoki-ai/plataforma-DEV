import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  parentDashboardAPI,
  type StudentProgress,
  type Communication,
  type AcademicResource,
  type AnalyticsData,
} from "@/lib/api/parent-dashboard";

// Dashboard Overview Hook
export function useDashboardOverview() {
  const { data: session } = useSession();
  const [data, setData] = useState<{
    overallAverage: number;
    attendanceRate: number;
    newMessagesCount: number;
    upcomingEvents: Array<{
      id: string;
      title: string;
      date: string;
      type: string;
    }>;
    recentActivity: Array<{
      id: string;
      type: string;
      title: string;
      date: string;
      description: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      setError(null);
      const overview = await parentDashboardAPI.getDashboardOverview();
      setData(overview);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch dashboard data",
      );
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh };
}

// Student Progress Hook
export function useStudentProgress(studentId?: string) {
  const { data: session } = useSession();
  const [data, setData] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      setError(null);
      const progress = await parentDashboardAPI.getStudentProgress(studentId);
      setData(progress);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch student progress",
      );
    } finally {
      setLoading(false);
    }
  }, [session?.user, studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateProgress = useCallback(
    async (studentId: string, updates: Partial<StudentProgress>) => {
      try {
        const updated = await parentDashboardAPI.updateStudentProgress(
          studentId,
          updates,
        );
        setData((prev) =>
          prev.map((item) =>
            item.id === studentId ? { ...item, ...updated } : item,
          ),
        );
        return updated;
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to update progress",
        );
      }
    },
    [],
  );

  return { data, loading, error, refresh: fetchData, updateProgress };
}

// Communications Hook
export function useCommunications(filters?: {
  priority?: "high" | "medium" | "low";
  isNew?: boolean;
  type?: "announcement" | "message" | "event";
}) {
  const { data: session } = useSession();
  const [data, setData] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      setError(null);
      const communications =
        await parentDashboardAPI.getCommunications(filters);
      setData(communications);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch communications",
      );
    } finally {
      setLoading(false);
    }
  }, [session?.user, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markAsRead = useCallback(async (communicationId: string) => {
    try {
      await parentDashboardAPI.markCommunicationAsRead(communicationId);
      setData((prev) =>
        prev.map((item) =>
          item.id === communicationId ? { ...item, isNew: false } : item,
        ),
      );
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to mark as read",
      );
    }
  }, []);

  const sendReply = useCallback(
    async (communicationId: string, message: string) => {
      try {
        const reply = await parentDashboardAPI.sendReply(
          communicationId,
          message,
        );
        setData((prev) => [...prev, reply]);
        return reply;
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to send reply",
        );
      }
    },
    [],
  );

  const newMessagesCount = useMemo(
    () => data.filter((item) => item.isNew).length,
    [data],
  );

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    markAsRead,
    sendReply,
    newMessagesCount,
  };
}

// Academic Resources Hook
export function useAcademicResources(filters?: {
  subject?: string;
  grade?: string;
  type?: "pdf" | "video" | "link";
}) {
  const { data: session } = useSession();
  const [data, setData] = useState<AcademicResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      setError(null);
      const resources = await parentDashboardAPI.getAcademicResources(filters);
      setData(resources);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch resources",
      );
    } finally {
      setLoading(false);
    }
  }, [session?.user, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const downloadResource = useCallback(async (resourceId: string) => {
    try {
      const { downloadUrl } =
        await parentDashboardAPI.downloadResource(resourceId);
      return downloadUrl;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to download resource",
      );
    }
  }, []);

  return { data, loading, error, refresh: fetchData, downloadResource };
}

// Analytics Hook
export function useAnalytics(period: string, studentId?: string) {
  const { data: session } = useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      setError(null);
      const analytics = await parentDashboardAPI.getAnalyticsData(
        period,
        studentId,
      );
      setData(analytics);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch analytics",
      );
    } finally {
      setLoading(false);
    }
  }, [session?.user, period, studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

// Real-time Updates Hook
export function useRealTimeUpdates() {
  const { data: session } = useSession();
  const [updates, setUpdates] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    let unsubscribe: (() => void) | null = null;

    const setupSubscription = async () => {
      try {
        unsubscribe = await parentDashboardAPI.subscribeToUpdates((data) => {
          setUpdates((prev) => [...prev, { ...data, timestamp: new Date() }]);
        });
        setConnected(true);
      } catch (err) {
        console.error("Failed to setup real-time updates:", err);
        setConnected(false);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [session?.user]);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  return { updates, connected, clearUpdates };
}

// Combined Dashboard Hook
export function useParentDashboard(studentId?: string) {
  const overview = useDashboardOverview();
  const progress = useStudentProgress(studentId);
  const communications = useCommunications();
  const resources = useAcademicResources();
  const analytics = useAnalytics("month", studentId);
  const realTime = useRealTimeUpdates();

  const isLoading =
    overview.loading ||
    progress.loading ||
    communications.loading ||
    resources.loading ||
    analytics.loading;
  const hasError =
    overview.error ||
    progress.error ||
    communications.error ||
    resources.error ||
    analytics.error;

  return {
    overview,
    progress,
    communications,
    resources,
    analytics,
    realTime,
    isLoading,
    hasError,
  };
}
