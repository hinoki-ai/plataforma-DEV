"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "@clerk/nextjs";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { X, ArrowRight, ArrowLeft, Play, Pause } from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector
  position: "top" | "bottom" | "left" | "right";
  action?: "click" | "type" | "scroll";
  highlight?: boolean;
}

interface Tour {
  id: string;
  title: string;
  description: string;
  role: string;
  page: string;
  steps: TourStep[];
  autoStart?: boolean;
}

interface JoshTourProps {
  isActive: boolean;
  tourId: string | null;
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * Interactive Tour System with Josh Guidance
 * Provides step-by-step onboarding and feature discovery
 */
export function JoshTour({
  isActive,
  tourId,
  onComplete,
  onSkip,
}: JoshTourProps) {
  const { resolvedTheme } = useTheme();
  const { t } = useDivineParsing();
  const { session } = useSession();
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [tour, setTour] = useState<Tour | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const isDark = resolvedTheme === "dark";

  // Predefined tours based on role and page
  const tours: Record<string, Tour> = {
    "admin-dashboard": {
      id: "admin-dashboard",
      title: t("tour.admin.dashboard.title", "Admin Dashboard Tour"),
      description: t(
        "tour.admin.dashboard.description",
        "Learn how to manage your educational center",
      ),
      role: "admin",
      page: "/admin",
      autoStart: false,
      steps: [
        {
          id: "welcome",
          title: t(
            "tour.admin.dashboard.step1.title",
            "Welcome to Admin Panel",
          ),
          content: t(
            "tour.admin.dashboard.step1.content",
            "This is your central hub for managing the entire educational platform. Let's explore the key features.",
          ),
          target: "[data-tour='admin-dashboard']",
          position: "bottom",
          highlight: true,
        },
        {
          id: "navigation",
          title: t("tour.admin.dashboard.step2.title", "Navigation Menu"),
          content: t(
            "tour.admin.dashboard.step2.content",
            "Use this sidebar to access different management sections like users, calendar, and reports.",
          ),
          target: "[data-tour='admin-sidebar']",
          position: "right",
          action: "click",
        },
        {
          id: "users",
          title: t("tour.admin.dashboard.step3.title", "User Management"),
          content: t(
            "tour.admin.dashboard.step3.content",
            "Manage teachers, parents, and students. Create accounts and assign roles.",
          ),
          target: "[data-tour='admin-users']",
          position: "top",
        },
        {
          id: "calendar",
          title: t("tour.admin.dashboard.step4.title", "School Calendar"),
          content: t(
            "tour.admin.dashboard.step4.content",
            "Schedule events, holidays, and important dates for the entire school community.",
          ),
          target: "[data-tour='admin-calendar']",
          position: "top",
        },
      ],
    },
    "teacher-classbook": {
      id: "teacher-classbook",
      title: t("tour.teacher.classbook.title", "Class Book Management"),
      description: t(
        "tour.teacher.classbook.description",
        "Master the class book for attendance and grades",
      ),
      role: "teacher",
      page: "/profesor/libro-clases",
      autoStart: false,
      steps: [
        {
          id: "attendance",
          title: t("tour.teacher.classbook.step1.title", "Daily Attendance"),
          content: t(
            "tour.teacher.classbook.step1.content",
            "Start each day by marking student attendance. Click 'Marcar Todos Presentes' for quick entry.",
          ),
          target: "[data-tour='attendance-section']",
          position: "right",
          action: "click",
        },
        {
          id: "grades",
          title: t("tour.teacher.classbook.step2.title", "Grade Management"),
          content: t(
            "tour.teacher.classbook.step2.content",
            "Enter and update student grades regularly. Use the summary view to track progress.",
          ),
          target: "[data-tour='grades-section']",
          position: "left",
        },
        {
          id: "observations",
          title: t(
            "tour.teacher.classbook.step3.title",
            "Student Observations",
          ),
          content: t(
            "tour.teacher.classbook.step3.content",
            "Record important observations about student behavior and academic performance.",
          ),
          target: "[data-tour='observations-section']",
          position: "top",
        },
      ],
    },
    "parent-dashboard": {
      id: "parent-dashboard",
      title: t("tour.parent.dashboard.title", "Parent Portal Guide"),
      description: t(
        "tour.parent.dashboard.description",
        "Stay connected with your child's education",
      ),
      role: "parent",
      page: "/parent",
      autoStart: false,
      steps: [
        {
          id: "overview",
          title: t("tour.parent.dashboard.step1.title", "Student Overview"),
          content: t(
            "tour.parent.dashboard.step1.content",
            "Get a quick overview of your child's academic performance and recent activities.",
          ),
          target: "[data-tour='parent-overview']",
          position: "bottom",
        },
        {
          id: "communication",
          title: t("tour.parent.dashboard.step2.title", "Communication Hub"),
          content: t(
            "tour.parent.dashboard.step2.content",
            "Stay updated with school announcements and communicate with teachers.",
          ),
          target: "[data-tour='parent-communication']",
          position: "right",
        },
        {
          id: "meetings",
          title: t(
            "tour.parent.dashboard.step3.title",
            "Parent-Teacher Meetings",
          ),
          content: t(
            "tour.parent.dashboard.step3.content",
            "Schedule and manage meetings with your child's teachers.",
          ),
          target: "[data-tour='parent-meetings']",
          position: "left",
        },
      ],
    },
  };

  // Load tour based on tourId
  useEffect(() => {
    if (tourId && tours[tourId]) {
      setTour(tours[tourId]);
      setCurrentStep(0);
      setIsVisible(true);
    }
  }, [tourId]);

  // Position tooltip relative to target element
  const getTooltipPosition = (targetElement: Element | null) => {
    if (!targetElement || !tooltipRef.current) return { top: 0, left: 0 };

    const rect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const step = tour?.steps[currentStep];

    let top = 0;
    let left = 0;

    switch (step?.position) {
      case "top":
        top = rect.top - tooltipRect.height - 10;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        break;
      case "bottom":
        top = rect.bottom + 10;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.left - tooltipRect.width - 10;
        break;
      case "right":
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.right + 10;
        break;
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    left = Math.max(10, Math.min(left, viewportWidth - tooltipRect.width - 10));
    top = Math.max(10, Math.min(top, viewportHeight - tooltipRect.height - 10));

    return { top, left };
  };

  // Highlight target element
  const highlightElement = (selector: string) => {
    const element = document.querySelector(selector);
    if (element && overlayRef.current) {
      const rect = element.getBoundingClientRect();
      const overlay = overlayRef.current;

      // Create highlight effect
      overlay.innerHTML = `
        <div style="
          position: absolute;
          top: ${rect.top - 4}px;
          left: ${rect.left - 4}px;
          width: ${rect.width + 8}px;
          height: ${rect.height + 8}px;
          border: 3px solid #3b82f6;
          border-radius: 8px;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
          pointer-events: none;
          z-index: 9998;
          animation: pulse-highlight 2s infinite;
        "></div>
      `;
    }
  };

  // Handle step progression
  const nextStep = () => {
    if (!tour) return;

    if (currentStep < tour.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      setIsVisible(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onSkip();
    setIsVisible(false);
  };

  // Update highlight and position when step changes
  useEffect(() => {
    if (tour && isVisible) {
      const step = tour.steps[currentStep];
      if (step?.highlight && step.target) {
        setTimeout(() => {
          highlightElement(step.target);
          // Calculate position after element is highlighted
          const position = getTooltipPosition(
            document.querySelector(step.target),
          );
          setTooltipPosition(position);
        }, 100);
      }
    }
  }, [currentStep, tour, isVisible]);

  if (!isActive || !tour || !isVisible) return null;

  const step = tour.steps[currentStep];
  const progress = ((currentStep + 1) / tour.steps.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-step-content"
      >
        {/* Dark overlay with highlight */}
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-black/50 pointer-events-auto"
          onClick={skipTour}
        />

        {/* Tour tooltip */}
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="absolute z-[60] pointer-events-auto"
          style={tooltipPosition}
        >
          <div
            className={`max-w-sm p-6 rounded-lg shadow-2xl border-2 ${
              isDark
                ? "bg-gray-800 border-gray-600 text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <img
                    src={
                      isDark ? "/josh-happy-dark.png" : "/josh-happy-light.png"
                    }
                    alt=""
                    className="w-10 h-10 rounded-full border-2 border-white shadow-lg"
                    aria-hidden="true"
                  />
                </motion.div>
                <div>
                  <h3 className="font-bold text-lg">{step.title}</h3>
                  <p className="text-sm opacity-75">{tour.title}</p>
                </div>
              </div>
              <button
                onClick={skipTour}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors focus:ring-2 focus:ring-red-300"
                aria-label={t("tour.skip", "Omitir tour")}
                title={t("tour.skip", "Omitir tour")}
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Content */}
            <p id="tour-step-content" className="text-sm leading-relaxed mb-6">
              {step.content}
            </p>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>
                  {currentStep + 1} of {tour.steps.length}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-gray-300 disabled:focus:ring-0"
                aria-label={t(
                  "tour.previous.accessible",
                  "Ir al paso anterior del tour",
                )}
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>{t("tour.previous", "Previous")}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors focus:ring-2 focus:ring-gray-300"
                  aria-label={
                    isPaused
                      ? t("tour.resume", "Reanudar tour")
                      : t("tour.pause", "Pausar tour")
                  }
                  title={
                    isPaused
                      ? t("tour.resume", "Reanudar tour")
                      : t("tour.pause", "Pausar tour")
                  }
                >
                  {isPaused ? (
                    <Play className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Pause className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>

                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-300"
                  aria-label={
                    currentStep === tour.steps.length - 1
                      ? t(
                          "tour.finish.accessible",
                          "Finalizar tour interactivo",
                        )
                      : t(
                          "tour.next.accessible",
                          "Ir al siguiente paso del tour",
                        )
                  }
                >
                  <span>
                    {currentStep === tour.steps.length - 1
                      ? t("tour.finish", "Finish")
                      : t("tour.next", "Next")}
                  </span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Tour trigger component for Josh
export function TourTrigger({
  tourId,
  onStartTour,
}: {
  tourId: string;
  onStartTour: (id: string) => void;
}) {
  const { t } = useDivineParsing();

  return (
    <button
      onClick={() => onStartTour(tourId)}
      className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
    >
      <Play className="w-4 h-4" />
      <span>{t("tour.start", "Start Tour")}</span>
    </button>
  );
}
