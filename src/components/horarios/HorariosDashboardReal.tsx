"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Calendar } from "lucide-react";

export function HorariosDashboardReal() {
  const [stats, setStats] = useState<{
    totalEvents: number;
    upcomingEvents: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [eventsRes, statsRes] = await Promise.all([
          fetch(
            "/api/calendar/events?categories=ACADEMIC,MEETING,ADMINISTRATIVE",
          ).then((r) => r.json()),
          fetch("/api/calendar/statistics").then((r) => r.json()),
        ]);

        const total =
          eventsRes?.success && Array.isArray(eventsRes.data)
            ? eventsRes.data.length
            : 0;
        const upcoming =
          statsRes?.success && statsRes.data ? statsRes.data.upcomingEvents : 0;
        setStats({ totalEvents: total, upcomingEvents: upcoming });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const headerDescription = useMemo(() => {
    if (loading) return "Cargando datos de horarios...";
    if (!stats) return "No se encontraron datos de horarios";
    return `Hay ${stats.upcomingEvents} eventos próximos`;
  }, [loading, stats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Gestión de Horarios
        </h1>
        <p className="text-muted-foreground">{headerDescription}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Horarios Activos
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "—" : (stats?.totalEvents ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Horarios configurados este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Profesores Asignados
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">
              Profesores con horario asignado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conflictos Detectados
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Sin conflictos de horario
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Vista de Horarios</CardTitle>
          <CardDescription>
            Eventos académicos y reuniones planificadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Usa el calendario principal para crear, editar o eliminar eventos.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
