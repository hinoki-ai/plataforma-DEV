'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ParentRequestCard } from './ParentRequestCard';
import { getParentMeetingRequestsAction } from '@/services/actions/meetings';
import type { Meeting } from '@prisma/client';
import { ActionLoader } from '@/components/ui/dashboard-loader';

export function ParentRequestsList() {
  const [requests, setRequests] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await getParentMeetingRequestsAction();

      if (response.success && response.data) {
        setRequests(response.data);
      } else {
        setError('Error al cargar las solicitudes');
      }
    } catch (err) {
      setError('Error al cargar las solicitudes');
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
        <Button onClick={loadRequests} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  if (requests.length === 0) {
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                No hay solicitudes pendientes
              </h3>
              <p className="text-muted-foreground mt-2">
                No hay solicitudes de reunión de padres pendientes de revisión.
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
          <h2 className="text-2xl font-bold text-foreground">
            Solicitudes de Padres
          </h2>
          <p className="text-muted-foreground">
            Revisa y gestiona las solicitudes de reunión de los apoderados
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {requests.map(request => (
          <ParentRequestCard
            key={request.id}
            request={request}
            onRefresh={loadRequests}
          />
        ))}
      </div>
    </div>
  );
}
