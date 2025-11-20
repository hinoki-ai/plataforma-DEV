"use client";

import React, { useState } from "react";
import {
  Menu,
  X,
  Bell,
  Home,
  Users,
  Calendar,
  FileText,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/components/ui/responsive-container";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useSession } from "@/lib/auth-client";
import { getRoleDisplayName } from "@/lib/role-utils";

interface MobileDashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  roles?: string[];
}

const navigationItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    href: "/",
    roles: ["MASTER", "ADMIN", "PROFESOR", "PARENT"],
  },
  {
    id: "users",
    label: "Usuarios",
    icon: Users,
    href: "/admin/usuarios",
    roles: ["MASTER", "ADMIN"],
  },
  {
    id: "meetings",
    label: "Reuniones",
    icon: Calendar,
    href: "/admin/reuniones",
    roles: ["MASTER", "ADMIN"],
  },
  {
    id: "documents",
    label: "Documentos",
    icon: FileText,
    href: "/admin/documentos",
    roles: ["MASTER", "ADMIN"],
  },
  {
    id: "settings",
    label: "Configuración",
    icon: Settings,
    href: "/settings",
    roles: ["MASTER", "ADMIN", "PROFESOR", "PARENT"],
  },
];

export function MobileDashboardLayout({
  children,
  title,
  subtitle,
}: MobileDashboardLayoutProps) {
  const { isMobile } = useResponsive();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");

  const userRole = session?.user?.role;
  const filteredNavItems = navigationItems.filter(
    (item) => !item.roles || item.roles.includes(userRole || ""),
  );

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="mr-2 h-11 w-11"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1">
            <h1 className="text-lg font-semibold truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
          </div>

          <NotificationBell />
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-background border-r shadow-lg">
            <div className="flex h-14 items-center justify-between px-4 border-b">
              <div>
                <h2 className="text-lg font-semibold">Menú</h2>
                {userRole && (
                  <Badge variant="secondary" className="text-xs">
                    {getRoleDisplayName(userRole)}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 px-4 py-4">
              <ul className="space-y-2">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.id;

                  return (
                    <li key={item.id}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start h-12 px-3",
                          isActive && "bg-secondary",
                        )}
                        onClick={() => {
                          setActiveItem(item.id);
                          setSidebarOpen(false);
                          // Navigate to item.href
                          window.location.href = item.href;
                        }}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.label}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* User info at bottom */}
            {session?.user && (
              <div className="border-t p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-medium">
                      {session.user.name?.charAt(0) ||
                        session.user.email?.charAt(0) ||
                        "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {session.user.name || "Usuario"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="pb-20">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t">
        <div className="flex items-center justify-around h-16">
          {filteredNavItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex-1 h-full flex flex-col items-center justify-center space-y-1",
                  isActive && "text-primary",
                )}
                onClick={() => {
                  setActiveItem(item.id);
                  // Navigate to item.href
                  window.location.href = item.href;
                }}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
