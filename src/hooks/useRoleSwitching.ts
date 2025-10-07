/**
 * Custom hook for managing role switching functionality
 * Provides a clean API for MASTER users to switch between roles
 */

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/prisma-compat-types';

interface RoleSwitchState {
  isSwitching: boolean;
  error: string | null;
  lastSwitchedAt: Date | null;
}

interface RoleSwitchResult {
  success: boolean;
  message?: string;
  error?: string;
}

export function useRoleSwitching() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [state, setState] = useState<RoleSwitchState>({
    isSwitching: false,
    error: null,
    lastSwitchedAt: null,
  });

  const switchRole = useCallback(
    async (targetRole: UserRole, reason?: string): Promise<RoleSwitchResult> => {
      if (!session?.user) {
        return { success: false, error: 'No authenticated user' };
      }

      if (session.user.role !== 'MASTER') {
        return { success: false, error: 'Only MASTER users can switch roles' };
      }

      if (targetRole === session.user.role) {
        return { success: false, error: 'Already in target role' };
      }

      setState(prev => ({ ...prev, isSwitching: true, error: null }));

      try {
        const response = await fetch('/api/role-switch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetRole,
            reason: reason || `Role switch from ${session.user.role} to ${targetRole}`,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Update the session with new role data
          await update(data.session);

          setState(prev => ({
            ...prev,
            isSwitching: false,
            lastSwitchedAt: new Date(),
            error: null,
          }));

          // Refresh the page to ensure all components reflect the new role
          router.refresh();

          return {
            success: true,
            message: data.message || `Successfully switched to ${targetRole}`,
          };
        } else {
          setState(prev => ({
            ...prev,
            isSwitching: false,
            error: data.error || 'Unknown error occurred',
          }));

          return {
            success: false,
            error: data.error || 'Failed to switch role',
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Network error';
        setState(prev => ({
          ...prev,
          isSwitching: false,
          error: errorMessage,
        }));

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [session, update, router]
  );

  const resetToMaster = useCallback(async (): Promise<RoleSwitchResult> => {
    return switchRole('MASTER', 'Reset to original MASTER role');
  }, [switchRole]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Computed values
  const currentRole = session?.user?.role as UserRole;
  const hasSwitched = (session?.user as any)?.switchedRole === true;
  const originalRole = (session?.user as any)?.originalRole as UserRole;
  const canSwitch = session?.user?.role === 'MASTER';
  const isMaster = session?.user?.role === 'MASTER';

  console.log('🔄 useRoleSwitching Debug:', {
    sessionRole: session?.user?.role,
    currentRole,
    canSwitch,
    isMaster,
    hasSwitched,
    originalRole
  });

  return {
    // State
    isSwitching: state.isSwitching,
    error: state.error,
    lastSwitchedAt: state.lastSwitchedAt,

    // Computed values
    currentRole,
    hasSwitched,
    originalRole,
    canSwitch,
    isMaster,

    // Actions
    switchRole,
    resetToMaster,
    clearError,
  };
}