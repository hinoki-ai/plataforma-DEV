/**
 * UnifiedCalendarView - The Ultimate Calendar Component
 * Consolidates all calendar functionality with the best features from all components
 * Uses unified calendar service and provides supreme UX
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  format,
  isToday,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  getDay,
  addMonths,
  subMonths,
  isSameDay,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  TrendingUp,
  Search,
  RefreshCw,
  Check,
} from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  AdaptiveCard,
  AdaptiveCardContent,
  AdaptiveCardHeader,
  AdaptiveCardTitle,
} from "@/components/ui/adaptive-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/components/providers/ContextProvider";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { exportCalendarEventsAction } from "@/app/actions/calendar";
import { useSession } from "@/lib/auth-client";
import { useHydrationSafe } from "@/components/ui/hydration-error-boundary";
import {
  UnifiedCalendarEvent,
  EventCategory,
  CalendarQuery,
  CalendarExportFormat,
  CalendarEvent,
} from "@/services/calendar/types";
import {
  getHolidaysByYear,
  type ChileanHoliday,
} from "@/data/comprehensive-calendar";
import commonES from "../../locales/es/common.json";
import commonEN from "../../locales/en/common.json";

interface UnifiedCalendarViewProps {
  /** View mode: full calendar, compact, or meeting-focused */
  mode?: "full" | "compact" | "meetings";
  /** Initial categories to show */
  initialCategories?: EventCategory[];
  /** Whether to show admin controls */
  showAdminControls?: boolean;
  /** Whether to show export functionality */
  showExport?: boolean;
  /** Custom height for the component */
  height?: string;
  /** Callback when an event is selected */
  onEventSelect?: (event: UnifiedCalendarEvent) => void;
  /** Callback when a date is selected */
  onDateSelect?: (date: Date, events: UnifiedCalendarEvent[]) => void;
  /** Whether to show search functionality */
  showSearch?: boolean;
  /** Custom class name */
  className?: string;
  /** User role for determining view/edit permissions */
  userRole?: "ADMIN" | "PROFESOR" | "CENTRO_CONSEJO" | "PARENT" | null;
  /** Enable edit mode regardless of role (for admin override) */
  forceEditMode?: boolean;
}

