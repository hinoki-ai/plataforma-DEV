"use client";

import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Popover imports removed
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import type { Meeting } from "@/lib/prisma-compat-types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getUpcomingMeetingsAction } from "@/services/actions/meetings";
import { ActionLoader } from "@/components/ui/dashboard-loader";

interface MeetingCalendarProps {
  isAdmin?: boolean;
}

export function MeetingCalendar({ isAdmin = false }: MeetingCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedDateMeetings, setSelectedDateMeetings] = useState<Meeting[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeetings();
  }, [isAdmin]);

  const loadMeetings = async () => {
    try {
      const response = await getUpcomingMeetingsAction();
      if (response.success && response.data) {
        // Convert Convex meetings to Meeting type with all required fields
        const convertedMeetings: Meeting[] = response.data.map(
          (m) =>
            ({
              id: m._id,
              title: m.title,
              meetingType: m.type,
              studentName: m.studentName,
              studentGrade: m.studentGrade,
              guardianName: m.guardianName,
              guardianEmail: m.guardianEmail,
              guardianPhone: m.guardianPhone,
              scheduledDate: new Date(m.scheduledDate),
              scheduledTime: m.scheduledTime,
              status: m.status,
              assignedTo: m.assignedTo,
              duration: m.duration,
              location: m.location,
              description: m.description,
              reason: m.reason,
              notes: m.notes,
              parentRequested: m.parentRequested,
              createdAt: new Date(m.createdAt),
              updatedAt: new Date(m.updatedAt),
            }) as Meeting,
        );
        setMeetings(convertedMeetings);
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getMeetingsForDate = (date: Date) => {
    return meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.scheduledDate);
      return (
        meetingDate.getDate() === date.getDate() &&
        meetingDate.getMonth() === date.getMonth() &&
        meetingDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setSelectedDateMeetings(getMeetingsForDate(selectedDate));
    }
  };

  const getDateMeetings = (date: Date) => {
    return meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.scheduledDate);
      return (
        meetingDate.getDate() === date.getDate() &&
        meetingDate.getMonth() === date.getMonth() &&
        meetingDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const modifiers = {
    hasMeetings: (date: Date) => getMeetingsForDate(date).length > 0,
  };

  const modifiersClassNames = {
    hasMeetings: "bg-blue-100 text-blue-900 font-semibold border-blue-300",
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ActionLoader size="md" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendario de Reuniones</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              className="rounded-md border"
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              locale={es}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {date
                ? format(date, "EEEE, d MMMM", { locale: es })
                : "Selecciona una fecha"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {date && getDateMeetings(date).length > 0 ? (
              <div className="space-y-3">
                {getDateMeetings(date).map((meeting) => (
                  <div key={meeting.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{meeting.title}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-3 w-3" />
                          <span>{meeting.scheduledTime}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {meeting.studentName} - {meeting.studentGrade}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                      >
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No hay reuniones programadas para esta fecha.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximas Reuniones</CardTitle>
          </CardHeader>
          <CardContent>
            {meetings.slice(0, 5).map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <p className="font-medium text-sm">{meeting.title}</p>
                  <p className="text-xs text-gray-600">
                    {format(new Date(meeting.scheduledDate), "dd MMM", {
                      locale: es,
                    })}{" "}
                    - {meeting.scheduledTime}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium">{meeting.studentName}</p>
                  <p className="text-xs text-gray-600">
                    {meeting.studentGrade}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
