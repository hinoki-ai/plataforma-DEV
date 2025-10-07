"use client";

import { useState, useEffect, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import {
  format,
  isToday,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  motion,
  AnimatePresence,
  useSpring,
  useMotionValue,
} from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Users,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  chileanCalendarEvents,
  EventCategory,
  CalendarEvent,
} from "@/data/calendario/chilean-calendar-2025";
import { downloadICalendar } from "@/lib/utils/calendar-export";

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>(
    ["academic", "holiday", "special", "parent"],
  );
  const [announceText, setAnnounceText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"month" | "week" | "agenda">(
    "month",
  );
  const [eventDensity, setEventDensity] = useState<
    "compact" | "comfortable" | "spacious"
  >("comfortable");
  const [showConflicts, setShowConflicts] = useState<boolean>(true);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const filterVariants = {
    inactive: { scale: 1 },
    active: { scale: 1.05 },
    hover: { scale: 1 },
  };

  const monthTransitionVariants = {
    enter: {
      x: 300,
      opacity: 0,
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: {
      zIndex: 0,
      x: -300,
      opacity: 0,
    },
  };

  // Get events for the selected date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return chileanCalendarEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear() &&
        selectedCategories.includes(event.category)
      );
    });
  };

  // Get all events for current month
  const getEventsForMonth = (month: Date): CalendarEvent[] => {
    return chileanCalendarEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        isSameMonth(eventDate, month) &&
        selectedCategories.includes(event.category)
      );
    });
  };

  // Detect event conflicts
  const getEventConflicts = (date: Date): CalendarEvent[] => {
    const dayEvents = getEventsForDate(date);
    return dayEvents.filter((event, index) => {
      return dayEvents.some(
        (otherEvent, otherIndex) =>
          index !== otherIndex && event.time === otherEvent.time,
      );
    });
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const monthEvents = getEventsForMonth(currentMonth);
  const eventConflicts =
    selectedDate && showConflicts ? getEventConflicts(selectedDate) : [];

  // Accessibility: Handle date selection with announcements
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const events = getEventsForDate(date);
      const dateText = format(date, "d 'de' MMMM, yyyy", { locale: es });
      const eventText =
        events.length > 0
          ? `${events.length} evento${events.length > 1 ? "s" : ""} programado${events.length > 1 ? "s" : ""}`
          : "Sin eventos programados";
      setAnnounceText(`Fecha seleccionada: ${dateText}. ${eventText}.`);
    }
  };

  // Accessibility: Handle category filter changes with announcements
  const handleCategoryToggle = async (category: EventCategory) => {
    setIsLoading(true);

    // Simulate processing time for smooth animation
    await new Promise((resolve) => setTimeout(resolve, 150));

    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];

    setSelectedCategories(newCategories);

    const action = selectedCategories.includes(category)
      ? "desactivado"
      : "activado";
    const categoryLabel = categorySystem[category].label;
    setAnnounceText(`Filtro ${categoryLabel} ${action}.`);

    setIsLoading(false);
  };

  // Handle calendar export
  const handleExportCalendar = () => {
    try {
      downloadICalendar(selectedCategories);
      setAnnounceText(
        "Calendario exportado exitosamente. Archivo iCalendar descargado.",
      );
    } catch (error) {
      console.error("Error exporting calendar:", error);
      setAnnounceText(
        "Error al exportar el calendario. Por favor, intente nuevamente.",
      );
    }
  };

  // Handle month navigation with smooth transitions
  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  // Generate RSVP tracking
  const handleRSVP = (
    eventId: string,
    status: "attending" | "not-attending" | "maybe",
  ) => {
    // This would integrate with a backend RSVP system
    setAnnounceText(`RSVP actualizado para el evento.`);
  };

  // Keyboard navigation for calendar
  const handleKeyDown = (e: React.KeyboardEvent, day: Date) => {
    const currentIndex = calendarDays.findIndex(
      (d) => format(d, "yyyy-MM-dd") === format(day, "yyyy-MM-dd"),
    );

    let newIndex = currentIndex;
    const isFirstRow = currentIndex < 7;
    const isLastRow = currentIndex >= 35;
    const isFirstCol = currentIndex % 7 === 0;
    const isLastCol = currentIndex % 7 === 6;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        newIndex = isFirstCol ? currentIndex + 6 : currentIndex - 1;
        break;
      case "ArrowRight":
        e.preventDefault();
        newIndex = isLastCol ? currentIndex - 6 : currentIndex + 1;
        break;
      case "ArrowUp":
        e.preventDefault();
        newIndex = isFirstRow ? currentIndex + 35 : currentIndex - 7;
        break;
      case "ArrowDown":
        e.preventDefault();
        newIndex = isLastRow ? currentIndex - 35 : currentIndex + 7;
        break;
      case "PageUp":
        e.preventDefault();
        setCurrentMonth(subMonths(currentMonth, 1));
        setAnnounceText("Navegando al mes anterior");
        return;
      case "PageDown":
        e.preventDefault();
        setCurrentMonth(addMonths(currentMonth, 1));
        setAnnounceText("Navegando al mes siguiente");
        return;
      case "Home":
        e.preventDefault();
        handleDateSelect(startOfMonth(currentMonth));
        return;
      case "End":
        e.preventDefault();
        handleDateSelect(endOfMonth(currentMonth));
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        handleDateSelect(day);
        return;
      default:
        return;
    }

    if (newIndex >= 0 && newIndex < calendarDays.length) {
      const newDay = calendarDays[newIndex];
      handleDateSelect(newDay);

      // Focus the new day button
      setTimeout(() => {
        const dayButton = document.querySelector(
          `[aria-label*="${format(newDay, "d MMMM")}"]`,
        );
        if (dayButton instanceof HTMLElement) {
          dayButton.focus();
        }
      }, 100);
    }
  };

  // Focus management for calendar
  const calendarDays: Date[] = [];
  if (currentMonth) {
    const monthStart = startOfMonth(currentMonth);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - getDay(monthStart) + 1);

    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      calendarDays.push(day);
    }
  }

  // Month-specific gradient backgrounds with consistent seasonal transitions
  const getMonthGradient = (month: Date): string => {
    const monthIndex = month.getMonth();

    // Enhanced seasonal color progression for consistent transitions
    const monthGradients = {
      0: "from-yellow-400 via-yellow-300 to-yellow-500", // January - Summer (smaller white part, more left)
      1: "from-yellow-400 via-amber-400 to-orange-400", // February - Lighter beginning to match January
      2: "From-amber-600 Via-green-500 To-emerald-600", // March - Brown to Mossy Green to April"s green
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

  // Enhanced category system with elite Chilean school colors
  const categorySystem = {
    academic: {
      label: "Académico",
      color: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
      accent: "bg-blue-500",
      border: "border-blue-200 dark:border-blue-800",
      icon: "📚",
    },
    holiday: {
      label: "Feriado",
      color: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
      accent: "bg-red-500",
      border: "border-red-200 dark:border-red-800",
      icon: "🎉",
    },
    special: {
      label: "Evento Especial",
      color:
        "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300",
      accent: "bg-purple-500",
      border: "border-purple-200 dark:border-purple-800",
      icon: "✨",
    },
    parent: {
      label: "Actividad Padres",
      color:
        "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300",
      accent: "bg-green-500",
      border: "border-green-200 dark:border-green-800",
      icon: "👨‍👩‍👧‍👦",
    },
  };

  const categoryLabels: Record<EventCategory, string> = {
    academic: "Académico",
    holiday: "Feriado",
    special: "Evento Especial",
    parent: "Actividad Padres",
  };

  const categoryColors: Record<EventCategory, string> = {
    academic: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
    holiday: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
    special:
      "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300",
    parent:
      "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300",
  };

  // Get modifiers for dates with events
  const modifiers = {
    hasEvents: chileanCalendarEvents
      .filter((event) => selectedCategories.includes(event.category))
      .map((event) => new Date(event.date)),
  };

  // Supreme grid calendar component with mobile-first design and accessibility
  const GridCalendar = () => {
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [isMobileView, setIsMobileView] = useState(false);
    const [focusedDay, setFocusedDay] = useState<Date | null>(null);

    // Detect mobile view - hydration-safe
    useEffect(() => {
      if (typeof window === "undefined") return;

      const checkMobile = () => {
        if (typeof window === "undefined") return;
        setIsMobileView(window.innerWidth < 768);
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - getDay(monthStart) + 1);

    const calendarDays: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      calendarDays.push(day);
    }

    // Touch gesture handlers for mobile swipe navigation - hydration-safe
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
        setCurrentMonth(addMonths(currentMonth, 1));
        setAnnounceText("Navegando al mes siguiente");
      } else if (isRightSwipe) {
        setCurrentMonth(subMonths(currentMonth, 1));
        setAnnounceText("Navegando al mes anterior");
      }
    };

    // Keyboard navigation for calendar
    const handleGridKeyDown = (e: React.KeyboardEvent, day: Date) => {
      const currentIndex = calendarDays.findIndex(
        (d) => format(d, "yyyy-MM-dd") === format(day, "yyyy-MM-dd"),
      );

      let newIndex = currentIndex;
      const isFirstRow = currentIndex < 7;
      const isLastRow = currentIndex >= 35;
      const isFirstCol = currentIndex % 7 === 0;
      const isLastCol = currentIndex % 7 === 6;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          newIndex = isFirstCol ? currentIndex + 6 : currentIndex - 1;
          break;
        case "ArrowRight":
          e.preventDefault();
          newIndex = isLastCol ? currentIndex - 6 : currentIndex + 1;
          break;
        case "ArrowUp":
          e.preventDefault();
          newIndex = isFirstRow ? currentIndex + 35 : currentIndex - 7;
          break;
        case "ArrowDown":
          e.preventDefault();
          newIndex = isLastRow ? currentIndex - 35 : currentIndex + 7;
          break;
        case "PageUp":
          e.preventDefault();
          setCurrentMonth(subMonths(currentMonth, 1));
          setAnnounceText("Navegando al mes anterior");
          return;
        case "PageDown":
          e.preventDefault();
          setCurrentMonth(addMonths(currentMonth, 1));
          setAnnounceText("Navegando al mes siguiente");
          return;
        case "Home":
          e.preventDefault();
          handleDateSelect(startOfMonth(currentMonth));
          return;
        case "End":
          e.preventDefault();
          handleDateSelect(endOfMonth(currentMonth));
          return;
        case "Enter":
        case " ":
          e.preventDefault();
          handleDateSelect(day);
          return;
        case "Escape":
          setFocusedDay(null);
          return;
        default:
          return;
      }

      if (newIndex >= 0 && newIndex < calendarDays.length) {
        const newDay = calendarDays[newIndex];
        handleDateSelect(newDay);
        setFocusedDay(newDay);

        // Focus the new day button
        setTimeout(() => {
          const dayButton = document.querySelector(
            `[data-date="${format(newDay, "yyyy-MM-dd")}"]`,
          );
          if (dayButton instanceof HTMLElement) {
            dayButton.focus();
          }
        }, 100);
      }
    };

    return (
      <div
        className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        aria-label="Calendario escolar interactivo"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setFocusedDay(null);
          }
        }}
      >
        {/* Calendar Header - Responsive */}
        <div
          className={cn(
            "Bg-gradient-to-r Px-4 Sm:px-6 Py-3 Sm:py-4 Relative Overflow-hidden Transition-all Duration-700 Ease-in-out",
            getMonthGradient(currentMonth),
          )}
        >
          {/* Subtle overlay pattern for depth */}
          <div className="Absolute Inset-0 Bg-gradient-to-b From-white/10 Via-transparent To-black/10 Pointer-events-none" />
          <div className="Absolute Inset-0 Bg-gradient-to-r From-transparent Via-white/5 To-transparent Pointer-events-none" />
          <div className="Relative Z-10 Flex Items-center Justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="P-2 Rounded-full Bg-white/20 Hover:bg-white/30 Backdrop-blur-sm Transition-all Duration-300 Text-white Touch-manipulation Focus:outline-none Focus:ring-2 Focus:ring-white/60 Shadow-lg Hover:shadow-xl"
                aria-label="Mes anterior - Presiona Page Up para navegar más rápido"
              >
                <ChevronLeft className="W-4 H-4 Sm:w-5 Sm:h-5 Drop-shadow-sm" />
              </button>
              <h3
                className="Text-base Sm:text-xl Font-bold Text-white Drop-shadow-lg"
                aria-live="polite"
                aria-atomic="true"
              >
                {format(currentMonth, "MMMM yyyy", { locale: es }).replace(
                  /\b\w/g,
                  (l) => l.toUpperCase(),
                )}
              </h3>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="P-2 Rounded-full Bg-white/20 Hover:bg-white/30 Backdrop-blur-sm Transition-all Duration-300 Text-white Touch-manipulation Focus:outline-none Focus:ring-2 Focus:ring-white/60 Shadow-lg Hover:shadow-xl"
                aria-label="Mes siguiente - Presiona Page Down para navegar más rápido"
              >
                <ChevronRight className="W-4 H-4 Sm:w-5 Sm:h-5 Drop-shadow-sm" />
              </button>
            </div>
            <div
              className="Text-white/90 Text-xs Sm:text-sm Font-medium Drop-shadow-md Bg-black/20 Px-2 Py-1 Rounded-full Backdrop-blur-sm"
              aria-live="polite"
            >
              {monthEvents.length} eventos este mes
            </div>
          </div>
          {/* Mobile swipe hint */}
          {isMobileView && (
            <div
              className="Text-center Text-white/60 Text-xs Mt-2 Animate-pulse"
              aria-hidden="true"
            >
              ↔️ Desliza para cambiar de mes
            </div>
          )}
        </div>

        {/* Weekday Headers - Responsive with ARIA */}
        <div className="grid grid-cols-7 bg-muted/50">
          {[
            "Domingo",
            "Lunes",
            "Martes",
            "Miércoles",
            "Jueves",
            "Viernes",
            "Sábado",
          ].map((day, index) => (
            <div
              key={day}
              className="text-center py-2 sm:py-3 text-xs sm:text-sm font-semibold text-muted-foreground"
              aria-label={day}
            >
              {isMobileView ? day.substring(0, 1) : day.substring(0, 3)}
            </div>
          ))}
        </div>

        {/* Calendar Grid - Responsive heights with keyboard navigation */}
        <div className="grid grid-cols-7" aria-label="Días del calendario">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);
            const isSelected =
              selectedDate &&
              format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
            const dayId = `calendar-day-${format(day, "yyyy-MM-dd")}`;

            return (
              <motion.button
                key={index}
                className={cn(
                  "relative border-r border-b border-border w-full h-full flex flex-col items-start text-left rounded-lg transition-all duration-200",
                  "min-h-[60px] sm:min-h-[80px] p-1 sm:p-2",
                  !isCurrentMonth && "bg-muted/30",
                  index % 7 === 6 && "border-r-0",
                  index >= 35 && "border-b-0",
                  isCurrentDay && "bg-primary/20 ring-2 ring-primary",
                  isSelected &&
                    "bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-500",
                  !isSelected && !isCurrentDay && "hover:bg-muted/50",
                  "touch-manipulation focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                )}
                whileHover={{ scale: isMobileView ? 1 : 1.02 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleDateSelect(day)}
                onKeyDown={(e) => handleGridKeyDown(e, day)}
                aria-selected={isSelected ? "true" : "false"}
                aria-label={
                  `${format(day, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })} - ${
                    dayEvents.length
                  } evento${dayEvents.length !== 1 ? "s" : ""}` +
                  (isCurrentDay ? " - Hoy" : "") +
                  (isSelected ? " - Seleccionado" : "") +
                  (!isCurrentMonth ? " - Fuera del mes actual" : "")
                }
                data-date={format(day, "yyyy-MM-dd")}
                tabIndex={0}
              >
                <div
                  className={cn(
                    "text-xs sm:text-sm font-semibold",
                    isCurrentDay && "text-primary",
                    !isCurrentMonth && "text-muted-foreground/50",
                  )}
                  aria-hidden="true"
                >
                  {format(day, "d")}
                </div>

                {/* Mobile-optimized event indicators */}
                {dayEvents.length > 0 && (
                  <div className="flex flex-col gap-0.5 sm:gap-1 mt-0.5 sm:mt-1 w-full">
                    {dayEvents
                      .slice(0, isMobileView ? 1 : 3)
                      .map((event, idx) => (
                        <div
                          key={event.id}
                          className={cn(
                            "text-[10px] sm:text-xs px-0.5 sm:px-1 py-0.5 rounded truncate",
                            categorySystem[event.category].color,
                            categorySystem[event.category].border,
                            "border",
                            isMobileView && "hidden",
                          )}
                          title={event.title}
                          aria-hidden="true"
                        >
                          {!isMobileView && (
                            <span className="mr-1" aria-hidden="true">
                              {categorySystem[event.category].icon}
                            </span>
                          )}
                          {event.title}
                        </div>
                      ))}
                    {/* Mobile event count indicator */}
                    {isMobileView && (
                      <div
                        className={cn(
                          "text-[10px] w-4 h-4 rounded-full flex items-center justify-center",
                          categorySystem[dayEvents[0].category].accent,
                          "text-white font-bold",
                        )}
                        aria-label={`${dayEvents.length} evento${dayEvents.length !== 1 ? "s" : ""}`}
                      >
                        {dayEvents.length}
                      </div>
                    )}
                    {!isMobileView && dayEvents.length > 3 && (
                      <div
                        className="text-xs text-muted-foreground text-center"
                        aria-hidden="true"
                      >
                        +{dayEvents.length - 3} más
                      </div>
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.6, staggerChildren: 0.1 }}
    >
      {/* Screen Reader Live Region for Announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announceText}
      </div>

      {/* Enhanced Header with Stats */}
      <motion.div
        variants={cardVariants}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-0">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {monthEvents.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Eventos este mes
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {chileanCalendarEvents.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total del año
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {selectedCategories.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Categorías activas
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Clock className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">2025</div>
                  <div className="text-sm text-muted-foreground">
                    Año escolar
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      {/* Filter Controls */}
      <motion.div
        variants={cardVariants}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2" id="filters-title">
                <Filter className="w-5 h-5" />
                Filtros de Eventos
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleExportCalendar}
                aria-label="Exportar calendario en formato iCalendar para Google Calendar, Outlook, etc."
              >
                <Download className="w-4 h-4" />
                Exportar Calendario
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-labelledby="filters-title"
            >
              {(Object.keys(categoryLabels) as EventCategory[]).map(
                (category, index) => (
                  <motion.div
                    key={category}
                    variants={filterVariants}
                    initial="inactive"
                    animate={
                      selectedCategories.includes(category)
                        ? "active"
                        : "inactive"
                    }
                    whileHover="hover"
                    whileTap={{ scale: 0.95 }}
                    style={{ display: "inline-block" }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.2,
                      ease: "easeOut",
                    }}
                  >
                    <Badge
                      variant={
                        selectedCategories.includes(category)
                          ? "default"
                          : "outline"
                      }
                      className={cn(
                        "cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        "min-h-[28px] px-3 py-1.5 select-none flex items-center space-x-1.5",
                        selectedCategories.includes(category) &&
                          categorySystem[category].color,
                        isLoading && "pointer-events-none opacity-75",
                        "transition-all duration-200 hover:shadow-md",
                      )}
                      onClick={() =>
                        !isLoading && handleCategoryToggle(category)
                      }
                      onKeyDown={(e) => {
                        if (
                          !isLoading &&
                          (e.key === "Enter" || e.key === " ")
                        ) {
                          e.preventDefault();
                          handleCategoryToggle(category);
                        }
                      }}
                      role="checkbox"
                      aria-checked={selectedCategories.includes(category)}
                      aria-label={`Filtrar eventos de categoría ${categorySystem[category].label}`}
                      tabIndex={0}
                    >
                      <span>{categorySystem[category].icon}</span>
                      <span>{categorySystem[category].label}</span>
                      <span className="text-xs opacity-60">
                        (
                        {
                          chileanCalendarEvents.filter(
                            (e) => e.category === category,
                          ).length
                        }
                        )
                      </span>
                      {isLoading && (
                        <motion.span
                          className="ml-1 inline-block"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          ⟳
                        </motion.span>
                      )}
                    </Badge>
                  </motion.div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Calendar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          variants={cardVariants}
          className="lg:col-span-2"
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Card>
            <CardContent className="p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <GridCalendar />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Events Sidebar */}
        <motion.div
          variants={cardVariants}
          className="space-y-4"
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Selected Date Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg" id="selected-events-title">
                {selectedDate
                  ? format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })
                  : "Selecciona una fecha"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {selectedDateEvents.length > 0 ? (
                  <motion.div
                    key="events"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                    role="list"
                    aria-labelledby="selected-events-title"
                  >
                    {selectedDateEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 rounded-lg border bg-card focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                        role="listitem"
                        tabIndex={0}
                        aria-label={`Evento: ${event.title}. Categoría: ${categoryLabels[event.category]}. ${event.description || ""}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4
                            className="font-medium text-sm"
                            aria-hidden="true"
                          >
                            {event.title}
                          </h4>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              categorySystem[event.category].color,
                            )}
                            aria-label={`Categoría: ${categorySystem[event.category].label}`}
                          >
                            {categorySystem[event.category].icon}{" "}
                            {categorySystem[event.category].label}
                          </Badge>
                        </div>
                        {event.description && (
                          <p
                            className="text-xs text-muted-foreground"
                            aria-hidden="true"
                          >
                            {event.description}
                          </p>
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
                    role="status"
                    aria-live="polite"
                  >
                    No hay eventos programados para esta fecha.
                  </motion.p>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Month Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg" id="month-summary-title">
                Resumen de{" "}
                {format(currentMonth, "MMMM yyyy", { locale: es }).replace(
                  /\b\w/g,
                  (l) => l.toUpperCase(),
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="space-y-2"
                role="region"
                aria-labelledby="month-summary-title"
              >
                <div className="text-sm" aria-live="polite">
                  <span className="font-medium">{monthEvents.length}</span>{" "}
                  eventos este mes
                </div>
                {Object.entries(categorySystem).map(([category, system]) => {
                  const count = monthEvents.filter(
                    (e) => e.category === (category as EventCategory),
                  ).length;
                  if (count === 0) return null;
                  return (
                    <div
                      key={category}
                      className="flex justify-between text-xs items-center"
                      role="group"
                      aria-label={`${system.label}: ${count} eventos`}
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
            </CardContent>
          </Card>

          {/* Accessibility Instructions */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                ♿ Instrucciones de Navegación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div>
                  <strong>Teclado:</strong>
                </div>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>Flecha izquierda/derecha: cambiar día</li>
                  <li>Flecha arriba/abajo: cambiar semana</li>
                  <li>Page Up/Down: cambiar mes</li>
                  <li>Home/End: ir al primer/último día del mes</li>
                  <li>Enter/Espacio: seleccionar fecha</li>
                  <li>Tab: navegar entre elementos</li>
                </ul>
                <div>
                  <strong>Filtros:</strong> Use Enter o Espacio para
                  activar/desactivar categorías
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
