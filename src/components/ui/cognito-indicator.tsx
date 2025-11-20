"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { useSession } from "@clerk/nextjs";
import { CognitoChat } from "./cognito-chat";
import { CognitoTour } from "./cognito-tour";
import { useCognitoAnalytics } from "./cognito-analytics";
import { ErrorBoundary } from "./error-boundary";

/**
 * Floating Cognito indicator that appears in the bottom-right corner
 * Users can interact with it for fun messages and tips
 */
export function CognitoIndicator() {
  const { resolvedTheme } = useTheme();
  const { t } = useDivineParsing();
  const { session } = useSession();
  const pathname = usePathname();
  const analytics = useCognitoAnalytics();
  const [isVisible, setIsVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [cognitoDismissedForSession, setCognitoDismissedForSession] =
    useState(false);
  const [activeTour, setActiveTour] = useState<string | null>(null);
  const [isTourActive, setIsTourActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasInitialPosition, setHasInitialPosition] = useState(false);
  const [justFinishedDragging, setJustFinishedDragging] = useState(false);

  const isDark = resolvedTheme === "dark";
  const cognitoImage = isDark
    ? "/cognito-happy-dark.png"
    : "/cognito-happy-light.png";

  // Load saved position from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPosition = localStorage.getItem("cognito_position");
      if (savedPosition) {
        try {
          const { x, y } = JSON.parse(savedPosition);
          setPosition({ x, y });
        } catch (e) {
          // If parsing fails, use default position
          setPosition({
            x: window.innerWidth - 100,
            y: window.innerHeight - 100,
          });
        }
      } else {
        // Default position: bottom-right corner
        setPosition({
          x: window.innerWidth - 100,
          y: window.innerHeight - 100,
        });
      }
      setHasInitialPosition(true);
    }
  }, []);

  // Save position to localStorage when dragging ends
  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    setJustFinishedDragging(true);

    const newX = position.x + info.offset.x;
    const newY = position.y + info.offset.y;

    // Constrain to viewport bounds (accounting for element size ~80px)
    const maxX = typeof window !== "undefined" ? window.innerWidth - 80 : 0;
    const maxY = typeof window !== "undefined" ? window.innerHeight - 80 : 0;
    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));

    const newPosition = { x: constrainedX, y: constrainedY };
    setPosition(newPosition);

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("cognito_position", JSON.stringify(newPosition));
    }

    // Track drag interaction
    analytics.trackInteraction({
      type: "click",
      page: pathname,
      context: {
        role: getUserRole(),
        action: "cognito_repositioned",
      },
      metadata: { position: newPosition },
    });

    // Reset the flag after a short delay to allow clicks again
    setTimeout(() => {
      setJustFinishedDragging(false);
    }, 100);
  };

  // Get drag constraints based on viewport size
  const [dragConstraints, setDragConstraints] = useState({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateConstraints = () => {
        const maxX = window.innerWidth - 80;
        const maxY = window.innerHeight - 80;

        setDragConstraints({
          left: 0,
          right: maxX,
          top: 0,
          bottom: maxY,
        });

        // Adjust position if Cognito is outside viewport after resize
        setPosition((prev) => ({
          x: Math.max(0, Math.min(prev.x, maxX)),
          y: Math.max(0, Math.min(prev.y, maxY)),
        }));
      };

      updateConstraints();
      window.addEventListener("resize", updateConstraints);
      return () => window.removeEventListener("resize", updateConstraints);
    }
  }, []);

  // Get user role from session
  const getUserRole = () => {
    if (!session?.user) return "guest";
    const role = session.user.publicMetadata?.role as string;
    return role || "guest";
  };

  // Get contextual page information
  const getPageContext = () => {
    const role = getUserRole();
    if (pathname.includes("/admin")) return { role: "admin", section: "admin" };
    if (pathname.includes("/profesor"))
      return { role: "teacher", section: "profesor" };
    if (pathname.includes("/parent"))
      return { role: "parent", section: "parent" };
    if (pathname.includes("/master"))
      return { role: "master", section: "master" };
    return { role, section: "general" };
  };

  // Get appropriate tour for current context
  const getTourForContext = (context: any) => {
    if (context.section === "admin") return "admin-dashboard";
    if (context.section === "profesor" && pathname.includes("libro-clases"))
      return "teacher-classbook";
    if (context.section === "parent") return "parent-dashboard";
    return null;
  };

  const openChat = (
    source: "avatar" | "button" = "button",
    options?: { showGreeting?: boolean },
  ) => {
    setIsChatOpen(true);

    analytics.trackInteraction({
      type: "chat",
      page: pathname,
      context: {
        role: getUserRole(),
        action: "chat_opened",
      },
      metadata: { source },
    });

    if (options?.showGreeting !== false) {
      toast.success(t("cognito.chat.open", "¡Hola! ¿En qué puedo ayudarte?"), {
        duration: 2000,
      });
    }
  };

  const handleClick = () => {
    // Don't trigger click if we're dragging or just finished dragging
    if (isDragging || justFinishedDragging) {
      return;
    }

    // Track interaction
    analytics.trackInteraction({
      type: "click",
      page: pathname,
      context: {
        role: getUserRole(),
        action: "main_interaction",
      },
    });

    // If chat is minimized, reopen it by unminimizing
    if (isChatMinimized) {
      setIsChatMinimized(false);
      handleChatMinimizeChange(false);
      // Ensure chat is open
      if (!isChatOpen) {
        setIsChatOpen(true);
      }
    } else {
      // Simply open chat
      openChat("avatar");
    }
  };

  // Handle chat close - dismiss Cognito for session
  const handleChatClose = () => {
    setIsChatOpen(false);
    setCognitoDismissedForSession(true);

    // Track dismiss
    analytics.trackInteraction({
      type: "dismiss",
      page: pathname,
      context: {
        role: getUserRole(),
        action: "assistant_dismissed",
      },
    });
  };

  // Handle chat minimize/maximize
  const handleChatMinimizeChange = (minimized: boolean) => {
    setIsChatMinimized(minimized);
  };

  // Start tour function to pass to chat
  const startTour = () => {
    const context = getPageContext();
    const tourId = getTourForContext(context);
    if (tourId) {
      setActiveTour(tourId);
      setIsTourActive(true);

      // Track tour start
      analytics.trackInteraction({
        type: "tour",
        page: pathname,
        context: {
          role: context.role,
          action: "tour_started",
          response: tourId,
        },
      });

      toast.success(
        t("cognito.tour.starting", "¡Comenzando tour interactivo!"),
        {
          duration: 2000,
        },
      );
    } else {
      toast.info(
        t(
          "cognito.tour.not_available",
          "No hay tour disponible para esta página.",
        ),
        {
          duration: 2000,
        },
      );
    }
  };

  // Calculate if Cognito should be visible
  // Cognito is visible when: (chat is closed OR chat is minimized) AND not dismissed for session
  const shouldShowCognito =
    (!isChatOpen || isChatMinimized) && !cognitoDismissedForSession;

  return (
    <>
      {/* Chat Interface */}
      <ErrorBoundary
        fallback={
          <div className="fixed bottom-4 right-4 z-50 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-sm">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
              Error en el chat
            </h3>
            <p className="text-xs text-red-700 dark:text-red-300 mb-3">
              Lo sentimos, el asistente Cognito no está disponible
              temporalmente.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-800 dark:text-red-200 px-3 py-1 rounded transition-colors"
            >
              Recargar página
            </button>
          </div>
        }
      >
        <CognitoChat
          isOpen={isChatOpen}
          onToggle={handleChatClose}
          onMinimizeChange={handleChatMinimizeChange}
          onStartTour={startTour}
          getTourForContext={getTourForContext}
          getPageContext={getPageContext}
        />
      </ErrorBoundary>

      {/* Tour Interface */}
      <CognitoTour
        isActive={isTourActive}
        tourId={activeTour}
        onComplete={() => {
          setIsTourActive(false);
          setActiveTour(null);

          // Track tour completion
          analytics.trackInteraction({
            type: "tour",
            page: pathname,
            context: {
              role: getUserRole(),
              action: "tour_completed",
              response: activeTour || "unknown",
            },
          });

          toast.success(
            t(
              "cognito.tour.completed",
              "¡Tour completado! Ya sabes cómo usar esta sección.",
            ),
            {
              duration: 3000,
            },
          );
        }}
        onSkip={() => {
          setIsTourActive(false);
          setActiveTour(null);

          // Track tour skip
          analytics.trackInteraction({
            type: "tour",
            page: pathname,
            context: {
              role: getUserRole(),
              action: "tour_skipped",
              response: activeTour || "unknown",
            },
          });

          toast.info(
            t(
              "cognito.tour.skipped",
              "Tour omitido. Puedes iniciarlo nuevamente cuando lo necesites.",
            ),
            {
              duration: 2000,
            },
          );
        }}
      />

      <AnimatePresence>
        {shouldShowCognito && hasInitialPosition && (
          <motion.div
            initial={{ scale: 0, opacity: 0, x: position.x, y: position.y }}
            animate={{
              scale: 1,
              opacity: 1,
              x: position.x,
              y: position.y,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: hasInitialPosition ? 2 : 0, // Show after welcome toast
              },
            }}
            exit={{ scale: 0, opacity: 0 }}
            drag
            dragMomentum={false}
            dragElastic={0.1}
            dragConstraints={dragConstraints}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            className="fixed z-50 cursor-grab active:cursor-grabbing"
            style={{
              left: 0,
              top: 0,
            }}
          >
            <motion.div
              className="relative group cursor-pointer"
              whileHover={{ scale: isDragging ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClick}
            >
              {/* Cognito Image */}
              <motion.img
                src={cognitoImage}
                alt={t("cognito.alt", "Cognito - Educational Assistant")}
                className="w-20 h-20 cursor-pointer object-contain"
                role="button"
                tabIndex={0}
                aria-label={t(
                  "cognito.click.label",
                  "Click to interact with Cognito, your educational assistant",
                )}
                onClick={handleClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClick();
                  }
                }}
                whileHover={{
                  scale: 1.1,
                }}
                whileTap={{ scale: 0.95 }}
              />

              {/* Tooltip */}
              <div
                className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                role="tooltip"
                id="cognito-tooltip"
              >
                {t(
                  "cognito.tooltip",
                  "¡Haz clic en mí para chatear! Arrástrame para moverme",
                )}
                <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
