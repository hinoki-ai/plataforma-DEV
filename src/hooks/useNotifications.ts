import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

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
}

export function useNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

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
        console.error("Error fetching notifications:", err);
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
        console.error("Error marking notifications as read:", err);
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
        console.error("Error creating notification:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create notification";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [],
  );

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
            }
          } catch (err) {
            console.error("Error parsing SSE data:", err);
          }
        };

        es.onopen = () => {
          console.log("SSE connection established");
          reconnectAttempts = 0; // Reset attempts on successful connection
          setEventSource(es);
          setError(null); // Clear any previous errors
        };

        es.onerror = (error) => {
          // Check if the connection is closed (readyState 2 = CLOSED)
          if (es.readyState === EventSource.CLOSED) {
            console.error("SSE connection closed");

            // Only attempt to reconnect if we haven't exceeded max attempts and we're not cleaning up
            if (!isCleaningUp && reconnectAttempts < maxReconnectAttempts) {
              reconnectAttempts++;
              const delay = Math.min(
                1000 * Math.pow(2, reconnectAttempts),
                30000,
              ); // Exponential backoff, max 30s

              console.log(
                `Attempting to reconnect SSE in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`,
              );

              reconnectTimeout = setTimeout(() => {
                if (!isCleaningUp) {
                  createEventSource();
                }
              }, delay);
            } else if (reconnectAttempts >= maxReconnectAttempts) {
              console.log("Max SSE reconnection attempts reached. Giving up.");
              setError(
                "Real-time notifications unavailable. Please refresh the page.",
              );
            }
          } else {
            // Connection is still open (readyState 0 = CONNECTING, 1 = OPEN)
            // This might be a temporary network issue, wait and see
            console.warn("SSE connection error, but connection still open");
          }
        };

        return es;
      } catch (err) {
        console.error("Failed to create EventSource:", err);
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
  };
}
