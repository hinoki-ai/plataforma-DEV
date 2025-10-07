"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Crown,
  Shield,
  GraduationCap,
  Users,
  Eye,
} from "lucide-react";
import { UserRole } from "@/lib/prisma-compat-types";
import { getRoleDisplayName } from "@/lib/role-utils";
import { useLanguage } from "@/components/language/LanguageContext";
import { useRoleSwitching } from "@/hooks/useRoleSwitching";

const VALID_SWITCH_ROLES: UserRole[] = [
  "MASTER",
  "ADMIN",
  "PROFESOR",
  "PARENT",
];

const roleIcons = {
  MASTER: Crown,
  ADMIN: Shield,
  PROFESOR: GraduationCap,
  PARENT: Users,
  PUBLIC: Eye,
};

export function RoleSwitcher({
  isCollapsed = false,
}: {
  isCollapsed?: boolean;
}) {
  const { t } = useLanguage();
  const {
    currentRole,
    hasSwitched,
    originalRole,
    canSwitch,
    isSwitching,
    error,
    switchRole,
    resetToMaster,
    clearError,
  } = useRoleSwitching();

  console.log("🎭 RoleSwitcher Debug:", {
    currentRole,
    canSwitch,
    hasSwitched,
    originalRole,
  });

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Only show for MASTER users
  if (!canSwitch) {
    console.log("🚫 RoleSwitcher hidden - canSwitch is false");
    return null;
  }

  const handleRoleSwitch = async (targetRole: UserRole) => {
    if (targetRole === currentRole) return;

    const result = await switchRole(targetRole);
    if (!result.success && result.error) {
      console.error("❌ Role switch failed:", result.error);
    } else if (result.success) {
      console.log(`✅ Role switched to ${targetRole}`);
    }
  };

  const handleResetToMaster = async () => {
    const result = await resetToMaster();
    if (!result.success && result.error) {
      console.error("❌ Reset to MASTER failed:", result.error);
    }
  };

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-2 px-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              disabled={isSwitching}
            >
              {isSwitching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                React.createElement(roleIcons[currentRole] || Crown, {
                  className: "h-4 w-4",
                })
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs">
              Cambiar Rol
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {VALID_SWITCH_ROLES.map((role) => {
              const Icon = roleIcons[role] || Crown;
              const isActive = role === currentRole;

              return (
                <DropdownMenuItem
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  disabled={isActive || isSwitching}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{getRoleDisplayName(role)}</span>
                  {isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Actual
                    </Badge>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasSwitched && (
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={handleResetToMaster}
            disabled={isSwitching}
            title="Volver a MASTER"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Current Role Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {React.createElement(roleIcons[currentRole] || Crown, {
            className: "h-4 w-4 text-primary",
          })}
          <span className="text-sm font-medium">
            {getRoleDisplayName(currentRole)}
          </span>
          {hasSwitched && (
            <Badge variant="outline" className="text-xs">
              Modo Test
            </Badge>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isSwitching}
              className="h-8 px-2"
            >
              {isSwitching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="text-xs">Cambiar</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs font-medium">
              Cambiar Rol de Prueba
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {VALID_SWITCH_ROLES.map((role) => {
              const Icon = roleIcons[role] || Crown;
              const isActive = role === currentRole;

              return (
                <DropdownMenuItem
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  disabled={isActive || isSwitching}
                  className="flex items-center gap-3"
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {getRoleDisplayName(role)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {role === "MASTER" &&
                        "🏛️ SUPREMO - Control total del sistema"}
                      {role === "ADMIN" && "Gestión administrativa local"}
                      {role === "PROFESOR" && "Funciones docentes"}
                      {role === "PARENT" && "Vista de padres"}
                    </div>
                  </div>
                  {isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Actual
                    </Badge>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Reset to Master Button (only when switched) */}
      {hasSwitched && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetToMaster}
          disabled={isSwitching}
          className="w-full text-xs"
        >
          <Crown className="h-3 w-3 mr-2" />
          Volver a MASTER
        </Button>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded border">
          {error}
        </div>
      )}

      {/* Status Info */}
      <div className="text-xs text-muted-foreground">
        {hasSwitched ? (
          <span>
            Rol original: {getRoleDisplayName(originalRole || "MASTER")}
          </span>
        ) : (
          <span>Modo desarrollador activo</span>
        )}
      </div>
    </div>
  );
}
