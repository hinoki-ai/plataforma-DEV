"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { motion } from "motion/react";
import { useSession } from "@clerk/nextjs";

/**
 * Enhanced Josh welcome toast with animations, time-based greetings, and interactive elements
 * Shows personalized welcome messages with theme-aware Josh images
 */
export function JoshWelcomeToast() {
  const { resolvedTheme } = useTheme();
  const { t } = useDivineParsing();
  const { session } = useSession();
  const pathname = usePathname();
  const [hasShown, setHasShown] = useState(false);

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("welcome.morning", "¡Buenos días! 🌅");
    if (hour < 18) return t("welcome.afternoon", "¡Buenas tardes! ☀️");
    return t("welcome.evening", "¡Buenas noches! 🌙");
  };

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

  // Get contextual Josh personality message based on page and role
  const getJoshMessage = () => {
    const context = getPageContext();

    const contextualMessages = {
      admin: [
        t(
          "welcome.josh.admin.1",
          "¡Hola administrador! ¿Qué vamos a gestionar hoy?",
        ),
        t(
          "welcome.josh.admin.2",
          "¡Listo para mantener todo funcionando perfectamente!",
        ),
        t(
          "welcome.josh.admin.3",
          "¡Tu centro educativo te necesita! Vamos a trabajar juntos.",
        ),
      ],
      teacher: [
        t(
          "welcome.josh.teacher.1",
          "¡Hola profesor! ¿Qué clase vamos a preparar hoy?",
        ),
        t(
          "welcome.josh.teacher.2",
          "¡Tus estudiantes te esperan con entusiasmo!",
        ),
        t(
          "welcome.josh.teacher.3",
          "¡Vamos a hacer una jornada educativa increíble!",
        ),
      ],
      parent: [
        t(
          "welcome.josh.parent.1",
          "¡Hola apoderado! ¿Cómo podemos ayudar a tu estudiante?",
        ),
        t(
          "welcome.josh.parent.2",
          "¡Bienvenido a seguir el progreso de tu hijo!",
        ),
        t("welcome.josh.parent.3", "¡Estamos aquí para mantenerte informado!"),
      ],
      master: [
        t(
          "welcome.josh.master.1",
          "¡Hola maestro del sistema! ¿Qué operaciones avanzadas realizaremos?",
        ),
        t("welcome.josh.master.2", "¡Todo el sistema está bajo control!"),
        t(
          "welcome.josh.master.3",
          "¡Listo para optimizar la plataforma educativa!",
        ),
      ],
      general: [
        t("welcome.josh.1", "¡Estoy feliz de verte!"),
        t("welcome.josh.2", "¡Vamos a aprender juntos!"),
        t("welcome.josh.3", "¡Tu plataforma favorita te da la bienvenida!"),
        t("welcome.josh.4", "¡Listo para una jornada educativa increíble!"),
        t("welcome.josh.5", "¡Hola! ¿Qué vamos a crear hoy?"),
      ],
    };

    const messages =
      contextualMessages[context.section as keyof typeof contextualMessages] ||
      contextualMessages.general;
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Get contextual welcome message based on page
  const getContextualWelcomeMessage = () => {
    const context = getPageContext();

    const welcomeMessages = {
      admin: t("welcome.admin", "Panel de Administración - Plataforma Astral"),
      teacher: t("welcome.teacher", "Panel de Profesores - Plataforma Astral"),
      parent: t("welcome.parent", "Panel de Apoderados - Plataforma Astral"),
      master: t(
        "welcome.master",
        "Panel Maestro del Sistema - Plataforma Astral",
      ),
      general: t("welcome.message", "Bienvenido a Plataforma Astral"),
    };

    return (
      welcomeMessages[context.section as keyof typeof welcomeMessages] ||
      welcomeMessages.general
    );
  };

  useEffect(() => {
    // Only show if we haven't shown it this session and theme is resolved
    if (!hasShown && resolvedTheme) {
      const isDark = resolvedTheme === "dark";
      const joshImage = isDark
        ? "/josh-happy-dark.png"
        : "/josh-happy-light.png";

      // Create animated Josh icon
      const JoshIcon = () => (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{
            scale: 1,
            rotate: 0,
            transition: {
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1,
            },
          }}
          whileHover={{
            scale: 1.1,
            rotate: 10,
            transition: { duration: 0.2 },
          }}
          className="relative"
        >
          <motion.img
            src={joshImage}
            alt="Josh"
            className="w-10 h-10 rounded-full object-cover shadow-lg border-2 border-white dark:border-gray-700"
            animate={{
              y: [0, -2, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -top-1 -right-1 text-lg"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 0.5,
            }}
          >
            👋
          </motion.div>
        </motion.div>
      );

      // Show enhanced welcome toast
      toast.success(
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="font-bold text-lg">{getTimeBasedGreeting()}</div>
          <div className="text-sm opacity-90 mt-1">
            {getContextualWelcomeMessage()}
          </div>
        </motion.div>,
        {
          description: (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-2"
            >
              <div className="text-sm">{getJoshMessage()}</div>
              <div className="text-xs opacity-75 mt-1">
                {t(
                  "welcome.description",
                  "Tu plataforma educativa inteligente",
                )}
              </div>
            </motion.div>
          ),
          duration: 8000, // Longer duration for enhanced experience
          icon: <JoshIcon />,
          action: {
            label: t("welcome.action", "¡Genial!"),
            onClick: () => {
              // Add some fun interaction
              toast.success(t("welcome.fun", "¡Josh está feliz! 🎉"), {
                duration: 2000,
              });
            },
          },
        },
      );

      setHasShown(true);
    }
  }, [resolvedTheme, hasShown, t, session, pathname]);

  return null; // This component doesn't render anything visible
}
