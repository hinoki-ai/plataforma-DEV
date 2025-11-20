"use client";

import { redirect } from "next/navigation";
import { getRoleAccess } from "@/lib/role-utils";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Mail,
  Phone,
  MessageCircle,
  Bell,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Users,
  Archive,
  BarChart3,
  Eye,
  X,
} from "lucide-react";
import Link from "next/link";
import { FixedBackgroundLayout } from "@/components/layout/FixedBackgroundLayout";

interface Communication {
  id: string;
  type: string;
  from: string;
  subject: string;
  content: string;
  preview?: string;
  date: string;
  read: boolean;
  priority: string;
}

export default function ComunicacionPage() {
  const { data: session, status } = useSession();
  const { t } = useDivineParsing(["common", "parent"]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Communication | null>(
    null,
  );
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showAllMessages, setShowAllMessages] = useState(false);

  useEffect(() => {
    fetchCommunications();
  }, []);

  // Handle loading state
  if (status === "loading") {
    return <div>{t("parent.students.loading")}</div>;
  }

  // Ensure user has access to parent section
  if (!session || !session.user) {
    redirect("/login");
  }

  const roleAccess = getRoleAccess(session.user.role);
  if (!roleAccess.canAccessParent) {
    redirect("/unauthorized");
  }

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/parent/communications");
      if (response.ok) {
        const json = await response.json();
        const items = (json?.data ?? []).map((item: any) => ({
          id: item.id,
          type: item.type ?? "notification",
          from: item.from ?? "Sistema",
          subject: item.subject ?? "Comunicado",
          content: item.content ?? "",
          preview: item.preview ?? item.content ?? "",
          date: item.date ?? new Date().toISOString(),
          read: Boolean(item.read),
          priority: item.priority ?? "medium",
        })) as Communication[];
        setCommunications(items);
      } else {
        console.warn("API failed, using fallback data");
        // Use fallback data when API fails
        setCommunications([
          ...fallbackMessages,
          ...fallbackNotifications.map((n) => ({
            id: `notification-${n.id}`,
            type: "notification" as const,
            from: "Sistema",
            subject: n.title,
            content: n.description,
            date: n.date,
            read: Math.random() > 0.5, // Random read status for demo
            priority: n.type === "important" ? "high" : "normal",
          })),
        ]);
      }
    } catch (error) {
      console.warn("Network error, using fallback data:", error);
      // Use fallback data when network fails
      setCommunications([
        ...fallbackMessages,
        ...fallbackNotifications.map((n) => ({
          id: `notification-${n.id}`,
          type: "notification" as const,
          from: "Sistema",
          subject: n.title,
          content: n.description,
          date: n.date,
          read: Math.random() > 0.5,
          priority: n.type === "important" ? "high" : "normal",
        })),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const messages = communications.filter((comm) => comm.type === "message");
  const notificationsData = communications.filter(
    (comm) => comm.type === "notification",
  );

  const handleReadFullMessage = (message: Communication) => {
    setSelectedMessage(message);
    setShowMessageDialog(true);
    // Mark as read if not already read
    if (!message.read) {
      setCommunications((prev) =>
        prev.map((comm) =>
          comm.id === message.id ? { ...comm, read: true } : comm,
        ),
      );
    }
  };

  const handleViewAllMessages = () => {
    setShowAllMessages(true);
  };

  const handleCloseMessageDialog = () => {
    setShowMessageDialog(false);
    setSelectedMessage(null);
  };

  const handleCloseAllMessages = () => {
    setShowAllMessages(false);
  };

  // Fallback mock data if API fails
  const fallbackMessages: Communication[] = [
    {
      id: "fallback-1",
      type: "message",
      from: t("parent.communication.sample.from_direction"),
      subject: t("parent.communication.sample.subject_meeting"),
      content:
        t("parent.communication.sample.preview_meeting") +
        " Les esperamos puntualmente.",
      preview: t("parent.communication.sample.preview_meeting"),
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: "normal",
    },
    {
      id: "fallback-2",
      type: "message",
      from: t("parent.communication.sample.from_teacher"),
      subject: t("parent.communication.sample.subject_report"),
      content:
        t("parent.communication.sample.preview_report") +
        " El rendimiento ha sido consistente durante el trimestre.",
      preview: t("parent.communication.sample.preview_report"),
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: "high",
    },
    {
      id: "fallback-3",
      type: "message",
      from: t("parent.communication.sample.from_pie"),
      subject: t("parent.communication.sample.subject_appointment"),
      content:
        t("parent.communication.sample.preview_appointment") +
        " Por favor confirme asistencia.",
      preview: t("parent.communication.sample.preview_appointment"),
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: "high",
    },
  ];

  const fallbackNotifications = [
    {
      id: 1,
      title: t("parent.communication.notifications.school_day.title"),
      description: t(
        "parent.communication.notifications.school_day.description",
      ),
      type: "event",
      date: "2024-03-25",
    },
    {
      id: 2,
      title: t("parent.communication.notifications.class_suspension.title"),
      description: t(
        "parent.communication.notifications.class_suspension.description",
      ),
      type: "important",
      date: "2024-03-28",
    },
    {
      id: 3,
      title: t("parent.communication.notifications.uniform_delivery.title"),
      description: t(
        "parent.communication.notifications.uniform_delivery.description",
      ),
      type: "info",
      date: "2024-03-20",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <p className="text-muted-foreground">
          {t("parent.communication.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {t("parent.communication.recent_messages")}
              </CardTitle>
              <CardDescription>
                {t("parent.communication.messages_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-pulse">
                      {t("parent.communication.loading_messages")}
                    </div>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`border rounded-lg p-4 transition-colors hover:bg-muted/50 ${
                        !message.read
                          ? "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-foreground">
                            {message.from}
                          </span>
                          {message.priority === "high" && (
                            <Badge variant="destructive" className="text-xs">
                              {t("parent.communication.urgent")}
                            </Badge>
                          )}
                          {!message.read && (
                            <Badge variant="secondary" className="text-xs">
                              {t("parent.communication.new")}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {message.date}
                        </span>
                      </div>
                      <h4 className="font-medium text-foreground mb-1">
                        {message.subject}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {(message as any).preview ||
                          message.content.substring(0, 100) + "..."}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReadFullMessage(message)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t("parent.communication.read_full")}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground">
                      {t("parent.communication.no_messages")}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewAllMessages}
                >
                  {t("parent.communication.view_all_messages")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {t("parent.communication.quick_actions")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                className="w-full justify-start"
                variant="outline"
              >
                <Link href="/parent/comunicacion/nuevo">
                  <Mail className="h-4 w-4 mr-2" />
                  {t("parent.communication.new_message")}
                </Link>
              </Button>
              <Button
                asChild
                className="w-full justify-start"
                variant="outline"
              >
                <Link href="/parent/comunicacion/contactos">
                  <Users className="h-4 w-4 mr-2" />
                  {t("parent.communication.contacts")}
                </Link>
              </Button>
              <Button
                asChild
                className="w-full justify-start"
                variant="outline"
              >
                <Link href="/parent/comunicacion/archivo">
                  <Archive className="h-4 w-4 mr-2" />
                  {t("parent.communication.archive")}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Communication Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t("parent.communication.statistics")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {t("parent.communication.unread_messages")}
                  </span>
                  <span className="font-semibold text-foreground">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {t("parent.communication.messages_this_month")}
                  </span>
                  <span className="font-semibold text-foreground">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {t("parent.communication.average_response")}
                  </span>
                  <span className="font-semibold text-foreground">2.5h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t("parent.communication.notifications.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-pulse">
                      {t("parent.communication.loading_notifications")}
                    </div>
                  </div>
                ) : notificationsData.length > 0 ? (
                  notificationsData.map((notification) => (
                    <div
                      key={notification.id}
                      className="border-l-4 border-blue-500 pl-4"
                    >
                      <div className="flex items-start gap-2">
                        {notification.type === "important" ? (
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        ) : notification.type === "event" ? (
                          <Calendar className="h-4 w-4 text-blue-500 mt-0.5" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        )}
                        <div>
                          <h5 className="font-medium text-sm">
                            {notification.subject}
                          </h5>
                          <p className="text-xs text-gray-600 mb-1">
                            {notification.content}
                          </p>
                          <span className="text-xs text-gray-500">
                            {notification.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground">
                      {t("parent.communication.no_notifications")}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                {t("parent.communication.contact.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h5 className="font-medium text-sm">
                  {t("parent.communication.contact.secretary.title")}
                </h5>
                <p className="text-xs text-gray-600">
                  {t("parent.communication.contact.secretary.schedule")}
                  <br />
                  {t("parent.communication.contact.secretary.phone")}:{" "}
                  {t("parent.communication.contact.secretary.phone_number")}
                </p>
              </div>
              <div>
                <h5 className="font-medium text-sm">
                  {t("parent.communication.contact.director.title")}
                </h5>
                <p className="text-xs text-gray-600">
                  {t("parent.communication.contact.director.schedule")}
                  <br />
                  {t("parent.communication.contact.director.email")}:{" "}
                  {t("parent.communication.contact.director.email_address")}
                </p>
              </div>
              <div>
                <h5 className="font-medium text-sm">
                  {t("parent.communication.contact.emergency.title")}
                </h5>
                <p className="text-xs text-gray-600">
                  {t("parent.communication.contact.emergency.description")}
                  <br />
                  {t("parent.communication.contact.emergency.phone")}:{" "}
                  {t("parent.communication.contact.emergency.phone_number")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Message Detail Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={handleCloseMessageDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {selectedMessage?.subject}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-4">
              <span>
                {t("parent.communication.dialog.from")}: {selectedMessage?.from}
              </span>
              <span>
                {t("parent.communication.dialog.date")}:{" "}
                {selectedMessage
                  ? new Date(selectedMessage.date).toLocaleDateString()
                  : ""}
              </span>
              {selectedMessage?.priority === "high" && (
                <Badge variant="destructive" className="text-xs">
                  {t("parent.communication.dialog.high_priority")}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-foreground whitespace-pre-wrap">
                {selectedMessage?.content}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={handleCloseMessageDialog}>
              {t("parent.communication.dialog.close")}
            </Button>
            <Button
              asChild
              onClick={() => {
                handleCloseMessageDialog();
                // Could add reply functionality here
              }}
            >
              <Link
                href={`/parent/comunicacion/nuevo?reply=${selectedMessage?.id}`}
              >
                {t("parent.communication.dialog.reply")}
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* All Messages Dialog */}
      <Dialog open={showAllMessages} onOpenChange={handleCloseAllMessages}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t("parent.communication.dialog.all_messages")}
            </DialogTitle>
            <DialogDescription>
              {t("parent.communication.dialog.all_messages_desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`border rounded-lg p-4 transition-colors hover:bg-muted/50 ${
                    !message.read
                      ? "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">
                        {message.from}
                      </span>
                      {message.priority === "high" && (
                        <Badge variant="destructive" className="text-xs">
                          {t("parent.communication.urgent")}
                        </Badge>
                      )}
                      {!message.read && (
                        <Badge variant="secondary" className="text-xs">
                          {t("parent.communication.new")}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {message.date}
                    </span>
                  </div>
                  <h4 className="font-medium text-foreground mb-1">
                    {message.subject}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {(message as any).preview ||
                      message.content.substring(0, 150) + "..."}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleCloseAllMessages();
                      handleReadFullMessage(message);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {t("parent.communication.dialog.read_full")}
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-muted-foreground">
                  {t("parent.communication.no_messages")}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={handleCloseAllMessages}>
              {t("parent.communication.dialog.close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
