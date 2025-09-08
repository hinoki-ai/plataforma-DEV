/**
 * Role Switching API Route
 * Allows MASTER users to switch between different roles for testing purposes
 * Includes security validations, audit logging, and proper error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Logger } from '@/lib/logger';
import { UserRole } from '@prisma/client';
import { ExtendedUserRole } from '@/lib/authorization';

const logger = Logger.getInstance('RoleSwitchAPI');

// Valid roles that MASTER can switch to
const VALID_SWITCH_ROLES: UserRole[] = ['MASTER', 'ADMIN', 'PROFESOR', 'PARENT'];

interface RoleSwitchRequest {
  targetRole: UserRole;
  reason?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Security: Only MASTER users can switch roles
    if (!session?.user || session.user.role !== 'MASTER') {
      logger.warn('Unauthorized role switch attempt', {
        userId: session?.user?.id,
        userRole: session?.user?.role,
        userEmail: session?.user?.email,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Only MASTER users can switch roles',
        },
        { status: 403 }
      );
    }

    const body: RoleSwitchRequest = await request.json();
    const { targetRole, reason } = body;

    // Validation: Check if target role is valid
    if (!targetRole || !VALID_SWITCH_ROLES.includes(targetRole)) {
      logger.warn('Invalid target role for switch', {
        userId: session.user.id,
        targetRole,
        validRoles: VALID_SWITCH_ROLES,
      });

      return NextResponse.json(
        {
          success: false,
          error: `Invalid target role. Must be one of: ${VALID_SWITCH_ROLES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Audit logging
    logger.info('MASTER user role switch', {
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      originalRole: session.user.role,
      targetRole,
      reason: reason || 'No reason provided',
      timestamp: new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') ||
                 request.headers.get('x-real-ip') ||
                 'unknown',
      userAgent: request.headers.get('user-agent'),
    });

    // Create new session data with switched role
    const newSession = {
      ...session,
      user: {
        ...session.user,
        role: targetRole,
        // Add metadata about the switch
        switchedRole: true,
        originalRole: 'MASTER',
        switchedAt: new Date().toISOString(),
      },
    };

    // Return success response with new session data
    // The client will need to handle updating their session state
    return NextResponse.json({
      success: true,
      message: `Role switched to ${targetRole}`,
      newRole: targetRole,
      originalRole: 'MASTER',
      session: newSession,
      switchedAt: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Role switch error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during role switch',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve current switch status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user has switched role
    const hasSwitched = (session.user as any).switchedRole === true;
    const originalRole = (session.user as any).originalRole;

    return NextResponse.json({
      success: true,
      currentRole: session.user.role,
      hasSwitched,
      originalRole: hasSwitched ? originalRole : null,
      canSwitch: session.user.role === 'MASTER',
      validRoles: VALID_SWITCH_ROLES,
    });

  } catch (error) {
    logger.error('Role switch status error', { error });

    return NextResponse.json(
      {
        success: false,
        error: 'Error retrieving role switch status',
      },
      { status: 500 }
    );
  }
}