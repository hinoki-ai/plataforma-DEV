"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, MessageSquare, Check, X } from "lucide-react";
import { Meeting } from "@/lib/prisma-compat-types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import { updateMeetingStatus } from "@/services/actions/meetings";
import { useLanguage } from "@/components/language/LanguageContext";

interface ParentRequestCardProps {
  request: Meeting & { teacher?: { name: string; email: string } };
  onRefresh?: () => void;
}

export function ParentRequestCard({
  request,
  onRefresh,
}: ParentRequestCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { t } = useLanguage();

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const result = await updateMeetingStatus(request.id, "CONFIRMED");
      if (result.success) {
        toast.success(t("meeting.approve.success"));
        onRefresh?.();
      } else {
        toast.error(result.error || t("meeting.request.error"));
      }
    } catch (error) {
      toast.error(t("meeting.request.error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      const result = await updateMeetingStatus(request.id, "CANCELLED");
      if (result.success) {
        toast.success(t("meeting.reject.success"));
        onRefresh?.();
      } else {
        toast.error(result.error || t("meeting.request.error"));
      }
    } catch (error) {
      toast.error(t("meeting.request.error"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {request.title}
          </CardTitle>
          <StatusBadge status="PENDING" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Student Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{request.studentName}</span>
            <span className="text-gray-500">- {request.studentGrade}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span>{request.guardianName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MessageSquare className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{request.guardianEmail}</span>
          </div>
        </div>

        {/* Date and Time */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>
              {format(new Date(request.scheduledDate), "dd MMM yyyy", {
                locale: es,
              })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{request.scheduledTime}</span>
          </div>
        </div>

        {/* Reason */}
        {request.reason && (
          <div className="text-sm text-gray-600">
            <div className="flex items-start gap-1">
              <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <span className="font-medium">Motivo:</span> {request.reason}
            </div>
          </div>
        )}

        {/* Description */}
        {request.description && (
          <div className="text-sm text-gray-600">
            <div className="flex items-start gap-1">
              <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <span>{request.description}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Aprobar
          </Button>
          <Button
            onClick={handleReject}
            disabled={isProcessing}
            variant="destructive"
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Rechazar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
