"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";

// UI Components
import {
  AdaptiveCard,
  AdaptiveCardContent,
} from "@/components/ui/adaptive-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Icons
import { Edit, Trash2, Eye, Phone, Mail } from "lucide-react";

// Services
import {
  toggleTeamMemberStatus,
  deleteTeamMember,
} from "@/services/actions/team-members";

// Types
import type {
  TeamMember as PrismaTeamMember,
  TeamMemberRole,
} from "@/lib/prisma-compat-types";

// i18n
import { useLanguage } from "@/components/language/LanguageContext";

// Extended type for team member with optional contact info
export interface TeamMember extends Omit<PrismaTeamMember, "role"> {
  email?: string;
  phone?: string;
  role?: TeamMemberRole | string;
}

export type TeamMemberCardVariant = "public" | "admin" | "auto";

export interface TeamMemberCardProps {
  /**
   * Team member data
   */
  member: TeamMember;

  /**
   * Display variant - auto-detects by default
   */
  variant?: TeamMemberCardVariant;

  /**
   * Show admin actions (edit, delete, toggle status)
   */
  showActions?: boolean;

  /**
   * Show contact information
   */
  showContact?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Callback when member is updated
   */
  onUpdate?: () => void;
}

/**
 * Unified Team Member Card Component
 *
 * A flexible, context-aware component for displaying team member information with
 * different presentation modes and interaction capabilities.
 *
 * ## Variants
 * - **Public**: Glass-morphism design, full descriptions, specialties display,
 *   engaging presentation with contact buttons
 * - **Admin**: Compact layout, management actions (edit/delete/toggle status),
 *   status indicators, and administrative controls
 * - **Auto**: Automatically detects context based on current route and user session
 *
 * ## Features
 * - Responsive design with adaptive layouts
 * - Internationalization support (i18n)
 * - Contact information display with direct action buttons
 * - Status management for administrators
 * - Image handling with fallback avatars
 * - Specialties display with customizable badges
 * - Order display for sorting management
 *
 * ## Usage Examples
 * ```tsx
 * // Public display
 * <TeamMemberCard member={member} variant="public" showContact />
 *
 * // Admin management
 * <TeamMemberCard member={member} variant="admin" showActions onUpdate={handleUpdate} />
 *
 * // Auto-detection
 * <TeamMemberCard member={member} variant="auto" />
 * ```
 *
 * @see TeamMemberList for displaying multiple team members
 */
