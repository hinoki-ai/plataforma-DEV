'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, User, MessageSquare } from 'lucide-react';
import { Meeting } from '@/lib/prisma-compat-types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { StatusBadge } from '@/components/ui/status-badge';

interface ParentMeetingCardProps {
  meeting: Meeting & { teacher?: { name: string; email: string } };
  onRefresh?: () => void;
}

const meetingStatusMap: Record<
  string,
  import('@/components/ui/status-badge').StatusType
> = {
  SCHEDULED: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  RESCHEDULED: 'PENDING',
};

export function ParentMeetingCard({
  meeting,
  onRefresh,
}: ParentMeetingCardProps) {
  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {meeting.title}
          </CardTitle>
          <StatusBadge status={meetingStatusMap[meeting.status]} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Student Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{meeting.studentName}</span>
            <span className="text-gray-500">- {meeting.studentGrade}</span>
          </div>
        </div>

        {/* Date and Location */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>
              {format(new Date(meeting.scheduledDate), 'dd MMM yyyy', {
                locale: es,
              })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{meeting.scheduledTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{meeting.location}</span>
          </div>
        </div>

        {/* Teacher Info */}
        {meeting.teacher && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Profesor:</span>{' '}
            {meeting.teacher.name}
          </div>
        )}

        {/* Description */}
        {meeting.description && (
          <div className="text-sm text-gray-600">
            <div className="flex items-start gap-1">
              <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <span>{meeting.description}</span>
            </div>
          </div>
        )}

        {/* Reason (if parent requested) */}
        {meeting.reason && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Motivo:</span> {meeting.reason}
          </div>
        )}

        {/* Status-specific information */}
        {meeting.status === 'COMPLETED' && meeting.outcome && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Resultado:</span> {meeting.outcome}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
