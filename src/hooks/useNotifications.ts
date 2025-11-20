import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSession } from "@/lib/auth-client";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "system";
  category?:
    | "meeting"
    | "voting"
    | "system"
    | "academic"
    | "administrative"
    | "personal";
  priority: "low" | "medium" | "high";
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  expiresAt?: string;
  createdAt: string;
  senderId?: string;
  recipientId?: string;
  groupKey?: string; // For intelligent grouping
  groupCount?: number; // Number of similar notifications
  isGroup?: boolean; // Whether this is a grouped notification
  groupNotifications?: Notification[]; // Individual notifications in group
}

export interface NotificationGroup {
  key: string;
  title: string;
  message: string;
  type: Notification["type"];
  category?: Notification["category"];
  priority: Notification["priority"];
  count: number;
  unreadCount: number;
  latestCreatedAt: string;
  notifications: Notification[];
  actionUrl?: string;
}

export function useNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [browserNotificationPermission, setBrowserNotificationPermission] =
    useState<NotificationPermission>("default");
  const lastNotificationTime = useRef<number>(0);
  const lastSoundTime = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(
    async (status: "all" | "unread" | "read" = "all") => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        setError(null); // Clear any previous errors

        const response = await fetch(
          `/api/notifications?status=${status}&limit=50`,
        );

        if (!response.ok) {
          if (response.status === 401) {
            setError("Authentication required");
            return;
          } else if (response.status === 500) {
            setError("Server error - notifications temporarily unavailable");
            // Set empty notifications as fallback
            setNotifications([]);
            setUnreadCount(0);
            return;
          }
          throw new Error(`Failed to fetch notifications: ${response.status}`);
        }

        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(
          data.notifications?.filter((n: Notification) => !n.read).length || 0,
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch notifications",
        );
        // Set fallback empty state
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        setLoading(false);
      }
    },
    [session?.user?.id],
  );

  // Mark notifications as read
  const markAsRead = useCallback(
    async (notificationIds: string[] | "all") => {
      try {
        const response = await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notificationIds:
              notificationIds === "all" ? undefined : notificationIds,
            markAll: notificationIds === "all",
          }),
        });

        if (!response.ok) {
          if (response.status === 500) {
            setError("Server error - unable to mark notifications as read");
            return;
          }
          throw new Error("Failed to mark notifications as read");
        }

        // Update local state optimistically
        setNotifications((prev) =>
          prev.map((notification) =>
            notificationIds === "all" ||
            notificationIds.includes(notification.id)
              ? {
                  ...notification,
                  read: true,
                  readAt: new Date().toISOString(),
                }
              : notification,
          ),
        );

        // Recalculate unread count
        setUnreadCount((prev) =>
          notificationIds === "all"
            ? 0
            : prev -
              notifications.filter(
                (n) => !n.read && notificationIds.includes(n.id),
              ).length,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to mark notifications as read",
        );
      }
    },
    [notifications],
  );

  // Create a new notification (for admins/profesors)
  const createNotification = useCallback(
    async (notificationData: {
      title: string;
      message: string;
      type: Notification["type"];
      category?: Notification["category"];
      recipientIds?: string[];
      isBroadcast?: boolean;
      priority?: Notification["priority"];
      actionUrl?: string;
      expiresAt?: string;
    }) => {
      try {
        const response = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(notificationData),
        });

        if (!response.ok) {
          if (response.status === 500) {
            throw new Error("Server error - unable to create notification");
          }
          throw new Error("Failed to create notification");
        }

        const result = await response.json();
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create notification";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [],
  );

  // Intelligent grouping logic
  const groupNotifications = useCallback(
    (notifications: Notification[]): NotificationGroup[] => {
      const groups = new Map<string, Notification[]>();

      notifications.forEach((notification) => {
        // Create group key based on category, type, and content similarity
        let groupKey = `${notification.category || "general"}_${notification.type}`;

        // For academic notifications, group by subject/class if possible
        if (notification.category === "academic" && notification.title) {
          const subjectMatch = notification.title.match(
            /(?:de|en|para)\s+(.+?)(?:\s|$)/i,
          );
          if (subjectMatch) {
            groupKey += `_${subjectMatch[1].toLowerCase().trim()}`;
          }
        }

        // For meeting notifications, group by meeting type
        if (notification.category === "meeting") {
          groupKey += `_${notification.title.toLowerCase().replace(/\s+/g, "_")}`;
        }

        if (!groups.has(groupKey)) {
          groups.set(groupKey, []);
        }
        groups.get(groupKey)!.push(notification);
      });

      return Array.from(groups.entries())
        .filter(([, notifications]) => notifications.length > 1) // Only group if 2+ notifications
        .map(([key, groupNotifications]) => {
          const sorted = groupNotifications.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          const unreadCount = sorted.filter((n) => !n.read).length;
          const latest = sorted[0];

          return {
            key,
            title: generateGroupTitle(sorted),
            message: generateGroupMessage(sorted),
            type: latest.type,
            category: latest.category,
            priority: latest.priority,
            count: sorted.length,
            unreadCount,
            latestCreatedAt: latest.createdAt,
            notifications: sorted,
            actionUrl: latest.actionUrl,
          };
        })
        .sort(
          (a, b) =>
            new Date(b.latestCreatedAt).getTime() -
            new Date(a.latestCreatedAt).getTime(),
        );
    },
    [],
  );

  // Generate intelligent group titles
  const generateGroupTitle = (notifications: Notification[]): string => {
    const first = notifications[0];
    const count = notifications.length;

    if (first.category === "academic") {
      return `${count} notificaciones académicas`;
    }
    if (first.category === "meeting") {
      return `${count} notificaciones de reuniones`;
    }
    if (first.category === "administrative") {
      return `${count} notificaciones administrativas`;
    }
    return `${count} notificaciones ${first.category || "generales"}`;
  };

  // Generate intelligent group messages
  const generateGroupMessage = (notifications: Notification[]): string => {
    const count = notifications.length;
    const first = notifications[0];

    if (first.category === "academic") {
      return `Tienes ${count} actualizaciones académicas pendientes`;
    }
    if (first.category === "meeting") {
      return `Hay ${count} actualizaciones relacionadas con reuniones`;
    }
    return `Múltiples notificaciones similares (${count} en total)`;
  };

  // Context-aware notifications based on current page
  const getContextualNotifications = useCallback(
    (pathname?: string) => {
      if (!pathname || !notifications.length) return notifications;

      let relevantNotifications = notifications;

      // Filter notifications based on current page context
      if (pathname.includes("/profesor")) {
        relevantNotifications = notifications.filter(
          (n) =>
            n.category === "academic" ||
            n.category === "meeting" ||
            n.category === "administrative",
        );
      } else if (pathname.includes("/parent")) {
        relevantNotifications = notifications.filter(
          (n) =>
            n.category === "academic" ||
            n.category === "meeting" ||
            n.category === "personal",
        );
      } else if (pathname.includes("/admin")) {
        relevantNotifications = notifications.filter(
          (n) =>
            n.category === "administrative" ||
            n.category === "system" ||
            n.category === "meeting",
        );
      }

      return relevantNotifications;
    },
    [notifications],
  );

  // Get grouped notifications with context awareness
  const groupedNotifications = useMemo(() => {
    return groupNotifications(notifications);
  }, [notifications, groupNotifications]);

  // Get contextual notifications
  const contextualNotifications = useMemo(() => {
    return getContextualNotifications();
  }, [notifications, getContextualNotifications]);

  // Browser notification functions
  const requestBrowserNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notifications");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setBrowserNotificationPermission(permission);
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, []);

  const showBrowserNotification = useCallback(
    (notification: Notification) => {
      if (browserNotificationPermission !== "granted" || document.hasFocus()) {
        return; // Don't show if permission not granted or page is focused
      }

      // Throttle notifications (max 1 per 30 seconds)
      const now = Date.now();
      if (now - lastNotificationTime.current < 30000) {
        return;
      }
      lastNotificationTime.current = now;

      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: "/favicon-32x32.png",
          badge: "/favicon-32x32.png",
          tag: `notification-${notification.id}`,
          requireInteraction: notification.priority === "high",
          silent: false,
        });

        // Auto-close after 5 seconds for non-high priority notifications
        if (notification.priority !== "high") {
          setTimeout(() => {
            browserNotification.close();
          }, 5000);
        }

        // Handle click to focus window and navigate
        browserNotification.onclick = () => {
          window.focus();
          if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
          }
          browserNotification.close();
        };
      } catch (error) {
        console.error("Error showing browser notification:", error);
      }
    },
    [browserNotificationPermission],
  );

  // Initialize browser notifications
  useEffect(() => {
    if ("Notification" in window) {
      setBrowserNotificationPermission(Notification.permission);
    }
  }, []);

  // Set up Server-Sent Events for real-time notifications
  useEffect(() => {
    if (!session?.user?.id) {
      // Clean up any existing connection if session is lost
      if (eventSourceRef.current) {
        try {
          eventSourceRef.current.close();
        } catch (err) {
          // EventSource might already be closed
        }
        eventSourceRef.current = null;
        setEventSource(null);
      }
      return;
    }

    let reconnectTimeout: NodeJS.Timeout | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    let isCleaningUp = false;

    const createEventSource = () => {
      // Clean up previous connection if it exists
      if (eventSourceRef.current) {
        try {
          eventSourceRef.current.close();
        } catch (err) {
          // EventSource might already be closed
        }
        eventSourceRef.current = null;
      }

      // Don't create new connection if we're cleaning up
      if (isCleaningUp) {
        return null;
      }

      try {
        // Create EventSource for real-time updates
        const es = new EventSource("/api/notifications/stream");
        eventSourceRef.current = es;

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            // Ignore heartbeat messages
            if (data.type === "heartbeat") {
              return;
            }

            if (data.type === "notification") {
              // Add new notification to the list
              const newNotification: Notification = {
                id: data.id,
                title: data.title,
                message: data.message,
                type: data.type,
                category: data.category,
                priority: data.priority,
                read: false,
                actionUrl: data.actionUrl,
                createdAt: data.timestamp,
              };

              setNotifications((prev) => [newNotification, ...prev]);
              setUnreadCount((prev) => prev + 1);

              // Show browser notification for high priority or if user has enabled it
              if (
                newNotification.priority === "high" ||
                newNotification.category === "system"
              ) {
                showBrowserNotification(newNotification);
              }
            }

            if (data.type === "dashboard_update") {
              // Update dashboard data for real-time updates
              setDashboardData(data.data);
            }
          } catch (err) {}
        };

        es.onopen = () => {
          reconnectAttempts = 0; // Reset attempts on successful connection
          setEventSource(es);
          setError(null); // Clear any previous errors

          // For master users, send initial dashboard data
          if (session?.user?.role === "MASTER") {
          }
        };

        es.onerror = (error) => {
          // Check if the connection is closed (readyState 2 = CLOSED)
          if (es.readyState === EventSource.CLOSED) {
            // Only attempt to reconnect if we haven't exceeded max attempts and we're not cleaning up
            if (!isCleaningUp && reconnectAttempts < maxReconnectAttempts) {
              reconnectAttempts++;
              const delay = Math.min(
                1000 * Math.pow(2, reconnectAttempts),
                30000,
              ); // Exponential backoff, max 30s

              reconnectTimeout = setTimeout(() => {
                if (!isCleaningUp) {
                  createEventSource();
                }
              }, delay);
            } else if (reconnectAttempts >= maxReconnectAttempts) {
              setError(
                "Real-time notifications unavailable. Please refresh the page.",
              );
            }
          } else {
            // Connection is still open (readyState 0 = CONNECTING, 1 = OPEN)
            // This might be a temporary network issue, wait and see
          }
        };

        return es;
      } catch (err) {
        setError("Failed to establish real-time connection");
        return null;
      }
    };

    const es = createEventSource();

    return () => {
      isCleaningUp = true;

      // Clear any pending reconnection
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }

      // Close current EventSource
      if (eventSourceRef.current) {
        try {
          eventSourceRef.current.close();
        } catch (err) {
          // EventSource might already be closed
        }
        eventSourceRef.current = null;
        setEventSource(null);
      }
    };
  }, [session?.user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications("all");
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    createNotification,
    dashboardData,
    groupedNotifications,
    contextualNotifications,
    groupNotifications,
    getContextualNotifications,
    browserNotificationPermission,
    requestBrowserNotificationPermission,
    showBrowserNotification,
  };
}
