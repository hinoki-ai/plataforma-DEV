'use client';

import type { TeamMember } from '@prisma/client';
import { TeamMemberList as UnifiedTeamMemberList } from '@/components/team/TeamMemberCard';
import { useRouter } from 'next/navigation';

interface TeamMemberListProps {
  teamMembers: TeamMember[];
}

/**
 * Admin Team Member List Component
 *
 * Administrative interface for managing team members using the unified
 * TeamMemberCard component. Provides admin-specific features like editing,
 * deleting, and status management with automatic page refresh on updates.
 *
 * ## Features
 * - Single-column layout optimized for admin tasks
 * - Full admin actions (edit, delete, status toggle)
 * - Automatic page refresh after member updates
 * - Integration with Next.js router for navigation
 *
 * ## Usage
 * ```tsx
 * <TeamMemberList teamMembers={members} />
 * ```
 *
 * @see TeamMemberList (unified) for the underlying component
 * @see TeamMemberCard for individual card documentation
 */
export function TeamMemberList({ teamMembers }: TeamMemberListProps) {
  const router = useRouter();

  /**
   * Handle team member updates by refreshing the page
   *
   * Ensures the UI reflects the latest changes after member modifications
   * by triggering a full page refresh to reload server state.
   */
  const handleUpdate = () => {
    router.refresh();
  };

  return (
    <UnifiedTeamMemberList
      members={teamMembers}
      variant="admin"
      showActions={true}
      gridColumns={1}
      onUpdate={handleUpdate}
    />
  );
}
