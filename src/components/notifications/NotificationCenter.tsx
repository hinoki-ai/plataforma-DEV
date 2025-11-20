"use client";

import React, { useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  X,
  ExternalLink,
  Settings,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  useNotifications,
  Notification,
  NotificationGroup,
} from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

interface NotificationCenterProps {
  className?: string;
}

function NotificationGroupItem({ group }: { group: NotificationGroup }) {
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
        "p-4 border rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md",
        getTypeColor(group.type),
        group.unreadCount > 0 && "ring-2 ring-blue-200",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{getPriorityIcon(group.priority)}</span>
            <h4 className="font-medium text-sm truncate">{group.title}</h4>
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              {group.count}
            </Badge>
            {group.unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs px-2 py-0.5">
                {group.unreadCount > 99 ? "99+" : group.unreadCount} nuevas
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {group.message}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatTime(group.latestCreatedAt)}</span>
            {group.category && (
              <>
                <span>•</span>
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-0.5 capitalize"
                >
                  {group.category}
                </Badge>
              </>
            )}
          </div>
        </div>
        {group.actionUrl && (
          <Button size="sm" variant="outline" className="shrink-0" asChild>
            <a
              href={group.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={`Abrir enlace del grupo: ${group.title}`}
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

function NotificationItem({ notification }: { notification: Notification }) {
  const { markAsRead } = useNotifications();
  const [isHovered, setIsHovered] = useState(false);

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

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead([notification.id]);
  };

  const handleQuickAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    switch (action) {
      case "view":
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        break;
      case "reply":
        // Could open a reply modal or navigate to relevant page
        if (notification.category === "meeting") {
          // Navigate to meetings page
        }
        break;
    }
  };

  return (
    <div
      className={cn(
        "p-4 border rounded-lg transition-all duration-200 cursor-pointer group",
        getTypeColor(notification.type),
        !notification.read && "ring-2 ring-blue-200",
        "hover:shadow-md hover:scale-[1.02]",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
      }}
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

        {/* Quick Action Buttons */}
        <div
          className={cn(
            "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
            isHovered && "opacity-100",
          )}
        >
          {!notification.read && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-background/80"
              onClick={handleMarkAsRead}
              title="Marcar como leída"
            >
              <Eye className="h-3 w-3" />
            </Button>
          )}

          {notification.category === "meeting" && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-background/80"
              onClick={(e) => handleQuickAction("reply", e)}
              title="Ver reunión"
            >
              <Calendar className="h-3 w-3" />
            </Button>
          )}

          {notification.actionUrl && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-background/80"
              onClick={(e) => handleQuickAction("view", e)}
              title="Ver detalles"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    groupedNotifications,
    contextualNotifications,
    browserNotificationPermission,
    requestBrowserNotificationPermission,
  } = useNotifications();
  const { data: session } = useSession();
  const [showAll, setShowAll] = useState(false);
  const [showGrouped, setShowGrouped] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("notification-sound-enabled") !== "false";
    }
    return true;
  });

  // Combine individual and grouped notifications
  const allNotifications = showGrouped
    ? [
        ...groupedNotifications.map((g: NotificationGroup) => ({
          ...g,
          isGroup: true,
          id: g.key,
        })),
        ...notifications,
      ]
    : notifications;

  const displayedNotifications = showAll
    ? allNotifications
    : allNotifications.slice(0, 10);

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
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowGrouped(!showGrouped)}
              className="text-xs"
            >
              {showGrouped ? "Individuales" : "Agrupadas"}
            </Button>
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
                {displayedNotifications.map((item) =>
                  "isGroup" in item && item.isGroup ? (
                    <NotificationGroupItem
                      key={item.key}
                      group={item as NotificationGroup}
                    />
                  ) : (
                    <NotificationItem
                      key={item.id}
                      notification={item as Notification}
                    />
                  ),
                )}
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

        {/* Preferences Section */}
        <div className="border-t">
          <Button
            variant="ghost"
            className="w-full justify-start p-4 h-auto"
            onClick={() => setShowPreferences(!showPreferences)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Preferencias de Notificaciones
          </Button>

          {showPreferences && (
            <div className="p-4 space-y-4 bg-muted/30">
              {/* Browser Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4" />
                  <div>
                    <Label className="text-sm font-medium">
                      Notificaciones del navegador
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Recibe notificaciones incluso cuando no estés viendo la
                      página
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {browserNotificationPermission === "granted" && (
                    <Badge variant="secondary" className="text-xs">
                      Activadas
                    </Badge>
                  )}
                  {browserNotificationPermission === "denied" && (
                    <Badge variant="destructive" className="text-xs">
                      Bloqueadas
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={requestBrowserNotificationPermission}
                    disabled={browserNotificationPermission === "denied"}
                  >
                    {browserNotificationPermission === "granted"
                      ? "Configurar"
                      : "Activar"}
                  </Button>
                </div>
              </div>

              {/* Sound Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                  <div>
                    <Label className="text-sm font-medium">
                      Sonido de notificaciones
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Reproduce un sonido cuando llegue una notificación
                    </p>
                  </div>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={(checked) => {
                    setSoundEnabled(checked);
                    localStorage.setItem(
                      "notification-sound-enabled",
                      checked.toString(),
                    );
                  }}
                />
              </div>

              {/* Notification Categories */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Categorías activas
                </Label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Académicas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Reuniones</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span>Sistema</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span>Administrativas</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