export default function UnifiedCalendarView({
  mode = "full",
  initialCategories = ["ACADEMIC", "HOLIDAY", "MEETING", "EVENT"],
  showAdminControls = false,
  showExport = true,
  height = "auto",
  onEventSelect,
  onDateSelect,
  showSearch = true,
  className,
  userRole = null,
  forceEditMode = false,
}: UnifiedCalendarViewProps) {
  // Context and session
  const isHydrated = useHydrationSafe();
  const { data: session, status: sessionStatus } = useSession();
  const { context, isPublicRoute, isAuthRoute } = useAppContext();
  const { t, language } = useDivineParsing(["common"]);

  // State management - hydration-safe initialization
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);

  // Determine user role and permissions with context awareness
  const actualUserRole = session?.user?.role || userRole;
  const canEdit = forceEditMode || actualUserRole === "ADMIN";
  const canView = !!actualUserRole || !!userRole || isPublicRoute; // Allow viewing for public routes
  const isAuthenticated = sessionStatus === "authenticated";

  // Auto-detect admin controls based on context
  const shouldShowAdminControls =
    showAdminControls ?? (context === "auth" && canEdit);
  const shouldShowExport = showExport ?? context === "auth";
  const [selectedCategories, setSelectedCategories] =
    useState<EventCategory[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [announceText, setAnnounceText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Ensure currentMonth is never null for the rest of the component
  const safeCurrentMonth = currentMonth || new Date();

  // Get current month date range for queries - reactive to currentMonth
  const startOfMonthDate = useMemo(
    () => startOfMonth(safeCurrentMonth),
    [safeCurrentMonth],
  );
  const endOfMonthDate = useMemo(
    () => endOfMonth(safeCurrentMonth),
    [safeCurrentMonth],
  );

  // Use Convex React hooks for authenticated queries - only when authenticated
  const allEvents = useQuery(
    api.calendar.getCalendarEvents,
    isAuthenticated
      ? {
          startDate: undefined,
          endDate: undefined,
          category: undefined,
          isActive: true,
        }
      : "skip",
  );

  const monthEventsData = useQuery(
    api.calendar.getCalendarEvents,
    isAuthenticated
      ? {
          startDate: startOfMonthDate.getTime(),
          endDate: endOfMonthDate.getTime(),
          category: undefined,
          isActive: true,
        }
      : "skip",
  );

  const upcomingEventsData = useQuery(
    api.calendar.getUpcomingEvents,
    isAuthenticated
      ? {
          limit: 10,
        }
      : "skip",
  );

  // Process and group events
  const [events, setEvents] = useState<Record<string, UnifiedCalendarEvent[]>>(
    {},
  );
  const [monthEvents, setMonthEvents] = useState<UnifiedCalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UnifiedCalendarEvent[]>(
    [],
  );
  const [statistics, setStatistics] = useState<any>(null);
  const [groupedEvents, setGroupedEvents] = useState<
    Record<string, UnifiedCalendarEvent[]>
  >({});

  const normalizeEvent = useCallback(
    (
      event: (CalendarEvent | UnifiedCalendarEvent) & { _id?: string },
    ): UnifiedCalendarEvent => ({
      ...event,
      id: event.id ?? event._id ?? Math.random().toString(36).slice(2),
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
    }),
    [],
  );

  // Transform holidays from comprehensive-calendar into UnifiedCalendarEvent format
  const transformHolidayToEvent = useCallback(
    (holiday: ChileanHoliday): UnifiedCalendarEvent => {
      const holidayDate = new Date(holiday.date);
      const now = new Date();
      return {
        id: `holiday-${holiday.id}`,
        title: holiday.name,
        description:
          holiday.description ||
          `Feriado${holiday.isNational ? " nacional" : ""}${holiday.region ? ` - ${holiday.region}` : ""}`,
        startDate: holidayDate,
        endDate: holidayDate,
        category: "HOLIDAY" as EventCategory,
        priority: "HIGH" as const,
        isAllDay: true,
        isRecurring: holiday.isRecurring,
        createdBy: "system",
        createdAt: now,
        updatedAt: now,
        color: "#ef4444", // red for holidays
      };
    },
    [],
  );

  // Get holidays for relevant years (current year ± 1 for better coverage)
  const getRelevantHolidays = useCallback((): UnifiedCalendarEvent[] => {
    if (!isHydrated) return [];

    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    const holidays: UnifiedCalendarEvent[] = [];
    years.forEach((year) => {
      const yearHolidays = getHolidaysByYear(year);
      holidays.push(...yearHolidays.map(transformHolidayToEvent));
    });

    return holidays;
  }, [isHydrated, transformHolidayToEvent]);

  // Mobile detection - hydration-safe
  const [isMobileView, setIsMobileView] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Initialize date states after hydration to prevent mismatches
  useEffect(() => {
    if (isHydrated) {
      // Initialize dates only once after hydration
      if (!currentMonth) {
        setCurrentMonth(new Date());
      }
      if (!selectedDate) {
        setSelectedDate(new Date());
      }
    }
  }, [isHydrated]); // Remove selectedDate and currentMonth from deps to prevent re-initialization

  // Mobile detection - only after hydration
  useEffect(() => {
    if (!isHydrated) return;

    const checkMobile = () => {
      if (typeof window !== "undefined") {
        setIsMobileView(window.innerWidth < 768);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isHydrated]);

  // Process events when data is loaded from hooks
  useEffect(() => {
    if (!isHydrated) return;

    setIsLoading(
      allEvents === undefined ||
        monthEventsData === undefined ||
        upcomingEventsData === undefined,
    );

    // Get holidays from comprehensive-calendar dataset
    const holidays = getRelevantHolidays();

    // Filter events by selected categories
    const filterByCategories = (eventList: any[] | undefined) => {
      if (!eventList) return [];
      if (selectedCategories.length === 0) return eventList;
      return eventList.filter((event) =>
        selectedCategories.includes(event.category as EventCategory),
      );
    };

    // Filter by search term
    const filterBySearch = (eventList: any[]) => {
      if (!searchTerm) return eventList;
      const searchLower = searchTerm.toLowerCase();
      return eventList.filter(
        (event) =>
          event.title?.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower),
      );
    };

    // Merge holidays with database events and process all events
    const allEventsWithHolidays = [
      ...(allEvents || []).map((e: any) => ({
        ...e,
        startDate:
          typeof e.startDate === "number" ? new Date(e.startDate) : e.startDate,
        endDate:
          typeof e.endDate === "number" ? new Date(e.endDate) : e.endDate,
      })),
      ...holidays,
    ];
    let processedEvents = filterByCategories(allEventsWithHolidays);
    processedEvents = filterBySearch(processedEvents);

    // Process month events - merge holidays for current month
    const monthHolidays = holidays.filter((holiday) => {
      const holidayDate = new Date(holiday.startDate);
      return holidayDate >= startOfMonthDate && holidayDate <= endOfMonthDate;
    });
    const monthEventsWithHolidays = [
      ...(monthEventsData || []).map((e: any) => ({
        ...e,
        startDate:
          typeof e.startDate === "number" ? new Date(e.startDate) : e.startDate,
        endDate:
          typeof e.endDate === "number" ? new Date(e.endDate) : e.endDate,
      })),
      ...monthHolidays,
    ];
    let processedMonthEvents = filterByCategories(monthEventsWithHolidays);
    processedMonthEvents = filterBySearch(processedMonthEvents);

    // Process upcoming events - include upcoming holidays
    const now = Date.now();
    const upcomingHolidays = holidays
      .filter((holiday) => {
        const holidayTime = new Date(holiday.startDate).getTime();
        return holidayTime >= now;
      })
      .slice(0, 10); // Limit to 10 upcoming holidays
    const upcomingEventsWithHolidays = [
      ...(upcomingEventsData || []).map((e: any) => ({
        ...e,
        startDate:
          typeof e.startDate === "number" ? new Date(e.startDate) : e.startDate,
        endDate:
          typeof e.endDate === "number" ? new Date(e.endDate) : e.endDate,
      })),
      ...upcomingHolidays,
    ];
    let processedUpcoming = filterByCategories(upcomingEventsWithHolidays);
    processedUpcoming = filterBySearch(processedUpcoming);
    // Sort by date and limit
    processedUpcoming.sort((a, b) => {
      const aTime = new Date(a.startDate).getTime();
      const bTime = new Date(b.startDate).getTime();
      return aTime - bTime;
    });
    processedUpcoming = processedUpcoming.slice(0, 10);

    // Normalize and set events
    setMonthEvents(processedMonthEvents.map(normalizeEvent));
    setUpcomingEvents(processedUpcoming.map(normalizeEvent));

    // Group events by date
    const grouped: Record<string, UnifiedCalendarEvent[]> = {};
    processedEvents.forEach((event: any) => {
      const startDate =
        event.startDate instanceof Date
          ? event.startDate
          : new Date(event.startDate);
      const dateKey = startDate.toISOString().split("T")[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(normalizeEvent(event));
    });
    setGroupedEvents(grouped);
    setEvents(grouped);

    // Calculate statistics including holidays
    if (allEventsWithHolidays.length > 0) {
      const currentTime = Date.now();
      const stats = {
        total: allEventsWithHolidays.length,
        upcoming: 0,
        byCategory: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
      };

      allEventsWithHolidays.forEach((event: any) => {
        if (event.category) {
          stats.byCategory[event.category] =
            (stats.byCategory[event.category] || 0) + 1;
        }
        if (event.priority) {
          stats.byPriority[event.priority] =
            (stats.byPriority[event.priority] || 0) + 1;
        }
        const eventStartTime =
          event.startDate instanceof Date
            ? event.startDate.getTime()
            : typeof event.startDate === "number"
              ? event.startDate
              : new Date(event.startDate).getTime();
        if (eventStartTime >= currentTime) {
          stats.upcoming++;
        }
      });
      setStatistics(stats);
    }
  }, [
    allEvents,
    monthEventsData,
    upcomingEventsData,
    selectedCategories,
    searchTerm,
    isHydrated,
    normalizeEvent,
    getRelevantHolidays,
    startOfMonthDate,
    endOfMonthDate,
  ]);

  // Refresh data - hooks automatically refresh, so we just trigger a re-render
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // The useEffect above will automatically pick up new data from hooks
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  // Get events for a specific date
  const getEventsForDate = useCallback(
    (date: Date): UnifiedCalendarEvent[] => {
      const dateKey = format(date, "yyyy-MM-dd");
      return events[dateKey] || [];
    },
    [events],
  );

  // Handle date selection
  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      setSelectedDate(date);
      if (date) {
        const dateEvents = getEventsForDate(date);
        const dateText = format(date, "d 'de' MMMM, yyyy", { locale: es });
        const eventText =
          dateEvents.length > 0
            ? `${dateEvents.length} evento${dateEvents.length > 1 ? "s" : ""} programado${dateEvents.length > 1 ? "s" : ""}`
            : "Sin eventos programados";
        setAnnounceText(`Fecha seleccionada: ${dateText}. ${eventText}.`);

        // Callback for external handling
        onDateSelect?.(date, dateEvents);
      }
    },
    [getEventsForDate, onDateSelect],
  );

  // Handle category toggle
  const handleCategoryToggle = async (category: EventCategory) => {
    setIsLoading(true);

    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];

    setSelectedCategories(newCategories);

    const action = selectedCategories.includes(category)
      ? "desactivado"
      : "activado";
    const categoryLabel = getCategoryConfig(category).label;
    setAnnounceText(`Filtro ${categoryLabel} ${action}.`);

    setIsLoading(false);
  };

  // Handle export - browser-safe
  const handleExport = async (format: CalendarExportFormat) => {
    // Only run on client side
    if (typeof window === "undefined" || typeof document === "undefined") {
      console.warn("Export only available on client side");
      setAnnounceText("Exportar solo disponible en navegador");
      return;
    }

    try {
      const query: CalendarQuery = {
        categories: selectedCategories,
        ...(searchTerm && { search: searchTerm }),
      };

      // Convert format to lowercase and handle ICAL -> ics conversion
      const formatLower =
        format === "ICAL"
          ? "ics"
          : (format.toLowerCase() as "json" | "csv" | "ics");
      const result = await exportCalendarEventsAction(formatLower);

      if (result.success && result.data) {
        // Create download - result.data has content property
        const exportData: any = result.data;
        const contentType =
          exportData.mimeType ||
          (format === "CSV"
            ? "text/csv"
            : format === "JSON"
              ? "application/json"
              : "text/calendar");
        const filename =
          exportData.filename || `calendario.${format.toLowerCase()}`;

        const blob = new Blob([exportData.content], {
          type: contentType,
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setAnnounceText(
          t("calendar.export_success").replace(
            "{{format}}",
            format.toUpperCase(),
          ),
        );
      }
    } catch (error) {
      console.error("Error exporting calendar:", error);
      setAnnounceText(t("calendar.export_generic_error"));
    }
  };

  // Touch gesture handlers - hydration-safe
  const onTouchStart = (e: React.TouchEvent) => {
    if (typeof window === "undefined") return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (typeof window === "undefined") return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (typeof window === "undefined" || !touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentMonth(addMonths(safeCurrentMonth, 1));
      setAnnounceText("Navegando al mes siguiente");
    } else if (isRightSwipe) {
      setCurrentMonth(subMonths(safeCurrentMonth, 1));
      setAnnounceText("Navegando al mes anterior");
    }
  };

  // Month-specific gradient backgrounds with consistent seasonal transitions
  const getMonthGradient = (month: Date): string => {
    const monthIndex = month.getMonth();

    // Enhanced seasonal color progression for consistent transitions
    const monthGradients = {
      0: "from-yellow-400 via-yellow-300 to-yellow-500", // January - Summer (smaller white part, more left)
      1: "from-yellow-400 via-amber-400 to-orange-400", // February - Lighter beginning to match January
      2: "from-amber-600 via-green-500 to-emerald-600", // March - Brown to Mossy Green to April"s green
      3: "from-emerald-600 via-teal-500 to-cyan-500", // April - Mossy green to bluish
      4: "from-cyan-400 via-blue-400 to-blue-500", // May - Late Autumn (cooler tones) - MORE BLUISH
      5: "from-blue-500 via-blue-600 to-blue-600", // June - Winter (cool & serene) - PERFECT LOOP
      6: "from-blue-600 via-slate-500 to-slate-600", // July - Deep Winter (deep cool) - DEEP BLUE TO GRAYISH
      7: "from-slate-600 via-gray-500 to-slate-400", // August - Gray gradient banner (dark to light)
      8: "from-slate-400 via-purple-400 to-violet-500", // September - Spring (light gray to purplish)
      9: "from-violet-500 via-purple-500 to-fuchsia-400", // October - Late Spring (floral)
      10: "from-fuchsia-400 via-pink-400 to-rose-400", // November - Early Summer (warm transition)
      11: "from-rose-400 via-orange-400 to-yellow-400", // December - Summer (bright & festive)
    };

    return (
      monthGradients[monthIndex as keyof typeof monthGradients] ||
      "from-gray-400 to-gray-500"
    );
  };

  // Enhanced category system - covers ALL EventCategory values
  const categorySystem: Record<
    EventCategory,
    {
      label: string;
      color: string;
      accent: string;
      border: string;
      icon: string;
    }
  > = {
    ADMIN: {
      label: "Administración",
      color:
        "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300",
      accent: "bg-violet-500",
      border: "border-violet-200 dark:border-violet-800",
      icon: "🛡️",
    },
    PROFESOR: {
      label: "Profesores",
      color:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
      accent: "bg-emerald-500",
      border: "border-emerald-200 dark:border-emerald-800",
      icon: "👨‍🏫",
    },
    ACTIVITY: {
      label: "Actividades",
      color: "bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300",
      accent: "bg-teal-500",
      border: "border-teal-200 dark:border-teal-800",
      icon: "🎯",
    },
    CULTURAL: {
      label: "Cultural",
      color:
        "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/30 dark:text-fuchsia-300",
      accent: "bg-fuchsia-500",
      border: "border-fuchsia-200 dark:border-fuchsia-800",
      icon: "🎭",
    },
    SPORTS: {
      label: "Deportes",
      color: "bg-lime-50 text-lime-700 dark:bg-lime-950/30 dark:text-lime-300",
      accent: "bg-lime-500",
      border: "border-lime-200 dark:border-lime-800",
      icon: "⚽",
    },
    PLANNING: {
      label: "Planificación",
      color: "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300",
      accent: "bg-sky-500",
      border: "border-sky-200 dark:border-sky-800",
      icon: "📋",
    },
    ACADEMIC: {
      label: "Académico",
      color: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
      accent: "bg-blue-500",
      border: "border-blue-200 dark:border-blue-800",
      icon: "📚",
    },
    HOLIDAY: {
      label: "Feriado",
      color: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
      accent: "bg-red-500",
      border: "border-red-200 dark:border-red-800",
      icon: "🎈",
    },
    MEETING: {
      label: "Reuniones",
      color:
        "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300",
      accent: "bg-purple-500",
      border: "border-purple-200 dark:border-purple-800",
      icon: "👥",
    },
    EVENT: {
      label: "Eventos",
      color:
        "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300",
      accent: "bg-green-500",
      border: "border-green-200 dark:border-green-800",
      icon: "⭐",
    },
    SPECIAL: {
      label: "Especial",
      color: "bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-300",
      accent: "bg-pink-500",
      border: "border-pink-200 dark:border-pink-800",
      icon: "🎁",
    },
    PARENT: {
      label: "Padres",
      color:
        "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300",
      accent: "bg-indigo-500",
      border: "border-indigo-200 dark:border-indigo-800",
      icon: "👨‍��‍👧‍👦",
    },
    ADMINISTRATIVE: {
      label: "Administrativo",
      color:
        "bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-300",
      accent: "bg-slate-500",
      border: "border-slate-200 dark:border-slate-800",
      icon: "📄",
    },
    EXAM: {
      label: "Exámenes",
      color:
        "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300",
      accent: "bg-orange-500",
      border: "border-orange-200 dark:border-orange-800",
      icon: "📝",
    },
    VACATION: {
      label: "Vacaciones",
      color: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-300",
      accent: "bg-cyan-500",
      border: "border-cyan-200 dark:border-cyan-800",
      icon: "🏖️",
    },
    DEADLINE: {
      label: "Fechas Límite",
      color:
        "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-300",
      accent: "bg-yellow-500",
      border: "border-yellow-200 dark:border-yellow-800",
      icon: "⏰",
    },
    OTHER: {
      label: "Otros",
      color: "bg-gray-50 text-gray-700 dark:bg-gray-950/30 dark:text-gray-300",
      accent: "bg-gray-500",
      border: "border-gray-200 dark:border-gray-800",
      icon: "📌",
    },
  };

  // Helper function to safely access categorySystem with fallback
  const getCategoryConfig = (category: EventCategory) => {
    return (
      categorySystem[category as keyof typeof categorySystem] ||
      categorySystem.OTHER
    );
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  // Grid Calendar Component - memoized to avoid creating during render
  const GridCalendar = useMemo(() => {
    const monthStart = startOfMonth(safeCurrentMonth);
    const monthEnd = endOfMonth(safeCurrentMonth);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - getDay(monthStart) + 1);

    const calendarDays: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      calendarDays.push(day);
    }

    return (
      <div
        className="bg-card rounded-xl border border-border shadow-sm overflow-hidden relative z-10"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Calendar Header */}
        <div
          className={cn(
            "bg-linear-to-r px-4 sm:px-6 py-3 sm:py-4 relative overflow-hidden transition-all duration-700 ease-in-out",
            getMonthGradient(safeCurrentMonth),
          )}
        >
          {/* Subtle overlay pattern for depth */}
          <div className="absolute inset-0 bg-linear-to-b from-white/10 via-transparent to-black/10 pointer-events-none" />
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(subMonths(safeCurrentMonth, 1))}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 text-white touch-manipulation focus:outline-none focus:ring-2 focus:ring-white/60 shadow-lg hover:shadow-xl"
                aria-label={t("calendar.previous_month", "common")}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm" />
              </Button>
              <h3 className="text-base sm:text-xl font-bold text-white drop-shadow-lg">
                {format(safeCurrentMonth, "MMMM yyyy", { locale: es }).replace(
                  /\b\w/g,
                  (l) => l.toUpperCase(),
                )}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(safeCurrentMonth, 1))}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 text-white touch-manipulation focus:outline-none focus:ring-2 focus:ring-white/60 shadow-lg hover:shadow-xl"
                aria-label={t("calendar.next_month", "common")}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm" />
              </Button>
            </div>
            <div className="text-white/90 text-xs sm:text-sm font-medium drop-shadow-md bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
              {monthEvents.length} {t("calendar.events", "common")}
            </div>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-muted/50">
          {(
            (language === "es"
              ? (commonES as any).calendar?.weekdays
              : (commonEN as any).calendar?.weekdays) || [
              "Dom",
              "Lun",
              "Mar",
              "Mié",
              "Jue",
              "Vie",
              "Sáb",
            ]
          ).map((day: string) => (
            <div
              key={day}
              className="text-center py-2 text-sm font-semibold text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, safeCurrentMonth);
            const isCurrentDay = isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <motion.div
                key={index}
                className={cn(
                  "relative border-r border-b border-border min-h-[80px] p-2 overflow-hidden z-10",
                  !isCurrentMonth && "bg-muted/30",
                  index % 7 === 6 && "border-r-0",
                  index >= 35 && "border-b-0",
                )}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => handleDateSelect(day)}
                  className={cn(
                    "w-full h-full flex flex-col items-start text-left p-1",
                    isCurrentDay && "bg-primary/20 ring-2 ring-primary",
                    isSelected &&
                      "bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-500",
                    !isSelected && !isCurrentDay && "hover:bg-muted/50",
                  )}
                >
                  <div
                    className={cn(
                      "text-sm font-semibold",
                      isCurrentDay && "text-primary",
                      !isCurrentMonth && "text-muted-foreground/50",
                    )}
                  >
                    {format(day, "d")}
                  </div>

                  {/* Event indicators */}
                  {dayEvents.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1 w-full">
                      {dayEvents
                        .slice(0, isMobileView ? 1 : 3)
                        .map((event, idx) => (
                          <div
                            key={event.id}
                            className={cn(
                              "text-xs px-1 py-0.5 rounded truncate",
                              getCategoryConfig(event.category).color,
                              "border",
                              getCategoryConfig(event.category).border,
                            )}
                            title={event.title}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventSelect?.(event);
                            }}
                          >
                            <span className="mr-1">
                              {getCategoryConfig(event.category).icon}
                            </span>
                            {event.title}
                          </div>
                        ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayEvents.length - 3} más
                        </div>
                      )}
                    </div>
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }, [
    safeCurrentMonth,
    monthEvents.length,
    selectedDate,
    isMobileView,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    t,
    handleDateSelect,
    getEventsForDate,
    language,
    // getCategoryConfig and getMonthGradient are pure functions and don't need to be in deps
  ]);

  // Compact view for when mode is compact
  if (mode === "compact") {
    return (
      <AdaptiveCard variant={context} className={className}>
        <AdaptiveCardHeader className="pb-4">
          <AdaptiveCardTitle className="text-lg">
            {t("calendar.title")}
          </AdaptiveCardTitle>
        </AdaptiveCardHeader>
        <AdaptiveCardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border"
            locale={es}
          />
          {selectedDate && (
            <div className="mt-4 space-y-2">
              {getEventsForDate(selectedDate).map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "p-2 border rounded text-sm",
                    context === "public"
                      ? "border-gray-600/50 bg-gray-800/50"
                      : "border-border bg-card",
                  )}
                >
                  <div
                    className={cn(
                      "font-medium",
                      context === "public" ? "text-white" : "text-foreground",
                    )}
                  >
                    {event.title}
                  </div>
                  <div
                    className={cn(
                      "text-xs",
                      context === "public"
                        ? "text-gray-300"
                        : "text-muted-foreground",
                    )}
                  >
                    {getCategoryConfig(event.category).label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdaptiveCardContent>
      </AdaptiveCard>
    );
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <motion.div
      className={cn("space-y-4 relative overflow-hidden", className)}
      style={{ height }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Screen Reader Announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announceText}
      </div>

      {/* Enhanced Header with Stats */}
      {mode === "full" && statistics && (
        <motion.div variants={cardVariants}>
          <AdaptiveCard
            variant={context}
            className={cn(
              context === "public"
                ? "bg-linear-to-r from-gray-900/90 to-gray-800/90 border-gray-600/50"
                : "bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
            )}
          >
            <AdaptiveCardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {monthEvents.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Este mes
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{statistics.total}</div>
                    <div className="text-sm text-muted-foreground">
                      Total eventos
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {upcomingEvents.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Próximos
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Filter className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {selectedCategories.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Categorías activas
                    </div>
                  </div>
                </div>
              </div>
            </AdaptiveCardContent>
          </AdaptiveCard>
        </motion.div>
      )}

      {/* Controls Bar */}
      <motion.div variants={cardVariants}>
        <AdaptiveCard variant={context}>
          <AdaptiveCardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <AdaptiveCardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                {t("calendar.controls")}
              </AdaptiveCardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  aria-label="Actualizar calendario"
                >
                  <RefreshCw
                    className={cn("w-4 h-4", isRefreshing && "animate-spin")}
                  />
                </Button>
                {shouldShowExport && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport("CSV")}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport("ICAL")}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      iCal
                    </Button>
                  </>
                )}
              </div>
            </div>
          </AdaptiveCardHeader>
          <AdaptiveCardContent>
            <div className="space-y-4">
              {/* Search */}
              {showSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t("calendar.search_events", "common")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}

              {/* Category Filters - Mega Menu Dropdown */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <span>
                        Categorías
                        {selectedCategories.length > 0 &&
                          ` (${selectedCategories.length})`}
                      </span>
                    </span>
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[calc(100vw-2rem)] sm:w-[600px] md:w-[700px] lg:w-[900px] p-4"
                  align="start"
                  sideOffset={8}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">
                        Filtrar por Categorías
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 text-xs"
                        onClick={() => {
                          if (
                            selectedCategories.length ===
                            (Object.keys(categorySystem) as EventCategory[])
                              .length
                          ) {
                            setSelectedCategories([]);
                          } else {
                            setSelectedCategories(
                              Object.keys(categorySystem) as EventCategory[],
                            );
                          }
                        }}
                      >
                        {selectedCategories.length ===
                        (Object.keys(categorySystem) as EventCategory[]).length
                          ? "Deseleccionar todo"
                          : "Seleccionar todo"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[500px] overflow-y-auto">
                      {(Object.keys(categorySystem) as EventCategory[]).map(
                        (category) => {
                          const config = getCategoryConfig(category);
                          const isSelected =
                            selectedCategories.includes(category);
                          const eventCount =
                            statistics?.byCategory[category] || 0;
                          return (
                            <button
                              key={category}
                              onClick={() => handleCategoryToggle(category)}
                              className={cn(
                                "relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left",
                                "hover:shadow-md hover:scale-[1.02]",
                                isSelected
                                  ? cn(config.color, config.border, "border-2")
                                  : "bg-card border-border hover:border-primary/50",
                              )}
                            >
                              <span className="text-xl">{config.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                  {config.label}
                                </div>
                                <div className="text-xs opacity-60">
                                  {eventCount}{" "}
                                  {eventCount === 1 ? "evento" : "eventos"}
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 shrink-0" />
                              )}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </AdaptiveCardContent>
        </AdaptiveCard>
      </motion.div>

      {/* Main Calendar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div variants={cardVariants} className="lg:col-span-2">
          <AdaptiveCard variant={context}>
            <AdaptiveCardContent className="p-6">
              {GridCalendar}
            </AdaptiveCardContent>
          </AdaptiveCard>
        </motion.div>

        {/* Events Sidebar */}
        <motion.div variants={cardVariants} className="space-y-4">
          {/* Selected Date Events */}
          <AdaptiveCard variant={context}>
            <AdaptiveCardHeader>
              <AdaptiveCardTitle className="text-lg">
                {selectedDate
                  ? format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })
                  : t("calendar.select_date", "common")}
              </AdaptiveCardTitle>
            </AdaptiveCardHeader>
            <AdaptiveCardContent>
              <AnimatePresence mode="wait">
                {selectedDateEvents.length > 0 ? (
                  <motion.div
                    key="events"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {selectedDateEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 rounded-lg border bg-card cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => onEventSelect?.(event)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              getCategoryConfig(event.category).color,
                            )}
                          >
                            {getCategoryConfig(event.category).icon}{" "}
                            {getCategoryConfig(event.category).label}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-xs text-muted-foreground">
                            {event.description}
                          </p>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </div>
                        )}
                        {!event.isAllDay && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" />
                            {format(event.startDate, "HH:mm")} -{" "}
                            {format(event.endDate, "HH:mm")}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.p
                    key="no-events"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-muted-foreground text-center py-4"
                  >
                    No hay eventos programados para esta fecha.
                  </motion.p>
                )}
              </AnimatePresence>
            </AdaptiveCardContent>
          </AdaptiveCard>

          {/* Upcoming Events */}
          <AdaptiveCard variant={context}>
            <AdaptiveCardHeader>
              <AdaptiveCardTitle className="text-lg">
                Próximos Eventos
              </AdaptiveCardTitle>
            </AdaptiveCardHeader>
            <AdaptiveCardContent>
              <div className="space-y-2">
                {upcomingEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer hover:bg-muted/50 rounded px-2"
                    onClick={() => onEventSelect?.(event)}
                  >
                    <div>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(event.startDate, "dd MMM", { locale: es })}
                        {!event.isAllDay &&
                          ` - ${format(event.startDate, "HH:mm")}`}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getCategoryConfig(event.category).icon}
                    </Badge>
                  </div>
                ))}
              </div>
            </AdaptiveCardContent>
          </AdaptiveCard>

          {/* Month Summary */}
          {statistics && (
            <AdaptiveCard variant={context}>
              <AdaptiveCardHeader>
                <AdaptiveCardTitle className="text-lg">
                  Resumen de{" "}
                  {format(safeCurrentMonth, "MMMM yyyy", {
                    locale: es,
                  }).replace(/\b\w/g, (l) => l.toUpperCase())}
                </AdaptiveCardTitle>
              </AdaptiveCardHeader>
              <AdaptiveCardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">{monthEvents.length}</span>{" "}
                    eventos este mes
                  </div>
                  {Object.entries(categorySystem).map(([category, system]) => {
                    const count = statistics.byCategory[category] || 0;
                    if (count === 0) return null;
                    return (
                      <div
                        key={category}
                        className="flex justify-between text-xs items-center"
                      >
                        <span className="text-muted-foreground flex items-center">
                          <span className="mr-1">{system.icon}</span>
                          {system.label}
                        </span>
                        <span className="font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </AdaptiveCardContent>
            </AdaptiveCard>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
