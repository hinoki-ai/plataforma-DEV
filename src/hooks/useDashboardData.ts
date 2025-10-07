import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { UserRole } from "@/lib/prisma-compat-types";

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
    uptime?: string;
    status?: string;
  };
  security?: {
    threats: number;
    blocked: number;
    alerts?: number;
  };
  performance?: {
    responseTime: number;
    throughput: number;
  };
  database?: {
    connections: number;
    queriesPerSec?: number;
    size: string;
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
}

export function useDashboardData() {
  const { data: session } = useSession();
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
            setError("Usuario no autenticado");
            setStats(getMockData(session?.user?.role));
            setLoading(false);
            return;
          }
          // Gracefully handle server errors by falling back to mock data
          console.warn(
            "Dashboard endpoint returned non-OK status:",
            response.status,
          );
          setError(
            `Error del servidor (${response.status}). Mostrando datos simulados.`,
          );
          setStats(getMockData(session?.user?.role));
          setLoading(false);
          return;
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err instanceof Error ? err.message : "Error fetching dashboard data",
        );

        // Fallback to mock data on error
        setStats(getMockData(session?.user?.role));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session?.user?.role]);

  return { stats, loading, error };
}

function getMockData(role: UserRole | undefined): DashboardStats {
  switch (role) {
    case "MASTER":
      return {
        users: { total: 1247, active: 892, newToday: 5 },
        system: { health: 98.5, uptime: "99.98%" },
        security: { threats: 3, blocked: 47 },
        performance: { responseTime: 45, throughput: 15420 },
        database: { connections: 23, size: "2.4GB" },
        api: { requests: 45280, errors: 12 },
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
