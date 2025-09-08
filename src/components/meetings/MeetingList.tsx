'use client';

import React, { useState, useEffect } from 'react';
import { MeetingCard } from './MeetingCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Meeting } from '@prisma/client';
import { useSession } from 'next-auth/react';
import {
  getMeetingsAction,
  getMeetingsByTeacherAction,
} from '@/services/actions/meetings';
import { updateMeetingStatus } from '@/services/actions/meetings';
import { MeetingStatus } from '@prisma/client';
import { useResponsiveMode } from '@/lib/hooks/useDesktopToggle';
import { layout, typography } from '@/lib/responsive-utils';
import { ActionLoader } from '@/components/ui/dashboard-loader';

interface MeetingListProps {
  isAdmin?: boolean;
  onCreateMeeting?: () => void;
}

export function MeetingList({ isAdmin = false, onCreateMeeting }: MeetingListProps) {
  const { data: session } = useSession();
  const { isDesktopForced } = useResponsiveMode();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMeetings();
  }, [isAdmin, session?.user?.id]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      let response;

      if (isAdmin) {
        response = await getMeetingsAction();
      } else if (session?.user?.id) {
        response = await getMeetingsByTeacherAction(session.user.id);
      } else {
        setMeetings([]);
        return;
      }

      if (response.success && response.data) {
        setMeetings(response.data);
      } else {
        setError('Error al cargar las reuniones');
      }
    } catch (err) {
      setError('Error al cargar las reuniones');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: MeetingStatus) => {
    const result = await updateMeetingStatus(id, status);
    if (result.success) {
      await loadMeetings();
    }
  };

  const handleReschedule = (id: string) => {
    // Reschedule functionality will be implemented in future update
  };

  const handleViewDetails = (id: string) => {
    // Details modal will be implemented in future update
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ActionLoader size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadMeetings} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <Plus className="h-12 w-12" />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No hay reuniones programadas
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {isAdmin
            ? 'Comienza creando una nueva reunión.'
            : 'Tu coordinador te asignará reuniones pronto.'}
        </p>
        {isAdmin && (
          <div className="mt-6">
            <Button onClick={onCreateMeeting}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Reunión
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2
          className={`${typography.heading(isDesktopForced)} font-bold text-foreground`}
        >
          {isAdmin ? 'Todas las Reuniones' : 'Mis Reuniones'}
        </h2>
        {isAdmin && (
          <Button onClick={onCreateMeeting}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Reunión
          </Button>
        )}
      </div>

      <div className={layout.grid.cards(isDesktopForced)}>
        {meetings.map(meeting => (
          <MeetingCard
            key={meeting.id}
            meeting={meeting}
            onStatusChange={handleStatusChange}
            onReschedule={handleReschedule}
            onViewDetails={handleViewDetails}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div>
  );
}
