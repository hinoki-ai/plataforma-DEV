"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { useSession } from "@clerk/nextjs";
import { JoshChat } from "./josh-chat";
import { JoshTour } from "./josh-tour";
import { RippleButton, PulseNotification } from "./josh-animations";
import { useJoshAnalytics } from "./josh-analytics";
import { MessageCircle, Map } from "lucide-react";

/**
 * Floating Josh indicator that appears in the bottom-right corner
 * Users can interact with it for fun messages and tips
 */
export function JoshIndicator() {
  const { resolvedTheme } = useTheme();
  const { t } = useDivineParsing();
  const { session } = useSession();
  const pathname = usePathname();
  const analytics = useJoshAnalytics();
  const [isVisible, setIsVisible] = useState(true);
  const [clickCount, setClickCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTour, setActiveTour] = useState<string | null>(null);
  const [isTourActive, setIsTourActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasInitialPosition, setHasInitialPosition] = useState(false);
  const [justFinishedDragging, setJustFinishedDragging] = useState(false);

  const isDark = resolvedTheme === "dark";
  const joshImage = isDark ? "/josh-happy-dark.png" : "/josh-happy-light.png";

  // Load saved position from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPosition = localStorage.getItem("josh_position");
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
      localStorage.setItem("josh_position", JSON.stringify(newPosition));
    }

    // Track drag interaction
    analytics.trackInteraction({
      type: "click",
      page: pathname,
      context: {
        role: getUserRole(),
        action: "josh_repositioned",
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

        // Adjust position if Josh is outside viewport after resize
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
      toast.success(t("josh.chat.open", "¡Hola! ¿En qué puedo ayudarte?"), {
        duration: 2000,
      });
    }
  };

  const handleClick = () => {
    // Don't trigger click if we're dragging or just finished dragging
    if (isDragging || justFinishedDragging) {
      return;
    }

    const newCount = clickCount + 1;
    setClickCount(newCount);

    // Track interaction
    analytics.trackInteraction({
      type: "click",
      page: pathname,
      context: {
        role: getUserRole(),
        action: "main_interaction",
      },
      metadata: { clickCount: newCount },
    });
    const context = getPageContext();

    // Contextual tips based on user role and current page
    const getContextualTips = () => {
      const tips = {
        admin: [
          t(
            "josh.admin.tip.1",
            "¡Revisa el calendario escolar para eventos importantes! 📅",
          ),
          t(
            "josh.admin.tip.2",
            "¡Los profesores necesitan tu aprobación en las planificaciones! 📋",
          ),
          t(
            "josh.admin.tip.3",
            "¡Gestiona los usuarios del sistema eficientemente! 👥",
          ),
          t("josh.admin.tip.4", "¡Monitorea las reuniones de apoderados! 👨‍👩‍👧‍👦"),
          t("josh.admin.tip.5", "¡Mantén actualizado el libro de clases! 📖"),
        ],
        teacher: [
          t(
            "josh.teacher.tip.1",
            "¡Registra la asistencia diaria de tus estudiantes! ✅",
          ),
          t(
            "josh.teacher.tip.2",
            "¡Prepara tus planificaciones con anticipación! 📝",
          ),
          t(
            "josh.teacher.tip.3",
            "¡Ingresa las calificaciones regularmente! 📊",
          ),
          t("josh.teacher.tip.4", "¡Programa reuniones con apoderados! 👨‍👩‍👧‍👦"),
          t("josh.teacher.tip.5", "¡Revisa el calendario escolar! 📅"),
        ],
        parent: [
          t("josh.parent.tip.1", "¡Revisa el progreso de tu estudiante! 📈"),
          t("josh.parent.tip.2", "¡Participa en las votaciones del centro! 🗳️"),
          t("josh.parent.tip.3", "¡Programa reuniones con profesores! 👨‍🏫"),
          t("josh.parent.tip.4", "¡Mantente al día con las comunicaciones! 💬"),
          t("josh.parent.tip.5", "¡Revisa el libro de clases! 📖"),
        ],
        master: [
          t("josh.master.tip.1", "¡Monitorea la salud del sistema! 🔍"),
          t("josh.master.tip.2", "¡Gestiona múltiples instituciones! 🏫"),
          t("josh.master.tip.3", "¡Revisa los logs de auditoría! 📋"),
          t("josh.master.tip.4", "¡Optimiza el rendimiento del sistema! ⚡"),
          t("josh.master.tip.5", "¡Mantén la seguridad del sistema! 🔒"),
        ],
        general: [
          t("josh.tip.1", "¡Hola! ¿Necesitas ayuda?"),
          t("josh.tip.2", "¡Recuerda guardar tu trabajo! 💾"),
          t("josh.tip.3", "¡Explora todas las funcionalidades! ✨"),
          t("josh.tip.4", "¡Tus estudiantes te adoran! 👨‍👩‍👧‍👦"),
          t("josh.tip.5", "¡Eres increíble! 🌟"),
        ],
      };

      return tips[context.section as keyof typeof tips] || tips.general;
    };

    const messages = getContextualTips();

    const funMessages = [
      t("josh.fun.1", "¡Eso cosquillea! 😄"),
      t("josh.fun.2", "¡Más despacio! 🌀"),
      t("josh.fun.3", "¡Soy un Josh feliz! 🎈"),
      t("josh.fun.4", "¡Me encanta ayudarte! 💝"),
      t("josh.fun.5", "¡Sigamos trabajando juntos! 🤝"),
    ];

    if (newCount <= messages.length) {
      toast.success(messages[newCount - 1], {
        duration: 4000,
        icon: "🤖",
      });
    } else {
      toast.success(
        funMessages[Math.floor(Math.random() * funMessages.length)],
        {
          duration: 2000,
        },
      );
    }

    openChat("avatar", { showGreeting: false });
  };

  const handleDismiss = () => {
    setIsVisible(false);

    // Track dismiss
    analytics.trackInteraction({
      type: "dismiss",
      page: pathname,
      context: {
        role: getUserRole(),
        action: "assistant_dismissed",
      },
    });

    toast.info(
      t("josh.dismiss", "Josh se esconderá... pero puedes llamarme con Ctrl+J"),
      {
        duration: 4000,
      },
    );
  };

  // Add keyboard shortcut to show Josh again
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "j") {
        setIsVisible(true);
        toast.success(t("josh.back", "¡Josh está de vuelta! 👋"), {
          duration: 2000,
        });
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [t]);

  return (
    <>
      {/* Chat Interface */}
      <JoshChat isOpen={isChatOpen} onToggle={() => setIsChatOpen(false)} />

      {/* Tour Interface */}
      <JoshTour
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
              "josh.tour.completed",
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
              "josh.tour.skipped",
              "Tour omitido. Puedes iniciarlo nuevamente cuando lo necesites.",
            ),
            {
              duration: 2000,
            },
          );
        }}
      />

      <AnimatePresence>
        {isVisible && !isChatOpen && hasInitialPosition && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
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
              {/* Josh Image */}
              <motion.img
                src={joshImage}
                alt={t("josh.alt", "Josh - Educational Assistant")}
                className="w-20 h-20 cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={t(
                  "josh.click.label",
                  "Click to interact with Josh, your educational assistant",
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
                id="josh-tooltip"
              >
                {t("josh.tooltip", "¡Haz clic en mí! Arrástrame para moverme")}
                <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>

              {/* Tour button */}
              <RippleButton
                onClick={(e) => {
                  e.stopPropagation();
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
                      t("josh.tour.starting", "¡Comenzando tour interactivo!"),
                      {
                        duration: 2000,
                      },
                    );
                  }
                }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 hover:bg-purple-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center focus:opacity-100 focus:ring-2 focus:ring-purple-300"
                title={t("josh.tour.button", "Tour Interactivo")}
                aria-label={t(
                  "josh.tour.button.accessible",
                  "Start interactive tour with Josh",
                )}
                tabIndex={0}
              >
                <Map className="w-3 h-3" aria-hidden="true" />
              </RippleButton>

              {/* Chat button */}
              <RippleButton
                onClick={(e) => {
                  e.stopPropagation();
                  openChat("button");
                }}
                className="absolute -top-1 -left-1 w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center focus:opacity-100 focus:ring-2 focus:ring-green-300"
                title={t("josh.chat.button", "Chatear con Josh")}
                aria-label={t(
                  "josh.chat.button.accessible",
                  "Open chat with Josh, your educational assistant",
                )}
                tabIndex={0}
              >
                <MessageCircle className="w-3 h-3" aria-hidden="true" />
              </RippleButton>

              {/* Dismiss button */}
              <RippleButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss();
                }}
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center focus:opacity-100 focus:ring-2 focus:ring-red-300"
                title={t("josh.dismiss.button", "Hide Josh temporarily")}
                aria-label={t(
                  "josh.dismiss.accessible",
                  "Hide Josh assistant, can bring back with Ctrl+J",
                )}
                tabIndex={0}
              >
                ×
              </RippleButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
