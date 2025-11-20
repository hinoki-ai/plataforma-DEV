"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useSession } from "@clerk/nextjs";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { Lightbulb, X, CheckCircle } from "lucide-react";

interface ProactiveSuggestion {
  id: string;
  type: "tip" | "warning" | "achievement" | "reminder";
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  priority: "low" | "medium" | "high";
  conditions: {
    page?: string;
    role?: string;
    timeSpent?: number;
    actions?: string[];
    lastInteraction?: number;
  };
  cooldown: number; // minutes
}

/**
 * Proactive Suggestions System
 * Monitors user behavior and provides timely, helpful suggestions
 */
export function JoshProactiveSuggestions() {
  const { t } = useDivineParsing();
  const { session } = useSession();
  const pathname = usePathname();
  const [currentSuggestion, setCurrentSuggestion] =
    useState<ProactiveSuggestion | null>(null);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(
    new Set(),
  );
  const [pageStartTime, setPageStartTime] = useState<number>(0);

  // Set initial page start time
  useEffect(() => {
    setPageStartTime(Date.now());
  }, []);
  const [userActions, setUserActions] = useState<string[]>([]);

  // Track user actions
  useEffect(() => {
    const handleUserAction = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target) {
        const action = `${event.type}:${target.tagName.toLowerCase()}`;
        setUserActions((prev) => [...prev.slice(-9), action]); // Keep last 10 actions
      }
    };

    // Track clicks and form submissions
    document.addEventListener("click", handleUserAction);
    document.addEventListener("submit", handleUserAction);

    return () => {
      document.removeEventListener("click", handleUserAction);
      document.removeEventListener("submit", handleUserAction);
    };
  }, []);

  // Reset page timer when pathname changes
  useEffect(() => {
    setPageStartTime(Date.now());
  }, [pathname]);

  // Get user context
  const getUserContext = () => {
    if (!session?.user) return { role: "guest", id: "guest" };
    const role = session.user.publicMetadata?.role as string;
    return {
      role: role || "guest",
      id: session.user.id,
      lastLogin: session.user.lastSignInAt,
    };
  };

  // Proactive suggestions database
  const suggestions: ProactiveSuggestion[] = useMemo(
    () => [
      {
        id: "teacher-attendance-reminder",
        type: "reminder",
        title: t(
          "proactive.teacher.attendance.title",
          "Don't forget to mark attendance",
        ),
        message: t(
          "proactive.teacher.attendance.message",
          "It's been a while since you updated student attendance. Keeping records current helps with school administration.",
        ),
        action: {
          label: t("proactive.teacher.attendance.action", "Go to Attendance"),
          onClick: () =>
            (window.location.href = "/profesor/libro-clases/asistencia"),
        },
        priority: "high",
        conditions: {
          page: "/profesor/libro-clases",
          role: "teacher",
          timeSpent: 300000, // 5 minutes
        },
        cooldown: 480, // 8 hours
      },
      {
        id: "parent-communication-tip",
        type: "tip",
        title: t(
          "proactive.parent.communication.title",
          "Stay connected with teachers",
        ),
        message: t(
          "proactive.parent.communication.message",
          "Regular communication with teachers helps monitor your child's progress. Check for new messages or updates.",
        ),
        action: {
          label: t(
            "proactive.parent.communication.action",
            "View Communications",
          ),
          onClick: () => (window.location.href = "/parent/comunicacion"),
        },
        priority: "medium",
        conditions: {
          role: "parent",
          timeSpent: 180000, // 3 minutes on any parent page
        },
        cooldown: 1440, // 24 hours
      },
      {
        id: "admin-calendar-check",
        type: "warning",
        title: t("proactive.admin.calendar.title", "Review upcoming events"),
        message: t(
          "proactive.admin.calendar.message",
          "There might be upcoming school events that need your attention. Regular calendar reviews ensure smooth school operations.",
        ),
        action: {
          label: t("proactive.admin.calendar.action", "Check Calendar"),
          onClick: () => (window.location.href = "/admin/calendario-escolar"),
        },
        priority: "medium",
        conditions: {
          role: "admin",
          page: "/admin",
          timeSpent: 120000, // 2 minutes
        },
        cooldown: 720, // 12 hours
      },
      {
        id: "teacher-grade-entry",
        type: "tip",
        title: t("proactive.teacher.grades.title", "Time to enter grades"),
        message: t(
          "proactive.teacher.grades.message",
          "Regular grade entry helps students and parents track academic progress. Consider updating recent assessments.",
        ),
        action: {
          label: t("proactive.teacher.grades.action", "Enter Grades"),
          onClick: () =>
            (window.location.href = "/profesor/libro-clases/calificaciones"),
        },
        priority: "medium",
        conditions: {
          page: "/profesor/libro-clases",
          role: "teacher",
          actions: ["click:button"], // After clicking buttons (likely navigation)
          timeSpent: 240000, // 4 minutes
        },
        cooldown: 1440, // 24 hours
      },
      {
        id: "first-time-admin",
        type: "achievement",
        title: t("proactive.admin.welcome.title", "Welcome to Administration!"),
        message: t(
          "proactive.admin.welcome.message",
          "As a new administrator, take a moment to explore the key features. Would you like a guided tour of the admin panel?",
        ),
        action: {
          label: t("proactive.admin.welcome.action", "Start Tour"),
          onClick: () => {
            // This would trigger the tour system
            const event = new CustomEvent("startJoshTour", {
              detail: { tourId: "admin-dashboard" },
            });
            window.dispatchEvent(event);
          },
        },
        priority: "high",
        conditions: {
          role: "admin",
          timeSpent: 60000, // 1 minute
        },
        cooldown: 10080, // 1 week
      },
      {
        id: "inactive-user-help",
        type: "tip",
        title: t("proactive.general.help.title", "Need some help?"),
        message: t(
          "proactive.general.help.message",
          "I notice you haven't interacted much. I'm here to help you get the most out of the platform. Click here to chat with me!",
        ),
        action: {
          label: t("proactive.general.help.action", "Chat with Josh"),
          onClick: () => {
            const event = new CustomEvent("openJoshChat");
            window.dispatchEvent(event);
          },
        },
        priority: "low",
        conditions: {
          timeSpent: 300000, // 5 minutes without significant interaction
        },
        cooldown: 60, // 1 hour
      },
    ],
    [t],
  );

  // Check if there are unselected options on the page that user needs to interact with
  const hasUnselectedOptions = useCallback((): boolean => {
    if (typeof window === "undefined" || typeof document === "undefined")
      return false;

    try {
      // Check if we're on a voting or selection page
      const isVotingPage =
        pathname.includes("/votaciones") || pathname.includes("/vote");

      // Check for RadioGroup components (Radix UI) - most common case
      const radioGroupElements = document.querySelectorAll(
        '[role="radiogroup"]',
      );
      if (radioGroupElements.length > 0) {
        for (const group of radioGroupElements) {
          const radios = group.querySelectorAll('input[type="radio"]');
          const hasSelected = Array.from(radios).some(
            (radio) => (radio as HTMLInputElement).checked,
          );
          // If there are 2+ options and none selected, user needs to make a choice
          // Be more strict on voting pages
          if (radios.length >= 2 && !hasSelected) {
            // On voting pages, always return true if options are unselected
            if (isVotingPage) {
              return true;
            }
            // On other pages, check if it's in a selection context
            const parent = group.closest(
              'form, [class*="vote"], [class*="option"], [class*="select"]',
            );
            if (parent) {
              return true;
            }
          }
        }
      }

      // Check for radio buttons that are part of a group but none are selected
      const radioGroups = document.querySelectorAll('input[type="radio"]');
      const radioGroupsMap = new Map<string, HTMLInputElement[]>();

      radioGroups.forEach((radio) => {
        const name = (radio as HTMLInputElement).name;
        if (name && name !== "" && name !== "vote-option") {
          if (!radioGroupsMap.has(name)) {
            radioGroupsMap.set(name, []);
          }
          radioGroupsMap.get(name)!.push(radio as HTMLInputElement);
        }
      });

      // Check if any radio group has no selected option
      for (const [name, radios] of radioGroupsMap) {
        const hasSelected = radios.some((radio) => radio.checked);
        // Only consider it unselected if there are 2+ options and none are selected
        if (radios.length >= 2 && !hasSelected) {
          // Check if it's in a voting or selection context
          const firstRadio = radios[0];
          const parent = firstRadio?.closest(
            'form, [class*="vote"], [class*="option"], [class*="select"], [class*="RadioGroup"]',
          );
          if (parent) {
            return true;
          }
        }
      }

      // Special check for voting page with "vote-option" name
      const voteOptions = document.querySelectorAll(
        'input[name="vote-option"]',
      );
      if (voteOptions.length >= 2) {
        const hasSelectedVote = Array.from(voteOptions).some(
          (radio) => (radio as HTMLInputElement).checked,
        );
        if (!hasSelectedVote) {
          return true;
        }
      }

      // Also check for any radio buttons with name="vote-option" (case-insensitive)
      const allVoteInputs = document.querySelectorAll(
        'input[type="radio"][name*="vote"], input[type="radio"][name*="option"]',
      );
      if (allVoteInputs.length >= 2) {
        const voteInputsArray = Array.from(allVoteInputs) as HTMLInputElement[];
        const voteInputsByName = new Map<string, HTMLInputElement[]>();

        voteInputsArray.forEach((input) => {
          const name = input.name;
          if (name) {
            if (!voteInputsByName.has(name)) {
              voteInputsByName.set(name, []);
            }
            voteInputsByName.get(name)!.push(input);
          }
        });

        // Check each group
        for (const [name, inputs] of voteInputsByName) {
          if (inputs.length >= 2) {
            const hasSelected = inputs.some((input) => input.checked);
            if (!hasSelected) {
              return true;
            }
          }
        }
      }
    } catch (error) {
      // If there's any error checking, don't block suggestions
      console.warn("Error checking for unselected options:", error);
      return false;
    }

    return false;
  }, [pathname]);

  // Check if suggestion should be shown
  const shouldShowSuggestion = useCallback(
    (suggestion: ProactiveSuggestion): boolean => {
      const context = getUserContext();
      const timeSpent = Date.now() - pageStartTime;

      // Check if already dismissed
      if (dismissedSuggestions.has(suggestion.id)) return false;

      // For the inactive-user-help suggestion, check if user has unselected options
      // Don't show Josh if user needs to select from options first
      if (suggestion.id === "inactive-user-help" && hasUnselectedOptions()) {
        return false;
      }

      // Check role condition
      if (
        suggestion.conditions.role &&
        context.role !== suggestion.conditions.role
      )
        return false;

      // Check page condition
      if (
        suggestion.conditions.page &&
        !pathname.includes(suggestion.conditions.page)
      )
        return false;

      // Check time spent condition
      if (
        suggestion.conditions.timeSpent &&
        timeSpent < suggestion.conditions.timeSpent
      )
        return false;

      // Check actions condition
      if (suggestion.conditions.actions) {
        const hasRequiredActions = suggestion.conditions.actions.some(
          (action) =>
            userActions.some((userAction) => userAction.includes(action)),
        );
        if (!hasRequiredActions) return false;
      }

      // Check cooldown (simplified - in real app would use localStorage)
      const lastShown = localStorage.getItem(
        `josh_suggestion_${suggestion.id}`,
      );
      if (lastShown) {
        const timeSinceLastShown = Date.now() - parseInt(lastShown);
        const cooldownMs = suggestion.cooldown * 60 * 1000;
        if (timeSinceLastShown < cooldownMs) return false;
      }

      return true;
    },
    [
      pageStartTime,
      dismissedSuggestions,
      pathname,
      userActions,
      hasUnselectedOptions,
      session,
    ],
  );

  // Monitor for option selection changes and hide Josh if user has unselected options
  useEffect(() => {
    const checkAndHideIfNeeded = () => {
      if (
        hasUnselectedOptions() &&
        currentSuggestion?.id === "inactive-user-help"
      ) {
        setCurrentSuggestion(null);
      }
    };

    // Check immediately
    checkAndHideIfNeeded();

    const handleOptionChange = () => {
      checkAndHideIfNeeded();
    };

    // Listen for changes on radio buttons and checkboxes
    document.addEventListener("change", handleOptionChange);
    document.addEventListener("click", handleOptionChange);

    // Also check periodically
    const interval = setInterval(checkAndHideIfNeeded, 2000);

    return () => {
      document.removeEventListener("change", handleOptionChange);
      document.removeEventListener("click", handleOptionChange);
      clearInterval(interval);
    };
  }, [currentSuggestion, hasUnselectedOptions]);

  // Find and show appropriate suggestion
  useEffect(() => {
    const checkSuggestions = () => {
      // Always check if user has unselected options first
      const hasUnselected = hasUnselectedOptions();

      // Don't show the inactive-user-help suggestion if user has unselected options
      if (hasUnselected && currentSuggestion?.id === "inactive-user-help") {
        setCurrentSuggestion(null);
      }

      // If user has unselected options, don't show the inactive-user-help suggestion
      // But allow other high/medium priority suggestions
      const filteredSuggestions = hasUnselected
        ? suggestions.filter((s) => s.id !== "inactive-user-help")
        : suggestions;

      // Prioritize high priority suggestions
      const highPriority = filteredSuggestions.filter(
        (s) => s.priority === "high" && shouldShowSuggestion(s),
      );

      const mediumPriority = filteredSuggestions.filter(
        (s) => s.priority === "medium" && shouldShowSuggestion(s),
      );

      const lowPriority = filteredSuggestions.filter(
        (s) => s.priority === "low" && shouldShowSuggestion(s),
      );

      const candidateSuggestions = [
        ...highPriority,
        ...mediumPriority,
        ...lowPriority,
      ];

      // Only set a new suggestion if we don't have one, or if current one should be replaced
      if (candidateSuggestions.length > 0) {
        // Don't replace if we already have a suggestion and it's still valid
        if (currentSuggestion && shouldShowSuggestion(currentSuggestion)) {
          return;
        }

        const randomSuggestion =
          candidateSuggestions[
            Math.floor(Math.random() * candidateSuggestions.length)
          ];
        setCurrentSuggestion(randomSuggestion);

        // Mark as shown
        localStorage.setItem(
          `josh_suggestion_${randomSuggestion.id}`,
          Date.now().toString(),
        );
      }
    };

    // Check immediately and then periodically
    const timer = setTimeout(checkSuggestions, 30000); // Check after 30 seconds
    const interval = setInterval(checkSuggestions, 120000); // Check every 2 minutes

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [
    pathname,
    userActions,
    pageStartTime,
    dismissedSuggestions,
    shouldShowSuggestion,
    hasUnselectedOptions,
    currentSuggestion,
    suggestions,
  ]);

  const dismissSuggestion = () => {
    if (currentSuggestion) {
      setDismissedSuggestions(
        (prev) => new Set([...prev, currentSuggestion.id]),
      );
      setCurrentSuggestion(null);
    }
  };

  const handleAction = () => {
    if (currentSuggestion?.action) {
      currentSuggestion.action.onClick();
      dismissSuggestion();
    }
  };

  if (!currentSuggestion) return null;

  const getIcon = () => {
    switch (currentSuggestion.type) {
      case "warning":
        return "⚠️";
      case "achievement":
        return "🏆";
      case "reminder":
        return "⏰";
      default:
        return "💡";
    }
  };

  const getPriorityColor = () => {
    switch (currentSuggestion.priority) {
      case "high":
        return "border-red-500 bg-red-50 dark:bg-red-900/20";
      case "medium":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
      default:
        return "border-blue-500 bg-blue-50 dark:bg-blue-900/20";
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9, rotateX: -15 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 25,
          },
        }}
        exit={{
          opacity: 0,
          y: 50,
          scale: 0.9,
          rotateX: 15,
          transition: { duration: 0.3 },
        }}
        className="fixed bottom-4 right-4 z-40 max-w-sm"
        style={{ perspective: 1000 }}
      >
        <motion.div
          className={`p-4 rounded-lg border-2 shadow-lg backdrop-blur-sm relative overflow-hidden ${getPriorityColor()}`}
          animate={{
            boxShadow: [
              "0 4px 20px rgba(0,0,0,0.1)",
              "0 8px 30px rgba(59,130,246,0.2)",
              "0 4px 20px rgba(0,0,0,0.1)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getIcon()}</span>
              <div>
                <h4 className="font-semibold text-sm">
                  {currentSuggestion.title}
                </h4>
              </div>
            </div>
            <button
              onClick={dismissSuggestion}
              className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
              title="Dismiss suggestion"
              aria-label="Dismiss suggestion"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            {currentSuggestion.message}
          </p>

          {currentSuggestion.action && (
            <div className="flex space-x-2">
              <button
                onClick={handleAction}
                className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-1"
              >
                <Lightbulb className="w-4 h-4" />
                <span>{currentSuggestion.action.label}</span>
              </button>
              <button
                onClick={dismissSuggestion}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium transition-colors"
              >
                {t("proactive.dismiss", "Later")}
              </button>
            </div>
          )}

          {/* Sparkle effects for high priority */}
          {currentSuggestion.priority === "high" && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                  style={{
                    top: `${20 + i * 10}%`,
                    right: `${10 + i * 5}%`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: [-5, -15, -5],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
