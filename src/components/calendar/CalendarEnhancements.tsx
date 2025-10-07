"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  Check,
  X,
  Cloud,
  CloudRain,
  Sun,
} from "lucide-react";
import { CalendarEvent } from "@/data/calendario/chilean-calendar-2025";

interface CalendarViewModeProps {
  viewMode: "month" | "week" | "agenda";
  onViewModeChange: (mode: "month" | "week" | "agenda") => void;
}

export function CalendarViewMode({
  viewMode,
  onViewModeChange,
}: CalendarViewModeProps) {
  return (
    <div className="flex bg-muted rounded-lg p-1">
      {(["month", "week", "agenda"] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => onViewModeChange(mode)}
          className={`
            px-3 py-1 text-sm font-medium rounded-md transition-all duration-200
            ${
              viewMode === mode
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }
          `}
        >
          {mode === "month" && "Mes"}
          {mode === "week" && "Semana"}
          {mode === "agenda" && "Agenda"}
        </button>
      ))}
    </div>
  );
}

interface EventConflictIndicatorProps {
  conflicts: CalendarEvent[];
  date: Date;
}

export function EventConflictIndicator({
  conflicts,
  date,
}: EventConflictIndicatorProps) {
  if (conflicts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-xs"
    >
      <AlertTriangle className="h-3 w-3" />
      <span>
        {conflicts.length} conflicto{conflicts.length > 1 ? "s" : ""}
      </span>
    </motion.div>
  );
}

interface RSVPControlsProps {
  eventId: string;
  currentStatus?: "attending" | "not-attending" | "maybe";
  onRSVP: (
    eventId: string,
    status: "attending" | "not-attending" | "maybe",
  ) => void;
}

export function RSVPControls({
  eventId,
  currentStatus,
  onRSVP,
}: RSVPControlsProps) {
  const statuses = [
    {
      value: "attending" as const,
      label: "Asistiré",
      icon: Check,
      color: "text-green-600",
    },
    {
      value: "maybe" as const,
      label: "Quizás",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      value: "not-attending" as const,
      label: "No asistiré",
      icon: X,
      color: "text-red-600",
    },
  ];

  return (
    <div className="flex gap-1">
      {statuses.map(({ value, label, icon: Icon, color }) => (
        <Button
          key={value}
          variant={currentStatus === value ? "default" : "outline"}
          size="sm"
          onClick={() => onRSVP(eventId, value)}
          className={`h-8 px-2 ${currentStatus === value ? "" : color}`}
        >
          <Icon className="h-3 w-3 mr-1" />
          <span className="sr-only">{label}</span>
        </Button>
      ))}
    </div>
  );
}

interface WeatherIntegrationProps {
  date: Date;
  event: CalendarEvent;
}

export function WeatherIntegration({ date, event }: WeatherIntegrationProps) {
  // Mock weather data - in real implementation, this would fetch from weather API
  const mockWeather = {
    temp: 18,
    condition: "partly-cloudy",
    warning: event.category === "special" && Math.random() > 0.7,
  };

  const getWeatherIcon = () => {
    switch (mockWeather.condition) {
      case "sunny":
        return <Sun className="h-4 w-4 text-yellow-500" />;
      case "rainy":
        return <CloudRain className="h-4 w-4 text-blue-500" />;
      default:
        return <Cloud className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {getWeatherIcon()}
      <span>{mockWeather.temp}°C</span>
      {mockWeather.warning && (
        <Badge variant="secondary" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Lluvia esperada
        </Badge>
      )}
    </div>
  );
}

interface AgendaViewProps {
  events: CalendarEvent[];
  selectedDate: Date;
}

export function AgendaView({ events, selectedDate }: AgendaViewProps) {
  const groupedEvents = events.reduce(
    (groups, event) => {
      const dateKey = format(new Date(event.date), "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
      return groups;
    },
    {} as Record<string, CalendarEvent[]>,
  );

  return (
    <div className="space-y-4">
      {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
        <motion.div
          key={dateKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h3 className="font-semibold text-lg text-foreground">
            {format(new Date(dateKey), "EEEE, d 'de' MMMM", { locale: es })}
          </h3>
          <div className="space-y-2">
            {dayEvents.map((event, index) => (
              <motion.div
                key={`${event.id}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">
                          {event.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{event.time || "Todo el día"}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className="text-xs">
                          {event.category}
                        </Badge>
                        <WeatherIntegration
                          date={new Date(event.date)}
                          event={event}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

interface CalendarPrintViewProps {
  events: CalendarEvent[];
  month: Date;
  categories: string[];
}

export function CalendarPrintView({
  events,
  month,
  categories,
}: CalendarPrintViewProps) {
  return (
    <div className="print:block hidden">
      <div className="p-8 bg-white text-black">
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            Calendario Escolar -{" "}
            {format(month, "MMMM yyyy", { locale: es }).replace(/\b\w/g, (l) =>
              l.toUpperCase(),
            )}
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Manitos Pintadas - Sistema de Gestión Escolar
          </p>
        </header>

        <div className="space-y-4">
          {events.map((event, index) => (
            <div
              key={index}
              className="flex justify-between items-start p-3 border-b"
            >
              <div className="flex-1">
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-sm text-gray-600">{event.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(event.date), "d 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                  {event.time && ` - ${event.time}`}
                </p>
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                {event.category}
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-8 pt-4 border-t text-center text-xs text-gray-500">
          <p>
            Generado el{" "}
            {format(new Date(), "d 'de' MMMM, yyyy 'a las' HH:mm", {
              locale: es,
            })}
          </p>
          <p className="mt-1">Categorías incluidas: {categories.join(", ")}</p>
        </footer>
      </div>
    </div>
  );
}

// Export utility functions
export const calendarUtils = {
  formatEventTime: (event: CalendarEvent) => {
    if (!event.time) return "Todo el día";
    return event.time;
  },

  getEventDuration: (event: CalendarEvent) => {
    // Mock duration calculation - would be based on actual event data
    return Math.floor(Math.random() * 120) + 30; // 30-150 minutes
  },

  getEventColor: (category: string) => {
    const colors = {
      academic: "bg-blue-100 text-blue-800 border-blue-200",
      holiday: "bg-green-100 text-green-800 border-green-200",
      special: "bg-purple-100 text-purple-800 border-purple-200",
      parent: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return (
      colors[category as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  },
};
