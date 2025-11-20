"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, Activity, RefreshCw } from "lucide-react";

interface SessionData {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  startTime: string;
  lastActivity: string;
  duration: number;
  pageViews: number;
  actions: string[];
}

export function SessionAnalytics() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeUsers: 0,
    averageDuration: 0,
    totalPageViews: 0,
  });

  useEffect(() => {
    loadSessionData();
  }, []);

  const loadSessionData = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll show placeholder data
      const mockSessions: SessionData[] = [
        {
          id: "1",
          userId: "user-1",
          userName: "Admin User",
          userRole: "ADMIN",
          startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          lastActivity: new Date().toISOString(),
          duration: 30 * 60, // 30 minutes in seconds
          pageViews: 15,
          actions: ["login", "view-dashboard", "create-user", "logout"],
        },
        {
          id: "2",
          userId: "user-2",
          userName: "Teacher User",
          userRole: "PROFESOR",
          startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          duration: 15 * 60,
          pageViews: 8,
          actions: ["login", "view-calendar", "update-activity"],
        },
      ];

      setSessions(mockSessions);
      setStats({
        totalSessions: mockSessions.length,
        activeUsers: mockSessions.length,
        averageDuration:
          mockSessions.reduce((acc, s) => acc + s.duration, 0) /
          mockSessions.length,
        totalPageViews: mockSessions.reduce((acc, s) => acc + s.pageViews, 0),
      });
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {formatDuration(stats.averageDuration)}
                </p>
                <p className="text-xs text-muted-foreground">Avg Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalPageViews}</p>
                <p className="text-xs text-muted-foreground">Page Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Sessions
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSessionData}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active sessions</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{session.userName}</span>
                      <Badge variant="outline">{session.userRole}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Started: {new Date(session.startTime).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last Activity:{" "}
                      {new Date(session.lastActivity).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">
                        {formatDuration(session.duration)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {session.pageViews} page views
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {session.actions.length} actions
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
