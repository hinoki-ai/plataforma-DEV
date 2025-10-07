'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ParentMeetingCard } from './ParentMeetingCard';
import { getMeetingsByParentAction } from '@/services/actions/meetings';
import type { Meeting } from '@/lib/prisma-compat-types';
import { ActionLoader } from '@/components/ui/dashboard-loader';

interface ParentMeetingListProps {
  userId: string;
}

export function ParentMeetingList({ userId }: ParentMeetingListProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMeetings();
  }, [userId]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const response = await getMeetingsByParentAction(userId);

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
      <Card>
        <CardContent className="text-center py-12">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                No hay reuniones programadas
              </h3>
              <p className="text-muted-foreground mt-2">
                No tienes reuniones programadas en este momento. Puedes
                solicitar una nueva reunión desde la pestaña &quot;Solicitar
                Reunión&quot;.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mis Reuniones</h2>
          <p className="text-muted-foreground">
            Reuniones programadas con los profesores de tu hijo/a
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {meetings.map(meeting => (
          <ParentMeetingCard
            key={meeting.id}
            meeting={meeting}
            onRefresh={loadMeetings}
          />
        ))}
      </div>
    </div>
  );
}
