"use client";

import React, { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBadge } from "@/components/ui/notification-badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUnreadNotifications } from "@/hooks/use-unread-notifications";
import { NotificationCenter } from "./NotificationCenter";

export function NotificationBell() {
  const { unreadCount } = useUnreadNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 rounded-full"
            aria-label={
              unreadCount > 0
                ? `Notificaciones: ${unreadCount} sin leer`
                : "Notificaciones: sin notificaciones nuevas"
            }
          >
            <Bell className="h-4 w-4" />
          </Button>
          <NotificationBadge show={unreadCount > 0} position="top-right" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end" sideOffset={8}>
        <NotificationCenter />
      </PopoverContent>
    </Popover>
  );
}
