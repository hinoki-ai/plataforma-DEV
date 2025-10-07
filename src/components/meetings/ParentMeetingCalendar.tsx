'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMeetingsByParentAction } from '@/services/actions/meetings';
import type { Meeting } from '@/lib/prisma-compat-types';
import type { MeetingsResponse } from '@/lib/types/service-responses';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ActionLoader } from '@/components/ui/dashboard-loader';

interface ParentMeetingCalendarProps {
  userId: string;
}

export function ParentMeetingCalendar({ userId }: ParentMeetingCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [meetings, setMeetings] = useState<MeetingsResponse['data']>([]);
  const [selectedDateMeetings, setSelectedDateMeetings] = useState<
    MeetingsResponse['data']
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeetings();
  }, [userId]);

  const loadMeetings = async () => {
    try {
      const response = await getMeetingsByParentAction(userId);
      if (response.success && response.data) {
        setMeetings(response.data);
      } else {
        console.error('Error loading meetings:', response.error);
      }
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMeetingsForDate = (date: Date) => {
    return (meetings || []).filter(meeting => {
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
    return (meetings || []).filter(meeting => {
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
    hasMeetings: 'bg-blue-100 text-blue-900 font-semibold border-blue-300',
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
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Selected Date Meetings */}
        {date && getDateMeetings(date)?.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Reuniones del {format(date, 'dd MMM yyyy', { locale: es })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getDateMeetings(date)?.map(meeting => (
                <div
                  key={meeting.id}
                  className="p-3 border rounded-lg bg-muted/50"
                >
                  <div className="font-medium">{meeting.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {meeting.scheduledTime} - {meeting.location}
                  </div>
                  {meeting.teacher && (
                    <div className="text-sm text-muted-foreground">
                      Profesor: {meeting.teacher.name}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ) : date ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                No hay reuniones programadas para esta fecha.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximas Reuniones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(meetings || []).slice(0, 5).map(meeting => (
              <div
                key={meeting.id}
                className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="font-medium">{meeting.title}</div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(meeting.scheduledDate), 'dd MMM yyyy', {
                    locale: es,
                  })}{' '}
                  - {meeting.scheduledTime}
                </div>
                {meeting.teacher && (
                  <div className="text-sm text-muted-foreground">
                    Profesor: {meeting.teacher.name}
                  </div>
                )}
              </div>
            ))}
            {(meetings || []).length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No tienes reuniones programadas
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
