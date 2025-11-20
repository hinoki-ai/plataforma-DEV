"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MeetingCard } from "./MeetingCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Meeting } from "@/lib/prisma-compat-types";
import { useSession } from "@/lib/auth-client";
import {
  getMeetingsAction,
  getMeetingsByTeacherAction,
} from "@/services/actions/meetings";
import { updateMeetingStatus } from "@/services/actions/meetings";
import { MeetingStatus } from "@/lib/prisma-compat-types";
import { useResponsiveMode } from "@/lib/hooks/useDesktopToggle";
import { layout, typography } from "@/lib/responsive-utils";
import { ActionLoader } from "@/components/ui/dashboard-loader";
import { useLanguage } from "@/components/language/useDivineLanguage";

interface MeetingListProps {
  isAdmin?: boolean;
  onCreateMeeting?: () => void;
}

export function MeetingList({
  isAdmin = false,
  onCreateMeeting,
}: MeetingListProps) {
  const { data: session } = useSession();
  const { isDesktopForced } = useResponsiveMode();
  const { t } = useLanguage();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMeetings = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      if (isAdmin) {
        response = await getMeetingsAction();
      } else if (session?.user?.id) {
        response = await getMeetingsByTeacherAction(session.data?.user.id);
      } else {
        setMeetings([]);
        return;
      }

      if (response.success && response.data) {
        // Handle both array and paginated response from Convex
        const meetingsData: any =
          "meetings" in response.data ? response.data.meetings : response.data;
        const convertedMeetings: Meeting[] = (
          Array.isArray(meetingsData) ? meetingsData : []
        ).map(
          (m: any) =>
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
        setError(t("meetings.list.loading_error"));
      }
    } catch (err) {
      setError(t("meetings.list.loading_error"));
    } finally {
      setLoading(false);
    }
  }, [isAdmin, session?.user?.id]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  const handleStatusChange = async (id: string, status: MeetingStatus) => {
    // Convert MeetingStatus enum to string literal type expected by API
    const statusStr = MeetingStatus[status] as
      | "SCHEDULED"
      | "CONFIRMED"
      | "IN_PROGRESS"
      | "COMPLETED"
      | "CANCELLED"
      | "RESCHEDULED";
    const result = await updateMeetingStatus(id, statusStr);
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
          {t("meetings.list.retry")}
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
          {t("meetings.list.empty")}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {isAdmin
            ? t("meetings.list.empty_description_admin")
            : t("meetings.list.empty_description_teacher")}
        </p>
        {isAdmin && (
          <div className="mt-6">
            <Button onClick={onCreateMeeting}>
              <Plus className="mr-2 h-4 w-4" />
              {t("meetings.list.new_meeting")}
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
          {isAdmin
            ? t("meetings.list.all_meetings")
            : t("meetings.list.my_meetings")}
        </h2>
        {isAdmin && (
          <Button onClick={onCreateMeeting}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Reunión
          </Button>
        )}
      </div>

      <div className={layout.grid.cards(isDesktopForced)}>
        {meetings.map((meeting) => (
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
