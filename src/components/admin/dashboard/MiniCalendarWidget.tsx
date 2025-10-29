"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: string;
}

interface MiniCalendarWidgetProps {
  events: CalendarEvent[];
}

const getEventTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "academic":
    case "holiday":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "meeting":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "special":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

export function MiniCalendarWidget({ events }: MiniCalendarWidgetProps) {
  const nextEvent = events[0];
  const upcomingCount = events.length - 1;

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Próximos Eventos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No hay eventos próximos
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {nextEvent && (
              <div className="border rounded-lg p-3 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{nextEvent.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(nextEvent.date)}
                    </p>
                  </div>
                  <Badge
                    className={`text-xs ${getEventTypeColor(nextEvent.type)}`}
                  >
                    {nextEvent.type}
                  </Badge>
                </div>
              </div>
            )}

            {upcomingCount > 0 && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  +{upcomingCount} eventos más esta semana
                </p>
                <Link
                  href="/admin/calendario-escolar"
                  className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Ver calendario completo
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            )}

            {events.length === 1 && (
              <div className="text-center pt-2">
                <Link
                  href="/admin/calendario-escolar"
                  className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Gestionar calendario
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
