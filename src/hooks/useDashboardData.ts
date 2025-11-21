import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { UserRole } from "@/lib/prisma-compat-types";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

interface DashboardStats {
  users?: {
    total: number;
    active: number;
    admins?: number;
    profesores?: number;
    parents?: number;
    recent?: number;
    newToday?: number;
    byRole?: Record<string, number>;
    recentUsers?: any[];
    breakdown?: {
      master: number;
      admin: number;
      profesor: number;
      parent: number;
    };
  };
  meetings?: {
    total: number;
    upcoming: number;
    recent?: number;
    scheduled?: number;
  };
  documents?: {
    total: number;
    recent: number;
  };
  team?: {
    total: number;
    active: number;
  };
  calendar?: {
    upcomingEvents: any[];
  };
  planning?: {
    recent: number;
  };
  plannings?: {
    total: number;
    completed: number;
  };
  students?: {
    total: number;
    active: number;
  };
  resources?: {
    total: number;
    shared: number;
    downloaded?: number;
  };
  children?: {
    total: number;
    enrolled: number;
  };
  communications?: {
    total: number;
    unread: number;
  };
  votings?: {
    total: number;
    active: number;
  };
  system?: {
    health?: number;
    uptime?: string | number;
    status?: string;
    memory?: any;
    nodeVersion?: string;
    environment?: string;
  };
  security?: {
    threats: number;
    activeThreats?: number;
    blocked: number;
    blockedAttempts?: number;
    alerts?: number;
    securityScore?: string;
    lastSecurityScan?: string;
  };
  performance?: {
    responseTime: number;
    throughput: number;
    healthScore?: number;
    activeConnections?: number;
    avgResponseTime?: number;
  };
  database?: {
    connections: number;
    connectionPoolSize?: number;
    queriesPerSec?: number;
    size: string;
    status?: string;
    queryPerformance?: string;
    lastBackup?: string;
  };
  api?: {
    requests: number;
    errors: number;
  };
  activities?: {
    events?: { total: number; upcoming: number };
    meetings?: { total: number; scheduled: number };
    logs?: { total: number; recent: number; critical: number };
  };
  content?: {
    events: number;
    documents: number;
    meetings: number;
    photos: number;
    videos: number;
    total: number;
    117: number;
  };
  errors?: {
    totalErrors: number;
    criticalErrors: number;
    recentErrors: number;
  };
}

export function useDashboardData() {
  const { data: session } = useSession();
  const { t } = useDivineParsing(["common", "dashboard"]);
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // DEV MODE: Allow fetching even without session for localhost
      const isDev =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");

      if (!isDev && !session?.user?.role) return;

      try {
        setLoading(true);
        setError(null);

        let endpoint = "";

        // DEV MODE: Default to master dashboard
        if (isDev) {
          endpoint = "/api/master/dashboard";
        } else {
          switch (session.user.role) {
            case "MASTER":
              endpoint = "/api/master/dashboard";
              break;
            case "ADMIN":
              endpoint = "/api/admin/dashboard";
              break;
            case "PROFESOR":
              endpoint = "/api/profesor/dashboard";
              break;
            case "PARENT":
              endpoint = "/api/parent/dashboard/overview";
              break;
            default:
              // For public users or other roles, use mock data
              setStats({});
              setLoading(false);
              return;
          }
        }

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          // Handle authentication errors
          if (response.status === 401) {
            setError(t("error.unauthorized.title"));
            setStats({});
            setLoading(false);
            return;
          }
          // For server errors, show error state instead of mock data
          setError(`${t("error.server_unavailable")} (${response.status}).`);
          setStats({});
          setLoading(false);
          return;
        }

        const data = await response.json();
        // Extract the actual data from the API response wrapper
        setStats(data.success ? data.data : {});
      } catch (err) {
        setError(t("dashboard.error.loading"));
        setStats({});
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session?.user?.role, t]);

  return { stats, loading, error };
}
