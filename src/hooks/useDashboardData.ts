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
      if (!session?.user?.role) return;

      try {
        setLoading(true);
        setError(null);

        let endpoint = "";

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

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          // Handle authentication errors differently from server errors
          if (response.status === 401) {
            console.warn("User not authenticated for dashboard access");
            setError(t("error.unauthorized.title"));
            setStats(getMockData(session?.user?.role));
            setLoading(false);
            return;
          }
          // Gracefully handle server errors by falling back to mock data
          console.warn(
            "Dashboard endpoint returned non-OK status:",
            response.status,
          );
          setError(`${t("error.server_unavailable")} (${response.status}).`);
          setStats(getMockData(session?.user?.role));
          setLoading(false);
          return;
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(t("dashboard.error.loading"));

        // Fallback to mock data on error
        setStats(getMockData(session?.user?.role));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session?.user?.role, t]);

  return { stats, loading, error };
}

function getMockData(role: UserRole | undefined): DashboardStats {
  switch (role) {
    case "MASTER":
      return {
        users: {
          total: 1247,
          active: 892,
          newToday: 5,
          breakdown: { master: 2, admin: 15, profesor: 45, parent: 1185 },
        },
        system: { health: 98.5, uptime: 359928, status: "healthy" },
        security: {
          threats: 3,
          activeThreats: 3,
          blocked: 47,
          blockedAttempts: 47,
          securityScore: "A+",
        },
        performance: {
          responseTime: 45,
          throughput: 15420,
          healthScore: 98.5,
          activeConnections: 23,
        },
        database: {
          connections: 23,
          connectionPoolSize: 10,
          size: "2.4GB",
          status: "connected",
        },
        api: { requests: 45280, errors: 12 },
        content: {
          events: 150,
          documents: 320,
          meetings: 45,
          photos: 1200,
          videos: 50,
          total: 1765,
          117: 0,
        },
      };
    case "ADMIN":
      return {
        users: { total: 145, active: 140 },
        meetings: { total: 20, upcoming: 6 },
        documents: { total: 100, recent: 12 },
        votings: { total: 8, active: 3 },
      };
    case "PROFESOR":
      return {
        plannings: { total: 45, completed: 38 },
        meetings: { total: 15, upcoming: 4 },
        students: { total: 25, active: 24 },
        resources: { total: 30, shared: 12 },
      };
    case "PARENT":
      return {
        children: { total: 2, enrolled: 2 },
        meetings: { total: 6, upcoming: 2 },
        communications: { total: 12, unread: 3 },
        resources: { total: 25, shared: 12, downloaded: 8 },
      };
    default:
      return {};
  }
}
