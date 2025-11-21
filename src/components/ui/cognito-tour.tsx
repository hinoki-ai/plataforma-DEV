"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "@clerk/nextjs";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { ArrowRight, ArrowLeft, Play, Pause } from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string | string[]; // CSS selector or array of selectors
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

interface CognitoTourProps {
  isActive: boolean;
  tourId: string | null;
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * Interactive Tour System with Cognito Guidance
 * Provides step-by-step onboarding and feature discovery
 */
export function CognitoTour({
  isActive,
  tourId,
  onComplete,
  onSkip,
}: CognitoTourProps) {
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
            "This is your central hub for managing the entire educational platform. Let's explore all the key features together.",
          ),
          target: "[data-tour='admin-dashboard']",
          position: "bottom",
          highlight: true,
        },
        {
          id: "navigation",
          title: t(
            "tour.admin.dashboard.step2.title",
            "Navigation & User Management",
          ),
          content: t(
            "tour.admin.dashboard.step2.content",
            "Use the sidebar to navigate between sections. The user management area lets you create accounts and assign roles for teachers, parents, and students.",
          ),
          target: "[data-tour='admin-users']",
          position: "right",
          action: "click",
        },
        {
          id: "calendar",
          title: t("tour.admin.dashboard.step3.title", "School Calendar"),
          content: t(
            "tour.admin.dashboard.step3.content",
            "Schedule events, holidays, and important dates for the entire school community. This keeps everyone coordinated and informed.",
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
          id: "overview",
          title: t("tour.teacher.classbook.step1.title", "Class Book Overview"),
          content: t(
            "tour.teacher.classbook.step1.content",
            "Welcome to your digital class book. Here you can manage attendance, grades, and student observations all in one place.",
          ),
          target: [
            "[data-tour='attendance-section']",
            "[data-tour='grades-section']",
            "[data-tour='observations-section']",
          ],
          position: "right",
          highlight: true,
        },
        {
          id: "attendance",
          title: t(
            "tour.teacher.classbook.step2.title",
            "Daily Attendance Management",
          ),
          content: t(
            "tour.teacher.classbook.step2.content",
            "Start each day by marking student attendance. Click 'Marcar Todos Presentes' for quick entry when the whole class is present.",
          ),
          target: "[data-tour='attendance-section']",
          position: "right",
          action: "click",
        },
        {
          id: "grades-observations",
          title: t(
            "tour.teacher.classbook.step3.title",
            "Grades & Observations",
          ),
          content: t(
            "tour.teacher.classbook.step3.content",
            "Enter and update student grades regularly. Also record important observations about student behavior and academic performance.",
          ),
          target: [
            "[data-tour='grades-section']",
            "[data-tour='observations-section']",
          ],
          position: "left",
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
          title: t(
            "tour.parent.dashboard.step1.title",
            "Parent Portal Overview",
          ),
          content: t(
            "tour.parent.dashboard.step1.content",
            "Welcome to your parent portal! Here you can track your child's progress, communicate with teachers, and schedule meetings.",
          ),
          target: [
            "[data-tour='parent-overview']",
            "[data-tour='parent-communication']",
            "[data-tour='parent-meetings']",
          ],
          position: "bottom",
          highlight: true,
        },
        {
          id: "tracking",
          title: t("tour.parent.dashboard.step2.title", "Academic Tracking"),
          content: t(
            "tour.parent.dashboard.step2.content",
            "Get a quick overview of your child's academic performance, attendance, and recent activities in the overview section.",
          ),
          target: "[data-tour='parent-overview']",
          position: "bottom",
        },
        {
          id: "communication-meetings",
          title: t(
            "tour.parent.dashboard.step3.title",
            "Communication & Meetings",
          ),
          content: t(
            "tour.parent.dashboard.step3.content",
            "Stay updated with school announcements and schedule meetings with your child's teachers to discuss their progress.",
          ),
          target: [
            "[data-tour='parent-communication']",
            "[data-tour='parent-meetings']",
          ],
          position: "right",
        },
      ],
    },
    "admin-users": {
      id: "admin-users",
      title: t("tour.admin.users.title", "Managing School Users"),
      description: t(
        "tour.admin.users.description",
        "Add and manage teachers, parents, and students",
      ),
      role: "admin",
      page: "/admin/usuarios",
      autoStart: false,
      steps: [
        {
          id: "overview",
          title: t("tour.admin.users.step1.title", "All User Tools"),
          content: t(
            "tour.admin.users.step1.content",
            "See all users, add new ones, and find people here. This is your main area for managing school accounts.",
          ),
          target: [
            "[data-tour='user-list']",
            "[data-tour='add-user']",
            "[data-tour='user-search']",
          ],
          position: "bottom",
          highlight: true,
        },
        {
          id: "search",
          title: t("tour.admin.users.step2.title", "Finding Users"),
          content: t(
            "tour.admin.users.step2.content",
            "Type a name or email in the search box to quickly find any user. This helps when you have many people to manage.",
          ),
          target: "[data-tour='user-search']",
          position: "right",
        },
        {
          id: "adding",
          title: t("tour.admin.users.step3.title", "Adding New Users"),
          content: t(
            "tour.admin.users.step3.content",
            "Click 'Add User' to create accounts for teachers and parents. Fill in their name, email, and choose their role.",
          ),
          target: "[data-tour='add-user']",
          position: "right",
        },
      ],
    },
  };

  // Load tour based on tourId
  useEffect(() => {
    if (tourId && tours[tourId]) {
      console.log("Starting tour:", tourId);
      setTour(tours[tourId]);
      setCurrentStep(0);
      setIsVisible(true);
    } else if (tourId) {
      console.log("Tour not found:", tourId);
    }
  }, [tourId]);

  // Position tooltip relative to target element(s)
  const getTooltipPosition = (targetElements: Element | Element[] | null) => {
    if (!targetElements || !tooltipRef.current) return { top: 0, left: 0 };

    const elements = Array.isArray(targetElements)
      ? targetElements
      : [targetElements];
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const step = tour?.steps[currentStep];

    // Calculate combined bounding rectangle for all elements
    let minTop = Infinity,
      minLeft = Infinity,
      maxBottom = -Infinity,
      maxRight = -Infinity;

    elements.forEach((element) => {
      if (element) {
        const rect = element.getBoundingClientRect();
        minTop = Math.min(minTop, rect.top);
        minLeft = Math.min(minLeft, rect.left);
        maxBottom = Math.max(maxBottom, rect.bottom);
        maxRight = Math.max(maxRight, rect.right);
      }
    });

    const combinedRect = {
      top: minTop,
      left: minLeft,
      bottom: maxBottom,
      right: maxRight,
      width: maxRight - minLeft,
      height: maxBottom - minTop,
    };

    let top = 0;
    let left = 0;

    switch (step?.position) {
      case "top":
        top = combinedRect.top - tooltipRect.height - 10;
        left =
          combinedRect.left + combinedRect.width / 2 - tooltipRect.width / 2;
        break;
      case "bottom":
        top = combinedRect.bottom + 10;
        left =
          combinedRect.left + combinedRect.width / 2 - tooltipRect.width / 2;
        break;
      case "left":
        top =
          combinedRect.top + combinedRect.height / 2 - tooltipRect.height / 2;
        left = combinedRect.left - tooltipRect.width - 10;
        break;
      case "right":
        top =
          combinedRect.top + combinedRect.height / 2 - tooltipRect.height / 2;
        left = combinedRect.right + 10;
        break;
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    left = Math.max(10, Math.min(left, viewportWidth - tooltipRect.width - 10));
    top = Math.max(10, Math.min(top, viewportHeight - tooltipRect.height - 10));

    return { top, left };
  };

  // Highlight target element(s)
  const highlightElement = (selector: string | string[]) => {
    if (!overlayRef.current) return;

    const selectors = Array.isArray(selector) ? selector : [selector];
    const overlay = overlayRef.current;
    overlay.innerHTML = "";

    selectors.forEach((sel) => {
      const element = document.querySelector(sel);
      if (element) {
        const rect = element.getBoundingClientRect();

        // Create highlight effect for each element
        const highlightDiv = document.createElement("div");
        highlightDiv.style.cssText = `
          position: absolute;
          top: ${rect.top - 4}px;
          left: ${rect.left - 4}px;
          width: ${rect.width + 8}px;
          height: ${rect.height + 8}px;
          border: 3px solid #3b82f6;
          border-radius: 8px;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.85);
          pointer-events: none;
          z-index: 9998;
          animation: pulse-highlight 2s infinite;
        `;
        overlay.appendChild(highlightDiv);
      }
    });
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
        // Try multiple times with increasing delays to find elements
        let attempts = 0;
        const maxAttempts = 5;
        const findElements = () => {
          attempts++;
          highlightElement(step.target);
          // Calculate position after element is highlighted
          const selectors = Array.isArray(step.target)
            ? step.target
            : [step.target];
          const elements = selectors
            .map((sel) => document.querySelector(sel))
            .filter((el) => el !== null);

          if (elements.length > 0) {
            const position = getTooltipPosition(elements);
            setTooltipPosition(position);
          } else if (attempts < maxAttempts) {
            // Try again with longer delay
            setTimeout(findElements, attempts * 200);
          } else {
            console.log("Tour elements not found after", maxAttempts, "attempts:", selectors);
            // If no elements found, center the tooltip
            setTooltipPosition({
              top: window.innerHeight / 2 - 100,
              left: window.innerWidth / 2 - 150,
            });
          }
        };
        setTimeout(findElements, 200);
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
          className="absolute inset-0 bg-black/50 pointer-events-none"
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
                      isDark
                        ? "/cognito-happy-dark.png"
                        : "/cognito-happy-light.png"
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

// Tour trigger component for Cognito
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