export function TeamMemberCard({
  member,
  variant = "auto",
  showActions,
  showContact = false,
  className,
  onUpdate,
}: TeamMemberCardProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useLanguage();

  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Auto-detect display variant based on current route and user session
   *
   * Rules:
   * - If variant is explicitly set (not 'auto'), use that variant
   * - If user is authenticated and on admin/professor routes, use 'admin' variant
   * - Otherwise, use 'public' variant for anonymous/public access
   */
  const detectedVariant: Exclude<TeamMemberCardVariant, "auto"> =
    variant !== "auto"
      ? variant
      : session &&
          (pathname?.startsWith("/admin") || pathname?.startsWith("/profesor"))
        ? "admin"
        : "public";

  // Auto-determine if actions should be shown
  const shouldShowActions = showActions ?? detectedVariant === "admin";

  /**
   * Process member data for consistent display
   *
   * Ensures the member has a role assigned and properly formats specialties
   * data which may be stored as JSON strings in the database.
   */
  const memberWithRole = {
    ...member,
    role: member.role || t("team.member.role.default", "common"),
  };

  /**
   * Parse and format specialties data
   *
   * Specialties may be stored as JSON strings in the database or as arrays.
   * This ensures consistent array format for rendering.
   */
  const formattedMember = {
    ...memberWithRole,
    specialties:
      typeof member.specialties === "string"
        ? JSON.parse(member.specialties)
        : member.specialties,
  };

  /**
   * Handle toggling team member active status
   *
   * Updates the member's active status in the database and shows appropriate
   * success/error messages. Triggers a page refresh and callback on success.
   *
   * @param id - Team member database ID
   * @param isActive - New active status (true = active, false = inactive)
   */
  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await toggleTeamMemberStatus(id, isActive);
      toast.success(
        isActive
          ? t("team.activate.success", "common")
          : t("team.deactivate.success", "common"),
      );
      onUpdate?.();
      router.refresh();
    } catch {
      toast.error(t("team.status.error", "common"));
    }
  };

  /**
   * Handle deleting a team member
   *
   * Shows a confirmation dialog before deleting the member from the database.
   * Displays loading state during deletion and appropriate success/error messages.
   * Triggers page refresh and callback on successful deletion.
   *
   * @param id - Team member database ID to delete
   */
  const handleDelete = async (id: string) => {
    if (
      typeof window === "undefined" ||
      !window.confirm(t("team.delete.confirm", "common"))
    )
      return;

    setIsDeleting(true);
    try {
      await deleteTeamMember(id);
      toast.success(t("team.delete.success", "common"));
      onUpdate?.();
      router.refresh();
    } catch {
      toast.error(t("team.delete.error", "common"));
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Generate avatar initials from a full name
   *
   * Takes the first character of each word in the name and combines them
   * into uppercase initials for use as avatar fallback text.
   *
   * @param name - Full name of the team member
   * @returns Uppercase initials (e.g., "JD" for "John Doe")
   */
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Render public variant
  if (detectedVariant === "public") {
    return (
      <AdaptiveCard variant="public" hover className={className}>
        <AdaptiveCardContent className="p-6">
          {/* Header with avatar and basic info - perfectly centered */}
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarImage src={member.imageUrl || ""} alt={member.name} />
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-white mb-1 leading-tight">
                {formattedMember.name}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                {formattedMember.title}
              </p>
            </div>
          </div>

          {/* Description - properly spaced and aligned */}
          {formattedMember.description && (
            <div className="mb-6">
              <p className="text-gray-300 leading-relaxed text-sm">
                {formattedMember.description}
              </p>
            </div>
          )}

          {/* Specialties - properly aligned with consistent spacing */}
          {Array.isArray(formattedMember.specialties) &&
            formattedMember.specialties.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {formattedMember.specialties.map((specialty, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-white/10 text-white border-white/20 px-2 py-1"
                    >
                      •{" "}
                      {typeof specialty === "string"
                        ? specialty
                        : String(specialty)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {/* Contact information - centered and properly spaced */}
          {showContact && (formattedMember.email || formattedMember.phone) && (
            <div className="pt-4 border-t border-white/20">
              <div className="flex flex-wrap gap-2 justify-center">
                {formattedMember.email && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 transition-colors"
                    onClick={() =>
                      window.open(`mailto:${formattedMember.email}`)
                    }
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {t("team.contact", "common")}
                  </Button>
                )}
                {formattedMember.phone && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 transition-colors"
                    onClick={() => window.open(`tel:${formattedMember.phone}`)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    {t("team.call", "common")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </AdaptiveCardContent>
      </AdaptiveCard>
    );
  }

  // Render admin variant
  return (
    <AdaptiveCard
      variant={detectedVariant === "admin" ? "auth" : detectedVariant}
      hover
      className={className}
    >
      <AdaptiveCardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarImage
              src={formattedMember.imageUrl || ""}
              alt={formattedMember.name}
            />
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(formattedMember.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold leading-tight">
                  {formattedMember.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formattedMember.title}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                <Badge
                  variant={formattedMember.isActive ? "default" : "secondary"}
                  className={formattedMember.isActive ? "bg-green-500" : ""}
                >
                  {formattedMember.isActive
                    ? t("common.active", "common")
                    : t("common.inactive", "common")}
                </Badge>
              </div>
            </div>

            {/* Specialties - properly aligned */}
            {Array.isArray(formattedMember.specialties) &&
              formattedMember.specialties.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {formattedMember.specialties.map((specialty, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {typeof specialty === "string"
                          ? specialty
                          : String(specialty)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {/* Description - properly aligned */}
            {formattedMember.description && (
              <div className="mb-3">
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {formattedMember.description}
                </p>
              </div>
            )}

            {/* Contact information - better aligned */}
            {(formattedMember.email || formattedMember.phone) && (
              <div className="mb-4">
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  {formattedMember.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{formattedMember.email}</span>
                    </div>
                  )}
                  {formattedMember.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 shrink-0" />
                      <span>{formattedMember.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin actions - better spacing and alignment */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Orden: {formattedMember.order}
                </span>
              </div>

              {shouldShowActions && (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={member.isActive}
                    onCheckedChange={(checked) =>
                      handleToggleStatus(member.id, checked)
                    }
                  />

                  <Link href={`/admin/equipo-multidisciplinario/${member.id}`}>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isDeleting}
                    onClick={() => handleDelete(member.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <Link
                    href="/public/equipo-multidisciplinario"
                    target="_blank"
                  >
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdaptiveCardContent>
    </AdaptiveCard>
  );
}

/**
 * Team Member List Component
 *
 * A container component that renders multiple TeamMemberCard components in
 * a responsive grid layout. Automatically handles empty states and provides
 * consistent spacing and layout across different screen sizes.
 *
 * ## Features
 * - Responsive grid layouts (1-4 columns based on configuration)
 * - Context-aware empty state messages
 * - Consistent spacing and alignment
 * - Automatic variant detection and propagation
 * - Support for all TeamMemberCard props and features
 *
 * ## Grid Configurations
 * - `'auto'`: Responsive grid (1 col mobile, 2 tablet, 3 desktop)
 * - `1-4`: Fixed column counts with responsive breakpoints
 *
 * ## Usage Examples
 * ```tsx
 * // Auto-responsive grid for public display
 * <TeamMemberList members={members} variant="public" showContact />
 *
 * // Fixed 3-column admin grid
 * <TeamMemberList members={members} variant="admin" gridColumns={3} showActions />
 *
 * // Single column layout
 * <TeamMemberList members={members} gridColumns={1} />
 * ```
 *
 * @see TeamMemberCard for individual card documentation
 */
export interface TeamMemberListProps {
  /**
   * Array of team members
   */
  members: TeamMember[];

  /**
   * Display variant for all cards
   */
  variant?: TeamMemberCardVariant;

  /**
   * Show admin actions for all cards
   */
  showActions?: boolean;

  /**
   * Show contact information for all cards
   */
  showContact?: boolean;

  /**
   * Grid configuration
   */
  gridColumns?: "auto" | 1 | 2 | 3 | 4;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Empty state message
   */
  emptyMessage?: string;

  /**
   * Callback when any member is updated
   */
  onUpdate?: () => void;
}

export function TeamMemberList({
  members,
  variant = "auto",
  showActions,
  showContact = false,
  gridColumns = "auto",
  className,
  emptyMessage,
  onUpdate,
}: TeamMemberListProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useLanguage();

  // Auto-detect variant
  const detectedVariant: Exclude<TeamMemberCardVariant, "auto"> =
    variant !== "auto"
      ? variant
      : session &&
          (pathname?.startsWith("/admin") || pathname?.startsWith("/profesor"))
        ? "admin"
        : "public";

  /**
   * Generate responsive grid CSS classes based on configuration
   *
   * Returns Tailwind CSS classes for grid layout with responsive breakpoints.
   * Different configurations for public vs admin variants to optimize spacing.
   *
   * @returns Tailwind CSS grid classes string
   */
  const getGridClasses = () => {
    if (gridColumns === "auto") {
      return detectedVariant === "public"
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        : "grid gap-4";
    }

    const gridMap = {
      1: "grid grid-cols-1 gap-4",
      2: "grid grid-cols-1 md:grid-cols-2 gap-4",
      3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
      4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
    };

    return gridMap[gridColumns];
  };

  /**
   * Handle empty state when no team members are available
   *
   * Displays context-appropriate messages for public vs admin views.
   * Uses different styling variants to match the overall design theme.
   */
  if (members.length === 0) {
    const defaultMessage =
      detectedVariant === "public"
        ? t("team.empty.public", "common")
        : t("team.empty.admin", "common");

    return (
      <AdaptiveCard
        variant={detectedVariant === "admin" ? "auth" : detectedVariant}
      >
        <AdaptiveCardContent className="pt-6">
          <div className="text-center py-8">
            <p
              className={
                detectedVariant === "public"
                  ? "text-gray-300"
                  : "text-muted-foreground"
              }
            >
              {emptyMessage || defaultMessage}
            </p>
          </div>
        </AdaptiveCardContent>
      </AdaptiveCard>
    );
  }

  return (
    <div className={`${getGridClasses()} ${className || ""}`}>
      {members.map((member) => (
        <TeamMemberCard
          key={member.id}
          member={member}
          variant={variant}
          showActions={showActions}
          showContact={showContact}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

export default TeamMemberCard;
