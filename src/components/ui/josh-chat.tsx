"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { useSession } from "@clerk/nextjs";
import { Send, X, ChevronDown, ChevronUp, Map, GripVertical } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "josh";
  timestamp: Date;
  type?: "text" | "suggestion" | "help";
}

interface JoshChatProps {
  isOpen: boolean;
  onToggle: () => void;
  onMinimizeChange?: (minimized: boolean) => void;
  onStartTour?: () => void;
  getTourForContext?: (context: any) => string | null;
  getPageContext?: () => any;
}

/**
 * Enhanced Josh Chat Interface
 * Provides conversational AI assistance with contextual help and guidance
 */
export function JoshChat({
  isOpen,
  onToggle,
  onMinimizeChange,
  onStartTour,
  getTourForContext,
  getPageContext: getPageContextProp,
}: JoshChatProps) {
  const { resolvedTheme } = useTheme();
  const { t } = useDivineParsing();
  const { session } = useSession();
  const pathname = usePathname();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatHeight, setChatHeight] = useState(384); // Default h-96 (384px)
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resizeStartY = useRef<number>(0);
  const resizeStartHeight = useRef<number>(384);

  const isDark = resolvedTheme === "dark";
  const joshImage = isDark ? "/josh-happy-dark.png" : "/josh-happy-light.png";

  // Get user role and context
  const getUserRole = () => {
    if (!session?.user) return "guest";
    const role = session.user.publicMetadata?.role as string;
    return role || "guest";
  };

  const getPageContext = () => {
    // Use provided context function if available, otherwise use local implementation
    if (getPageContextProp) {
      return getPageContextProp();
    }
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

  const getWelcomeMessage = (context: any): Message => {
    const welcomeMessages = {
      admin: t(
        "josh.chat.welcome.admin",
        "¡Hola! Soy Josh, tu asistente administrativo. ¿En qué puedo ayudarte con la gestión del centro educativo?",
      ),
      teacher: t(
        "josh.chat.welcome.teacher",
        "¡Hola profesor! Soy Josh, tu asistente educativo. ¿Necesitas ayuda con tus clases, planificaciones o estudiantes?",
      ),
      parent: t(
        "josh.chat.welcome.parent",
        "¡Hola apoderado! Soy Josh, tu asistente familiar. ¿Quieres saber sobre el progreso de tu estudiante o necesitas contactar a profesores?",
      ),
      master: t(
        "josh.chat.welcome.master",
        "¡Hola maestro del sistema! Soy Josh, tu asistente técnico. ¿Necesitas ayuda con configuraciones avanzadas o monitoreo del sistema?",
      ),
      general: t(
        "josh.chat.welcome.general",
        "¡Hola! Soy Josh, tu asistente educativo. ¿En qué puedo ayudarte hoy?",
      ),
    };

    return {
      id: "welcome",
      content:
        welcomeMessages[context.section as keyof typeof welcomeMessages] ||
        welcomeMessages.general,
      sender: "josh",
      timestamp: new Date(),
      type: "text",
    };
  };

  // Load saved chat height from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHeight = localStorage.getItem("josh_chat_height");
      if (savedHeight) {
        const height = parseInt(savedHeight, 10);
        if (height >= 200 && height <= 800) {
          // Validate height is within reasonable bounds
          setChatHeight(height);
          resizeStartHeight.current = height;
        }
      }
    }
  }, []);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const context = getPageContext();
      const welcomeMessage = getWelcomeMessage(context);
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const generateJoshResponse = async (userMessage: string): Promise<string> => {
    const context = getPageContext();
    const lowerMessage = userMessage.toLowerCase();

    // Check for tour requests
    if (
      lowerMessage.includes("tour") ||
      lowerMessage.includes("guia") ||
      lowerMessage.includes("guide")
    ) {
      if (context.section === "admin") {
        return t(
          "josh.chat.tour.admin",
          "¿Te gustaría que te guíe por el panel de administración? Puedo mostrarte cómo gestionar usuarios, calendario y todas las funciones principales. Solo di 'sí' para comenzar el tour.",
        );
      }
      if (context.section === "teacher") {
        return t(
          "josh.chat.tour.teacher",
          "¿Quieres que te enseñe a usar el libro de clases? Te mostraré cómo registrar asistencia, calificaciones y observaciones. Solo di 'sí' para comenzar el tour.",
        );
      }
      if (context.section === "parent") {
        return t(
          "josh.chat.tour.parent",
          "¿Te gustaría un tour por el portal de apoderados? Te explicaré cómo ver el progreso de tu estudiante y comunicarte con profesores. Solo di 'sí' para comenzar.",
        );
      }
    }

    // Check for tour confirmation
    if (
      lowerMessage.includes("si") ||
      lowerMessage.includes("yes") ||
      lowerMessage.includes("comenzar") ||
      lowerMessage.includes("start")
    ) {
      // This would trigger the tour - handled by parent component
      return t(
        "josh.chat.tour.starting",
        "¡Perfecto! Iniciando el tour interactivo. Te guiaré paso a paso por las funciones principales.",
      );
    }

    // Contextual responses based on user role and page
    if (context.section === "admin") {
      if (
        lowerMessage.includes("calendario") ||
        lowerMessage.includes("calendar")
      ) {
        return t(
          "josh.chat.admin.calendar",
          "Para gestionar el calendario escolar, ve a 'Calendario Escolar' en el menú lateral. Puedes agregar eventos, feriados y actividades importantes para mantener a todos informados.",
        );
      }
      if (lowerMessage.includes("usuario") || lowerMessage.includes("user")) {
        return t(
          "josh.chat.admin.users",
          "Para gestionar usuarios, accede a 'Usuarios' en el panel administrativo. Puedes crear, editar o desactivar cuentas de profesores, apoderados y personal administrativo.",
        );
      }
      if (
        lowerMessage.includes("planificación") ||
        lowerMessage.includes("planning")
      ) {
        return t(
          "josh.chat.admin.planning",
          "Las planificaciones de profesores están en 'Planificaciones'. Puedes revisar, aprobar o solicitar modificaciones para asegurar el cumplimiento curricular.",
        );
      }
    }

    if (context.section === "teacher") {
      if (
        lowerMessage.includes("asistencia") ||
        lowerMessage.includes("attendance")
      ) {
        return t(
          "josh.chat.teacher.attendance",
          "Para registrar asistencia, ve a 'Libro de Clases > Asistencia'. Marca presente/ausente para cada estudiante y agrega observaciones si es necesario.",
        );
      }
      if (
        lowerMessage.includes("calificación") ||
        lowerMessage.includes("grade")
      ) {
        return t(
          "josh.chat.teacher.grades",
          "Las calificaciones se registran en 'Libro de Clases > Calificaciones'. Ingresa notas por asignatura y período académico.",
        );
      }
      if (
        lowerMessage.includes("planificación") ||
        lowerMessage.includes("planning")
      ) {
        return t(
          "josh.chat.teacher.planning",
          "Crea planificaciones en 'Planificaciones'. Incluye objetivos, actividades y materiales para cada clase.",
        );
      }
    }

    if (context.section === "parent") {
      if (
        lowerMessage.includes("progreso") ||
        lowerMessage.includes("progress")
      ) {
        return t(
          "josh.chat.parent.progress",
          "Revisa el progreso de tu estudiante en 'Libro de Clases'. Verás calificaciones, asistencia y observaciones de profesores.",
        );
      }
      if (
        lowerMessage.includes("reunión") ||
        lowerMessage.includes("meeting")
      ) {
        return t(
          "josh.chat.parent.meeting",
          "Programa reuniones con profesores en 'Reuniones'. Coordina horarios y temas a discutir sobre tu estudiante.",
        );
      }
      if (
        lowerMessage.includes("comunicación") ||
        lowerMessage.includes("communication")
      ) {
        return t(
          "josh.chat.parent.communication",
          "Las comunicaciones del centro están en 'Comunicación'. Recibe anuncios importantes y noticias relevantes.",
        );
      }
    }

    // General responses
    if (lowerMessage.includes("ayuda") || lowerMessage.includes("help")) {
      return t(
        "josh.chat.help.general",
        "¿En qué área específica necesitas ayuda? Puedo guiarte por las funciones de administración, enseñanza, seguimiento parental o configuración del sistema.",
      );
    }

    if (
      lowerMessage.includes("problema") ||
      lowerMessage.includes("error") ||
      lowerMessage.includes("issue")
    ) {
      return t(
        "josh.chat.help.problem",
        "Si encuentras un problema, intenta refrescar la página. Si persiste, contacta al administrador del sistema. ¿Puedes describir qué está pasando?",
      );
    }

    // Default responses
    const defaultResponses = [
      t(
        "josh.chat.default.1",
        "¡Entiendo! Déjame ayudarte con eso. ¿Puedes darme más detalles sobre lo que necesitas?",
      ),
      t(
        "josh.chat.default.2",
        "Estoy aquí para ayudarte. ¿Hay algo específico en lo que pueda asistirte?",
      ),
      t("josh.chat.default.3", "¡Perfecto! ¿Qué más puedo hacer por ti hoy?"),
    ];

    return defaultResponses[
      Math.floor(Math.random() * defaultResponses.length)
    ];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(
      async () => {
        const joshResponse = await generateJoshResponse(inputValue);
        const joshMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: joshResponse,
          sender: "josh",
          timestamp: new Date(),
          type: "text",
        };

        setMessages((prev) => [...prev, joshMessage]);
        setIsTyping(false);
      },
      1000 + Math.random() * 2000,
    ); // 1-3 second delay
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent) => {
    // Don't start resize if clicking on buttons or interactive elements
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartY.current = e.clientY;
    resizeStartHeight.current = chatHeight;
    
    let currentHeight = chatHeight;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = resizeStartY.current - moveEvent.clientY; // Positive when dragging up (north)
      currentHeight = Math.max(200, Math.min(800, resizeStartHeight.current + deltaY));
      setChatHeight(currentHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      // Save final height to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("josh_chat_height", currentHeight.toString());
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  if (!isOpen) return null;

  // Don't render chat at all when minimized - let Josh indicator handle it
  if (isMinimized) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="fixed bottom-0 right-0 z-50 w-80 bg-white dark:bg-gray-800 rounded-tl-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out"
        style={{ height: `${chatHeight}px` }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="josh-chat-title"
        aria-describedby="josh-chat-description"
      >
        {/* Header */}
        <header 
          className="flex items-center justify-between px-3 py-2.5 border-b border-white/20 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg select-none relative group"
          onMouseDown={handleResizeStart}
          title={t("josh.chat.resize", "Arrastra hacia arriba para redimensionar")}
        >
          {/* Resize indicator */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white/30 rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity cursor-ns-resize" />
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <motion.img
              src={joshImage}
              alt=""
              className="w-8 h-8 rounded-full border-2 border-white object-contain flex-shrink-0"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <h3
                id="josh-chat-title"
                className="font-semibold text-sm truncate"
              >
                Josh
              </h3>
              <p
                id="josh-chat-description"
                className="text-xs opacity-90 truncate"
              >
                Tu asistente educativo
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {/* Tour button - Always show if tour is available */}
            {(() => {
              if (!onStartTour || !getTourForContext) return null;
              const context = getPageContext();
              const tourId = getTourForContext(context);
              if (!tourId) return null;
              return (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartTour();
                  }}
                  className="p-2 hover:bg-white/20 rounded-md transition-colors focus:bg-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none cursor-pointer"
                  aria-label={t(
                    "josh.tour.button.accessible",
                    "Start interactive tour with Josh",
                  )}
                  title={t("josh.tour.button", "Tour Interactivo")}
                >
                  <Map className="w-4 h-4" aria-hidden="true" />
                </button>
              );
            })()}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newMinimized = !isMinimized;
                setIsMinimized(newMinimized);
                onMinimizeChange?.(newMinimized);
              }}
              className="p-2 hover:bg-white/20 rounded-md transition-colors focus:bg-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none cursor-pointer"
              aria-label={t("josh.chat.minimize", "Minimizar chat")}
              title={t("josh.chat.minimize", "Minimizar chat")}
            >
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="p-2 hover:bg-white/20 rounded-md transition-colors focus:bg-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none cursor-pointer"
              aria-label={t("josh.chat.close", "Cerrar chat")}
              title={t("josh.chat.close", "Cerrar chat")}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0 }}
          className="flex-1 overflow-hidden rounded-b-lg"
        >
              <div className="h-full flex flex-col">
                <div
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                  role="log"
                  aria-label={t("josh.chat.messages", "Mensajes del chat")}
                  aria-live="polite"
                  aria-atomic="false"
                >
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        }`}
                      >
                        {message.sender === "josh" && (
                          <div className="flex items-center space-x-2 mb-1">
                            <img
                              src={joshImage}
                              alt=""
                              className="w-4 h-4 rounded-full"
                              aria-hidden="true"
                            />
                            <span className="text-xs font-medium">Josh</span>
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <time
                          className="text-xs opacity-70 mt-1 block"
                          dateTime={message.timestamp.toISOString()}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      </div>
                    </motion.div>
                  ))}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <img
                            src={joshImage}
                            alt="Josh"
                            className="w-4 h-4 rounded-full"
                          />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce stagger-150"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce stagger-300"></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="px-3 py-3 pl-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-1">
                    <label htmlFor="josh-chat-input" className="sr-only">
                      {t(
                        "josh.chat.input.label",
                        "Escribe tu mensaje para Josh",
                      )}
                    </label>
                    <input
                      ref={inputRef}
                      id="josh-chat-input"
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={t(
                        "josh.chat.placeholder",
                        "Escribe tu mensaje...",
                      )}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      disabled={isTyping}
                      aria-describedby={
                        isTyping ? "josh-typing-status" : undefined
                      }
                      autoComplete="off"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isTyping}
                      className="ml-[5px] px-2.5 py-0.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center focus:ring-2 focus:ring-blue-300 disabled:focus:ring-0 scale-[0.85]"
                      aria-label={t("josh.chat.send", "Enviar mensaje")}
                      title={t("josh.chat.send", "Enviar mensaje")}
                    >
                      <Send className="w-2.5 h-2.5" aria-hidden="true" />
                    </button>
                  </div>
                  {isTyping && (
                    <div
                      id="josh-typing-status"
                      className="sr-only"
                      aria-live="assertive"
                    >
                      {t("josh.chat.typing", "Josh está escribiendo")}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
