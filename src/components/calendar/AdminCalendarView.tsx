"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  importCalendarEventsFromCSV,
  exportCalendarEventsToCSV,
  bulkCreateCalendarEvents,
  massUpdateCalendarEvents,
  massDeleteCalendarEvents,
} from "@/services/calendar/calendar-service";
import { EventCategory } from "@/services/calendar/types";
import { cn } from "@/lib/utils";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { useSession } from "next-auth/react";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  category: string;
  level: string;
  isRecurring: boolean;
  isAllDay: boolean;
  color?: string;
  location?: string;
}

const categoryColors: Record<string, string> = {
  ACADEMIC: "bg-blue-500",
  HOLIDAY: "bg-red-500",
  SPECIAL: "bg-purple-500",
  PARENT: "bg-green-500",
  ADMINISTRATIVE: "bg-orange-500",
  EXAM: "bg-yellow-500",
  MEETING: "bg-indigo-500",
};

export default function AdminCalendarView() {
  const { t } = useDivineParsing(["common"]);
  const { data: session } = useSession();
  const userId = session?.user?.id || "system";

  // Category labels will be loaded from i18n
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      ACADEMIC: t("calendar.category.academic", "common"),
      HOLIDAY: t("calendar.category.holiday", "common"),
      SPECIAL: t("calendar.category.special", "common"),
      PARENT: t("calendar.category.parent", "common"),
      ADMINISTRATIVE: t("calendar.category.administrative", "common"),
      EXAM: t("calendar.category.exam", "common"),
      MEETING: t("calendar.category.meeting", "common"),
    };
    return labels[category] || category;
  };

  const categoryLabels: Record<string, string> = {
    ACADEMIC: t("calendar.category.academic", "common"),
    HOLIDAY: t("calendar.category.holiday", "common"),
    SPECIAL: t("calendar.category.special", "common"),
    PARENT: t("calendar.category.parent", "common"),
    ADMINISTRATIVE: t("calendar.category.administrative", "common"),
    EXAM: t("calendar.category.exam", "common"),
    MEETING: t("calendar.category.meeting", "common"),
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      all: t("calendar.level.all", "common"),
      NT1: t("calendar.level.nt1", "common"),
      NT2: t("calendar.level.nt2", "common"),
      both: t("calendar.level.both", "common"),
    };
    return labels[level] || level;
  };
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<
    "update" | "delete" | "duplicate"
  >("update");
  const [isSelecting, setIsSelecting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    category: "ACADEMIC",
    level: "both",
    isAllDay: false,
    color: "",
    location: "",
  });

  // Recurring form state
  const [recurringData, setRecurringData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    category: "ACADEMIC",
    level: "both",
    isAllDay: false,
    color: "",
    location: "",
    pattern: "WEEKLY" as "DAILY" | "WEEKLY" | "MONTHLY",
    interval: 1,
    occurrences: 12,
    daysOfWeek: [] as string[],
  });

  // Bulk update form state
  const [bulkUpdateData, setBulkUpdateData] = useState({
    category: "",
    level: "",
    color: "",
    location: "",
  });

  // CSV import state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const result = await getCalendarEvents();
      if (result.success && result.data) {
        setEvents(
          result.data.map((event: any) => ({
            ...event,
            description: event.description ?? undefined,
            location: event.location ?? undefined,
            metadata: event.metadata ?? undefined,
            color: event.color ?? undefined,
            level: event.metadata?.level || "both",
            isRecurring: event.metadata?.isRecurring || false,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
          })),
        );
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(t("calendar.load_error", "common"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let result;
      if (isEditMode && selectedEvent) {
        const eventData = {
          ...formData,
          category: formData.category as EventCategory,
          priority: "MEDIUM" as const,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          isRecurring: false,
          updatedBy: userId,
        };
        result = await updateCalendarEvent(selectedEvent.id, eventData);
      } else {
        const eventData = {
          ...formData,
          category: formData.category as EventCategory,
          priority: "MEDIUM" as const,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          isRecurring: false,
          createdBy: userId,
        };
        result = await createCalendarEvent(eventData);
      }

      if (result.success) {
        toast.success(
          `El evento "${formData.title}" ha sido ${isEditMode ? t("common.update", "common") : t("common.create", "common")} ${t("common.success", "common").toLowerCase()}.`,
        );
        setIsDialogOpen(false);
        resetForm();
        loadEvents();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(t("calendar.save_error", "common"));
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm(t("calendar.confirm_delete", "common"))) return;

    try {
      const result = await deleteCalendarEvent(eventId);
      if (result.success) {
        toast.success(
          t("common.delete", "common") +
            " " +
            t("common.success", "common").toLowerCase() +
            ".",
        );
        loadEvents();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(t("calendar.delete_error", "common"));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      category: "ACADEMIC",
      level: "both",
      isAllDay: false,
      color: "",
      location: "",
    });
    setSelectedEvent(null);
    setIsEditMode(false);
  };

  const handleBulkAction = async () => {
    if (selectedEvents.length === 0) {
      toast.error(t("calendar.no_events_selected", "common"));
      return;
    }

    try {
      let result;

      switch (bulkAction) {
        case "update":
          const updates = Object.fromEntries(
            Object.entries(bulkUpdateData).filter(([_, value]) => value !== ""),
          );
          result = await massUpdateCalendarEvents(selectedEvents, {
            ...updates,
            updatedBy: "admin",
          });
          break;
        case "delete":
          result = await massDeleteCalendarEvents(selectedEvents);
          break;
        case "duplicate":
          const eventsToDuplicate = events.filter((e) =>
            selectedEvents.includes(e.id),
          );
          const duplicatedEvents = eventsToDuplicate.map((event) => ({
            ...event,
            title: `${event.title} (copia)`,
            category: event.category as EventCategory,
            priority: "MEDIUM" as const,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            id: undefined,
            createdBy: userId,
          }));
          result = await bulkCreateCalendarEvents(duplicatedEvents);
          break;
      }

      if (result.success) {
        const actionText =
          bulkAction === "delete"
            ? t("calendar.events_deleted", "common")
            : bulkAction === "update"
              ? t("calendar.events_updated", "common")
              : t("calendar.events_duplicated", "common");
        toast.success(
          `${selectedEvents.length} ${actionText} ${t("common.success", "common").toLowerCase()}`,
        );
        setIsBulkDialogOpen(false);
        setSelectedEvents([]);
        setIsSelecting(false);
        loadEvents();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(t("calendar.bulk_error", "common"));
    }
  };

  const handleCSVImport = async () => {
    if (!csvFile) return;

    try {
      const text = await csvFile.text();
      const result = await importCalendarEventsFromCSV(text, "admin");

      if (result.success && "data" in result && result.data) {
        toast.success(
          `${t("common.import", "common")} ${result.data.total} ${t("calendar.events_created", "common")} ${t("calendar.import_success", "common")}`,
        );
        setIsImportDialogOpen(false);
        setCsvFile(null);
        setCsvPreview([]);
        setCsvHeaders([]);
        loadEvents();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(t("calendar.import_error", "common"));
    }
  };

  const handleCSVExport = async () => {
    try {
      const result = await exportCalendarEventsToCSV();
      if (result.success) {
        const csvData =
          result.success &&
          "data" in result &&
          result.data &&
          typeof result.data === "object" &&
          "content" in result.data
            ? result.data.content
            : "";
        const blob = new Blob([csvData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `calendario-escolar-${format(new Date(), "yyyy-MM-dd")}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success(
          t("calendar.export_title", "common") +
            " " +
            t("common.success", "common").toLowerCase(),
        );
        setIsExportDialogOpen(false);
      }
    } catch (error) {
      toast.error(t("calendar.export_error", "common"));
    }
  };

  const handleRecurringEvents = async () => {
    try {
      const events = [];
      const startDate = new Date(recurringData.startDate);
      const endDate = new Date(recurringData.endDate);

      for (let i = 0; i < recurringData.occurrences; i++) {
        const currentStartDate = new Date(startDate);
        const currentEndDate = new Date(endDate);

        // Calculate date based on pattern
        switch (recurringData.pattern) {
          case "DAILY":
            currentStartDate.setDate(
              startDate.getDate() + i * recurringData.interval,
            );
            currentEndDate.setDate(
              endDate.getDate() + i * recurringData.interval,
            );
            break;
          case "WEEKLY":
            currentStartDate.setDate(
              startDate.getDate() + i * 7 * recurringData.interval,
            );
            currentEndDate.setDate(
              endDate.getDate() + i * 7 * recurringData.interval,
            );
            break;
          case "MONTHLY":
            currentStartDate.setMonth(
              startDate.getMonth() + i * recurringData.interval,
            );
            currentEndDate.setMonth(
              endDate.getMonth() + i * recurringData.interval,
            );
            break;
        }

        events.push({
          ...recurringData,
          category: recurringData.category as EventCategory,
          priority: "MEDIUM" as const,
          startDate: currentStartDate,
          endDate: currentEndDate,
          createdBy: userId,
          isRecurring: true,
        });
      }

      const result = await bulkCreateCalendarEvents(events);
      if (result.success && "data" in result && result.data) {
        toast.success(
          `${t("common.create", "common")} ${result.data.total} ${t("calendar.events_created", "common")}`,
        );
        setIsRecurringDialogOpen(false);
        loadEvents();
      }
    } catch (error) {
      toast.error(t("calendar.recurring_error", "common"));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split("\n");
        if (lines.length > 0) {
          const headers = lines[0].split(",").map((h) => h.trim());
          setCsvHeaders(headers);
          const preview = lines
            .slice(1, 6)
            .map((line) => line.split(",").map((v) => v.trim()));
          setCsvPreview(preview);
        }
      };
      reader.readAsText(file);
    }
  };

  const toggleEventSelection = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId],
    );
  };

  const toggleSelectAll = () => {
    if (selectedEvents.length === filteredEvents.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(filteredEvents.map((e) => e.id));
    }
  };

  const openNewEventDialog = (date?: Date) => {
    resetForm();
    if (date) {
      const dateStr = format(date, "yyyy-MM-dd");
      setFormData((prev) => ({
        ...prev,
        startDate: dateStr,
        endDate: dateStr,
      }));
    }
    setIsDialogOpen(true);
  };

  const openEditEventDialog = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEditMode(true);
    setFormData({
      title: event.title,
      description: event.description || "",
      startDate: format(event.startDate, "yyyy-MM-dd"),
      endDate: format(event.endDate, "yyyy-MM-dd"),
      category: event.category,
      level: event.level,
      isAllDay: event.isAllDay,
      color: event.color || "",
      location: event.location || "",
    });
    setIsDialogOpen(true);
  };

  const filteredEvents = events.filter((event) => {
    if (selectedCategory !== "all" && event.category !== selectedCategory)
      return false;
    if (selectedLevel !== "all" && event.level !== selectedLevel) return false;
    return true;
  });

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { locale: es });
    const endDate = endOfWeek(monthEnd, { locale: es });

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayEvents = filteredEvents.filter((event) =>
          isSameDay(event.startDate, cloneDay),
        );

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "min-h-24 p-2 border border-border hover:bg-muted/50 cursor-pointer transition-colors relative",
              !isSameMonth(day, monthStart) &&
                "bg-muted/20 text-muted-foreground",
              isSameDay(day, new Date()) && "bg-primary/10",
            )}
            onClick={() => !isSelecting && openNewEventDialog(cloneDay)}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-medium">
                {format(day, dateFormat)}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    openNewEventDialog(cloneDay);
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="space-y-1 max-h-16 overflow-y-auto">
              {dayEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 flex items-center gap-1",
                    categoryColors[event.category] || "bg-gray-500",
                    "text-white",
                    isSelecting && "pr-6",
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSelecting) {
                      toggleEventSelection(event.id);
                    } else {
                      openEditEventDialog(event);
                    }
                  }}
                >
                  {isSelecting && (
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event.id)}
                      onChange={() => toggleEventSelection(event.id)}
                      className="w-3 h-3 rounded bg-white/20 border-white/50"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={t(
                        "calendar.select_event",
                        "Seleccionar evento",
                      )}
                      title={t("calendar.select_event", "Seleccionar evento")}
                    />
                  )}
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{dayEvents.length - 3} más
                </div>
              )}
            </div>
          </div>,
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>,
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Filters and Controls */}
      <div className="flex flex-col gap-4">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-2">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-32">
                <SelectValue
                  placeholder={t("calendar.category.select", "common")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("calendar.category.all", "common")}
                </SelectItem>
                <SelectItem value="ACADEMIC">
                  {getCategoryLabel("ACADEMIC")}
                </SelectItem>
                <SelectItem value="HOLIDAY">
                  {getCategoryLabel("HOLIDAY")}
                </SelectItem>
                <SelectItem value="SPECIAL">
                  {getCategoryLabel("SPECIAL")}
                </SelectItem>
                <SelectItem value="PARENT">
                  {getCategoryLabel("PARENT")}
                </SelectItem>
                <SelectItem value="ADMINISTRATIVE">
                  {getCategoryLabel("ADMINISTRATIVE")}
                </SelectItem>
                <SelectItem value="EXAM">{getCategoryLabel("EXAM")}</SelectItem>
                <SelectItem value="MEETING">
                  {getCategoryLabel("MEETING")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-32">
                <SelectValue
                  placeholder={t("calendar.level.select", "common")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{getLevelLabel("all")}</SelectItem>
                <SelectItem value="NT1">{getLevelLabel("NT1")}</SelectItem>
                <SelectItem value="NT2">{getLevelLabel("NT2")}</SelectItem>
                <SelectItem value="both">{getLevelLabel("both")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          <div className="flex gap-2 flex-wrap">
            {isSelecting && (
              <div className="flex gap-2 items-center">
                <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                  {selectedEvents.length === filteredEvents.length
                    ? t("calendar.deselect_all", "common")
                    : t("calendar.select_all", "common")}{" "}
                  {t("common.all", "common").toLowerCase()}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedEvents.length}{" "}
                  {t("common.selected", "common").toLowerCase()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkDialogOpen(true)}
                  disabled={selectedEvents.length === 0}
                >
                  {t("calendar.bulk_action", "common")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsSelecting(false);
                    setSelectedEvents([]);
                  }}
                >
                  {t("calendar.cancel", "common")}
                </Button>
              </div>
            )}
            {!isSelecting && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSelecting(true)}
              >
                {t("calendar.multiple_selection", "common")}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-lg font-medium flex items-center justify-center min-w-32">
              {format(currentDate, "MMMM yyyy", { locale: es }).replace(
                /\b\w/g,
                (l) => l.toUpperCase(),
              )}
            </span>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => openNewEventDialog()}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("calendar.new_event", "common")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRecurringDialogOpen(true)}
            className="gap-2"
          >
            <Calendar className="w-4 h-4" />
            {t("calendar.recurring_events", "common")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportDialogOpen(true)}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            {t("calendar.import_csv", "common")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCSVExport}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            {t("calendar.export_csv", "common")}
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <Card className="p-4">
        <div className="grid grid-cols-7 text-center text-sm font-medium mb-2">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div key={day} className="p-2 text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        {renderCalendar()}
      </Card>

      {/* Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode
                ? t("calendar.edit_event", "common")
                : t("calendar.new_event", "common")}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? t("calendar.edit_event_desc", "common")
                : t("calendar.new_event_desc", "common")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">
                  {t("calendar.title_label", "common")}
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">
                  {t("calendar.category_label", "common")}
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">
                {t("calendar.description_label", "common")}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">
                  {t("calendar.start_date_label", "common")}
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">
                  {t("calendar.end_date_label", "common")}
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="level">
                  {t("calendar.level_label", "common")}
                </Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) =>
                    setFormData({ ...formData, level: value })
                  }
                >
                  <SelectContent>
                    <SelectItem value="NT1">NT1</SelectItem>
                    <SelectItem value="NT2">NT2</SelectItem>
                    <SelectItem value="both">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">
                  {t("calendar.location_label", "common")}
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Ej: Sala de reuniones"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color">
                  {t("calendar.color_label", "common")}
                </Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color || "#3b82f6"}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isAllDay"
                  checked={formData.isAllDay}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isAllDay: checked })
                  }
                />
                <Label htmlFor="isAllDay">
                  {t("calendar.all_day_label", "common")}
                </Label>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit">
                {isEditMode
                  ? t("calendar.update_event", "common")
                  : t("calendar.create_event", "common")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                {t("calendar.cancel", "common")}
              </Button>
              {isEditMode && selectedEvent && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedEvent.id);
                    setIsDialogOpen(false);
                  }}
                >
                  {t("common.delete", "common")}
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
