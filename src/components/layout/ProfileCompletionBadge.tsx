"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language/LanguageContext";
import type { SessionUser } from "@/lib/auth-client";
import type { UserRole } from "@/lib/prisma-compat-types";

// Extended user type with additional fields from our database
interface ExtendedUser extends Omit<SessionUser, "role"> {
  role: UserRole;
  isActive?: boolean;
  emailVerified?: Date;
}

interface ProfileCompletionBadgeProps {
  className?: string;
  compact?: boolean;
}

export function ProfileCompletionBadge({
  className,
  compact = false,
}: ProfileCompletionBadgeProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();

  // Don't show during loading or for unauthenticated users
  if (status === "loading" || !session?.user) {
    return null;
  }

  // Check if profile is complete
  const isProfileComplete = checkProfileCompletion({
    ...(session.user as SessionUser),
    role: session.user.role as UserRole,
  } as ExtendedUser);

  // Don't show if profile is already complete
  if (isProfileComplete) {
    return null;
  }

  const handleClick = () => {
    router.push("/settings");
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClick}
              className={cn(
                "h-8 px-2 text-xs border border-orange-300 bg-linear-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 text-orange-800 dark:border-orange-700 dark:from-orange-950/30 dark:to-yellow-950/30 dark:hover:from-orange-900/50 dark:hover:to-yellow-900/50 dark:text-orange-200 transition-all duration-300 hover:shadow-md hover:scale-105",
                "animate-pulse hover:animate-none",
                className,
              )}
            ></Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">
              {t("wizard.profile_completion.description", "common")}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "cursor-pointer border-orange-300 bg-linear-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 text-orange-800 dark:border-orange-700 dark:from-orange-950/30 dark:to-yellow-950/30 dark:hover:from-orange-900/50 dark:hover:to-yellow-900/50 dark:text-orange-200 transition-all duration-300 hover:shadow-lg hover:scale-105",
              "animate-pulse hover:animate-none",
              className,
            )}
            onClick={handleClick}
          >
            <div className="h-3 w-3 mr-1 animate-pulse rounded-full bg-yellow-400" />
            <span className="text-xs font-semibold">
              {t("settings.profile.title", "common")}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            {t("wizard.profile_completion.description", "common")}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Helper function to check profile completion status
function checkProfileCompletion(user: ExtendedUser): boolean {
  if (!user) return false;

  // Required fields for profile completion
  const requiredFields = [
    user.name, // User's display name
    user.email, // Email address
  ];

  // Check if all required fields are present and not empty
  const hasRequiredFields = requiredFields.every((field) => {
    if (field === null || field === undefined) return false;
    if (typeof field === "string") return field.trim().length > 0;
    return true;
  });

  // For now, we only require name and email
  // In the future, we could make this stricter by requiring:
  // - user.phone (phone number)
  // - user.image (profile picture)
  // - user.emailVerified (email verification)

  return hasRequiredFields;
}

export default ProfileCompletionBadge;
