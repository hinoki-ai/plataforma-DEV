"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Phone, Mail, User } from "lucide-react";
import { Meeting, MeetingStatus } from "../../lib/prisma-compat-types";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { StatusBadge } from "@/components/ui/status-badge";

// i18n
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { useLanguage } from "@/components/language/LanguageContext";

interface MeetingCardProps {
  meeting: Meeting & { teacher?: { name: string; email: string } };
  onStatusChange?: (id: string, status: MeetingStatus) => void;
  onReschedule?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  isAdmin?: boolean;
}

const meetingStatusMap: Record<
  string,
  import("@/components/ui/status-badge").StatusType
> = {
  PENDING: "PENDING",
  SCHEDULED: "PENDING",
  CONFIRMED: "CONFIRMED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  RESCHEDULED: "PENDING",
};

export function MeetingCard({
  meeting,
  onStatusChange,
  onReschedule,
  onViewDetails,
  isAdmin = false,
}: MeetingCardProps) {
  const { t, language } = useLanguage();

  const handleStatusChange = (newStatus: MeetingStatus) => {
    if (onStatusChange) {
      onStatusChange(meeting.id, newStatus);
    }
  };

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
        {/* Student and Guardian Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{meeting.studentName}</span>
            <span className="text-gray-500">- {meeting.studentGrade}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span>{meeting.guardianName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{meeting.guardianEmail}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{meeting.guardianPhone}</span>
          </div>
        </div>

        {/* Date and Location */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>
              {format(new Date(meeting.scheduledDate), "dd MMM yyyy", {
                locale: language === "es" ? es : enUS,
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

        {/* Teacher Info (for admin view) */}
        {isAdmin && meeting.teacher && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">
              {t("meeting.assigned_teacher", "common")}:
            </span>{" "}
            {meeting.teacher.name}
          </div>
        )}

        {/* Description */}
        {meeting.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {meeting.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails?.(meeting.id)}
            className="flex-1"
          >
            {t("meeting.view_details", "common")}
          </Button>

          {(meeting.status === "SCHEDULED" || meeting.status === "PENDING") &&
            onStatusChange && (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleStatusChange("CONFIRMED" as MeetingStatus)}
                className="flex-1"
              >
                {t("meeting.confirm", "common")}
              </Button>
            )}

          {meeting.status === "CONFIRMED" && onStatusChange && (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleStatusChange("COMPLETED" as MeetingStatus)}
              className="flex-1"
            >
              {t("meeting.complete", "common")}
            </Button>
          )}

          {onReschedule && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReschedule(meeting.id)}
              className="flex-1"
            >
              {t("meeting.reschedule", "common")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
