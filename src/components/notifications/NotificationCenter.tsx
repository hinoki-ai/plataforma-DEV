"use client";

import React, { useState } from "react";
import { Bell, Check, CheckCheck, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

interface NotificationCenterProps {
  className?: string;
}

function NotificationItem({ notification }: { notification: Notification }) {
  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "system":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const getPriorityIcon = (priority: Notification["priority"]) => {
    switch (priority) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🔵";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;

    return date.toLocaleDateString();
  };

  return (
    <div
      className={cn(
        "p-4 border rounded-lg transition-all duration-200",
        getTypeColor(notification.type),
        !notification.read && "ring-2 ring-blue-200",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">
              {getPriorityIcon(notification.priority)}
            </span>
            <h4 className="font-medium text-sm truncate">
              {notification.title}
            </h4>
            {!notification.read && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                Nuevo
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatTime(notification.createdAt)}</span>
            {notification.category && (
              <>
                <span>•</span>
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-0.5 capitalize"
                >
                  {notification.category}
                </Badge>
              </>
            )}
          </div>
        </div>
        {notification.actionUrl && (
          <Button size="sm" variant="outline" className="shrink-0" asChild>
            <a
              href={notification.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={`Abrir enlace de la notificación: ${notification.title}`}
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const { notifications, unreadCount, loading, markAsRead } =
    useNotifications();
  const [showAll, setShowAll] = useState(false);

  const displayedNotifications = showAll
    ? notifications
    : notifications.slice(0, 10);

  const handleMarkAllRead = () => {
    markAsRead("all");
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Centro de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Centro de Notificaciones
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAllRead}
              className="flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como leídas
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {notifications.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No hay notificaciones
            </h3>
            <p className="text-sm text-muted-foreground">
              Las nuevas notificaciones aparecerán aquí
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-96">
              <div className="p-4 space-y-3">
                {displayedNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            </ScrollArea>

            {notifications.length > 10 && (
              <div className="p-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll
                    ? "Mostrar menos"
                    : `Mostrar todas (${notifications.length})`}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
