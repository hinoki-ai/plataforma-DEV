"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { useSession } from "@clerk/nextjs";
import { JoshChat } from "./josh-chat";
import { MessageCircle } from "lucide-react";

/**
 * Floating Josh indicator that appears in the bottom-right corner
 * Users can interact with it for fun messages and tips
 */
export function JoshIndicator() {
  const { resolvedTheme } = useTheme();
  const { t } = useDivineParsing();
  const { session } = useSession();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [clickCount, setClickCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isDark = resolvedTheme === "dark";
  const joshImage = isDark ? "/josh-happy-dark.png" : "/josh-happy-light.png";

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
    if (pathname.includes("/profesor")) return { role: "teacher", section: "profesor" };
    if (pathname.includes("/parent")) return { role: "parent", section: "parent" };
    if (pathname.includes("/master")) return { role: "master", section: "master" };
    return { role, section: "general" };
  };

  const handleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    const context = getPageContext();

    // Contextual tips based on user role and current page
    const getContextualTips = () => {
      const tips = {
        admin: [
          t("josh.admin.tip.1", "¡Revisa el calendario escolar para eventos importantes! 📅"),
          t("josh.admin.tip.2", "¡Los profesores necesitan tu aprobación en las planificaciones! 📋"),
          t("josh.admin.tip.3", "¡Gestiona los usuarios del sistema eficientemente! 👥"),
          t("josh.admin.tip.4", "¡Monitorea las reuniones de apoderados! 👨‍👩‍👧‍👦"),
          t("josh.admin.tip.5", "¡Mantén actualizado el libro de clases! 📖"),
        ],
        teacher: [
          t("josh.teacher.tip.1", "¡Registra la asistencia diaria de tus estudiantes! ✅"),
          t("josh.teacher.tip.2", "¡Prepara tus planificaciones con anticipación! 📝"),
          t("josh.teacher.tip.3", "¡Ingresa las calificaciones regularmente! 📊"),
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
      toast.success(funMessages[Math.floor(Math.random() * funMessages.length)], {
        duration: 2000,
      });
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    toast.info(t("josh.dismiss", "Josh se esconderá... pero puedes llamarme con Ctrl+J"), {
      duration: 4000,
    });
  };

  // Add keyboard shortcut to show Josh again
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'j') {
        setIsVisible(true);
        toast.success(t("josh.back", "¡Josh está de vuelta! 👋"), {
          duration: 2000,
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [t]);

  return (
    <>
      {/* Chat Interface */}
      <JoshChat isOpen={isChatOpen} onToggle={() => setIsChatOpen(false)} />

      <AnimatePresence>
        {isVisible && (
          <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 2 // Show after welcome toast
            }
          }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <motion.div
            className="relative group cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
          >
            {/* Josh Image */}
            <motion.img
              src={joshImage}
              alt="Josh Assistant"
              className="w-12 h-12 rounded-full object-cover shadow-lg border-3 border-white dark:border-gray-700 hover:shadow-xl transition-shadow"
              animate={{
                y: [0, -3, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Notification dot */}
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {t("josh.tooltip", "¡Haz clic en mí!")}
              <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>

            {/* Chat button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsChatOpen(true);
                toast.success(t("josh.chat.open", "¡Hola! ¿En qué puedo ayudarte?"), {
                  duration: 2000,
                });
              }}
              className="absolute -top-1 -left-1 w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              title={t("josh.chat.button", "Chatear con Josh")}
            >
              <MessageCircle className="w-3 h-3" />
            </button>

            {/* Dismiss button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              ×
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
