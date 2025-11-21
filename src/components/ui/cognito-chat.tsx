"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";
import { useSession } from "@clerk/nextjs";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { COGNITO_CONFIG } from "@/lib/cognito-constants";
import {
  Send,
  X,
  ChevronDown,
  ChevronUp,
  Map,
  GripVertical,
  User,
  Bot,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "cognito";
  timestamp: Date;
  type?: "text" | "suggestion" | "help";
}

interface CognitoChatProps {
  isOpen: boolean;
  onToggle: () => void;
  onMinimizeChange?: (minimized: boolean) => void;
  onStartTour?: () => void;
  getTourForContext?: (context: any) => string | null;
  getPageContext?: () => any;
}

/**
 * Enhanced Cognito Chat Interface
 * Provides conversational AI assistance with contextual help and guidance
 */
export function CognitoChat({
  isOpen,
  onToggle,
  onMinimizeChange,
  onStartTour,
  getTourForContext,
  getPageContext: getPageContextProp,
}: CognitoChatProps) {
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
  const cognitoImage = isDark
    ? "/cognito-happy-dark.png"
    : "/cognito-happy-light.png";

  // Get user role and context
  const getUserRole = () => {
    if (!session?.user) return "guest";
    const role = session.user.publicMetadata?.role as string;
    return role || "guest";
  };

  // Role hierarchy and restrictions
  const ROLE_HIERARCHY = {
    guest: 0,
    parent: 1,
    teacher: 2,
    admin: 3,
    master: 4,
  };

  const ROLE_RESTRICTIONS = {
    parent: {
      forbiddenTopics: [
        'admin', 'administrador', 'profesor', 'teacher', 'maestro', 'configurar',
        'gestionar', 'manejar', 'sistema', 'servidor', 'base de datos', 'usuarios',
        'permisos', 'roles', 'clases', 'estudiantes', 'calificaciones'
      ],
      redirectMessage: t(
        "cognito.chat.role.parent.restriction",
        "Lo siento, como apoderado no puedo ayudarte con temas relacionados con la gestión docente o administrativa. ¿Quieres saber sobre el progreso de tu estudiante o contactar a profesores?"
      )
    },
    teacher: {
      forbiddenTopics: [
        'admin', 'administrador', 'master', 'maestro', 'sistema', 'servidor',
        'base de datos', 'configurar', 'usuarios', 'permisos', 'roles',
        'finanzas', 'presupuesto', 'institución', 'centro educativo'
      ],
      redirectMessage: t(
        "cognito.chat.role.teacher.restriction",
        "Lo siento, como profesor no puedo ayudarte con temas administrativos o de configuración del sistema. ¿Necesitas ayuda con tus clases, planificaciones o estudiantes?"
      )
    },
    admin: {
      forbiddenTopics: [
        'master', 'maestro', 'sistema', 'servidor', 'base de datos',
        'configurar', 'usuarios', 'permisos', 'roles', 'finanzas'
      ],
      redirectMessage: t(
        "cognito.chat.role.admin.restriction",
        "Lo siento, como administrador no puedo ayudarte con temas técnicos avanzados del sistema. ¿Necesitas ayuda con la gestión del centro educativo?"
      )
    },
    master: {
      forbiddenTopics: [], // Master can ask about everything
      redirectMessage: ""
    }
  };

  const checkRoleViolation = (message: string, userRole: string): string | null => {
    const restrictions = ROLE_RESTRICTIONS[userRole as keyof typeof ROLE_RESTRICTIONS];
    if (!restrictions) return null;

    const lowerMessage = message.toLowerCase();
    const hasForbiddenTopic = restrictions.forbiddenTopics.some(topic =>
      lowerMessage.includes(topic.toLowerCase())
    );

    return hasForbiddenTopic ? restrictions.redirectMessage : null;
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
        "cognito.chat.welcome.admin",
        "¡Hola! Soy Cogníto, tu asistente administrativo. ¿En qué puedo ayudarte con la gestión del centro educativo?",
      ),
      teacher: t(
        "cognito.chat.welcome.teacher",
        "¡Hola profesor! Soy Cogníto, tu asistente educativo. ¿Necesitas ayuda con tus clases, planificaciones o estudiantes?",
      ),
      parent: t(
        "cognito.chat.welcome.parent",
        "¡Hola apoderado! Soy Cogníto, tu asistente familiar. ¿Quieres saber sobre el progreso de tu estudiante o necesitas contactar a profesores?",
      ),
      master: t(
        "cognito.chat.welcome.master",
        "¡Hola maestro del sistema! Soy Cogníto, tu asistente técnico. ¿Necesitas ayuda con configuraciones avanzadas o monitoreo del sistema?",
      ),
      general: t(
        "cognito.chat.welcome.general",
        "¡Hola! Soy Cogníto, tu asistente educativo. ¿En qué puedo ayudarte hoy?",
      ),
    };

    return {
      id: "welcome",
      content:
        welcomeMessages[context.section as keyof typeof welcomeMessages] ||
        welcomeMessages.general,
      sender: "cognito",
      timestamp: new Date(),
      type: "text",
    };
  };

  // Load saved chat height from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHeight = localStorage.getItem("cognito_chat_height");
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
  const welcomeInitializedRef = useRef(false);
  useEffect(() => {
    if (isOpen && !welcomeInitializedRef.current) {
      const context = getPageContext();
      const welcomeMessage = getWelcomeMessage(context);
      setMessages([welcomeMessage]);
      welcomeInitializedRef.current = true;
    }
  }, [isOpen]);

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

  const cognitoChatAction = useAction(api.functions.ask.cognitoChat);

  const generateCognitoResponse = async (
    userMessage: string,
  ): Promise<string> => {
    try {
      const context = getPageContext();
      const result = await cognitoChatAction({
        message: userMessage,
        context: {
          role: context.role,
          section: context.section,
          userId: session?.user?.id,
        },
      });

      if (result.success) {
        return result.response;
      } else {
        console.error("Cognito chat failed:", result.error);
        // Fallback to a basic response if AI fails
        return "Lo siento, tuve un problema procesando tu mensaje. ¿Puedes intentarlo de nuevo o preguntarme sobre otra cosa?";
      }
    } catch (error) {
      console.error("Cognito chat error:", error);
      // Fallback response
      return "¡Hola! Soy Cognito, tu asistente educativo. ¿En qué puedo ayudarte hoy?";
    }
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

    // Check for role violations
    const userRole = getUserRole();
    const roleViolation = checkRoleViolation(userMessage.content, userRole);

    // Simulate typing delay
    setTimeout(
      async () => {
        let cognitoResponse: string;

        if (roleViolation) {
          // Use role violation message instead of AI response
          cognitoResponse = roleViolation;
        } else {
          // Generate normal AI response
          cognitoResponse = await generateCognitoResponse(userMessage.content);
        }

        const cognitoMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: cognitoResponse,
          sender: "cognito",
          timestamp: new Date(),
          type: "text",
        };

        setMessages((prev) => [...prev, cognitoMessage]);
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
  const handleResizeStart = (
    e: React.MouseEvent,
    direction: "top" | "bottom" = "top",
  ) => {
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
      const deltaY =
        direction === "top"
          ? resizeStartY.current - moveEvent.clientY // Dragging up from top increases height
          : moveEvent.clientY - resizeStartY.current; // Dragging down from bottom increases height

      currentHeight = Math.max(
        200,
        Math.min(800, resizeStartHeight.current + deltaY),
      );
      setChatHeight(currentHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      // Save final height to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("cognito_chat_height", currentHeight.toString());
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  if (!isOpen) return null;

  // Don't render chat at all when minimized - let Cognito indicator handle it
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
        aria-labelledby="cognito-chat-title"
        aria-describedby="cognito-chat-description"
      >
        {/* Header */}
        <header
          className="flex items-center justify-between px-3 py-2.5 border-b border-white/20 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg select-none relative group"
          onMouseDown={(e) => handleResizeStart(e, "top")}
          title={t(
            "cognito.chat.resize",
            "Arrastra hacia arriba para redimensionar",
          )}
        >
          {/* Resize indicator */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white/30 rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity cursor-ns-resize" />
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <img
              src={cognitoImage}
              alt=""
              className="w-9 h-9 rounded-full border-2 border-accent object-contain flex-shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <h3
                id="cognito-chat-title"
                className="font-semibold text-sm truncate"
              >
                Cogníto
              </h3>
              <p
                id="cognito-chat-description"
                className="text-xs opacity-90 truncate"
              >
                Asistente Tecnico
              </p>
            </div>
          </div>
          <div
            className="flex items-center space-x-1.5 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tour button - ALWAYS visible and active, positioned to the left of collapse button. Users can redo tours anytime, independently of previous tour status. */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartTour?.();
              }}
              className="p-2 hover:bg-white/20 rounded-md transition-colors focus:bg-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none cursor-pointer"
              aria-label={t(
                "cognito.tour.button.accessible",
                "Start interactive tour with Cognito",
              )}
              title={t("cognito.tour.button", "Tour Interactivo")}
            >
              <Map className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newMinimized = !isMinimized;
                setIsMinimized(newMinimized);
                onMinimizeChange?.(newMinimized);
              }}
              className="p-2 hover:bg-white/20 rounded-md transition-colors focus:bg-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none cursor-pointer"
              aria-label={t("cognito.chat.minimize", "Minimizar chat")}
              title={t("cognito.chat.minimize", "Minimizar chat")}
            >
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="p-2 hover:bg-white/20 rounded-md transition-colors focus:bg-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none cursor-pointer"
              aria-label={t("cognito.chat.close", "Cerrar chat")}
              title={t("cognito.chat.close", "Cerrar chat")}
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
              aria-label={t("cognito.chat.messages", "Mensajes del chat")}
              aria-live="polite"
              aria-atomic="false"
            >
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 max-w-[85%] ${
                    message.sender === "user"
                      ? "ml-auto flex-row-reverse"
                      : "mr-auto"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted text-foreground rounded-tl-none"
                    }`}
                  >
                    <p>{message.content}</p>
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
                  className="flex gap-3 mr-auto max-w-[85%]"
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg rounded-tl-none flex items-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 pl-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-1">
                <label htmlFor="cognito-chat-input" className="sr-only">
                  {t(
                    "cognito.chat.input.label",
                    "Escribe tu mensaje para Cognito",
                  )}
                </label>
                <input
                  ref={inputRef}
                  id="cognito-chat-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t(
                    "cognito.chat.placeholder",
                    "Escribe tu mensaje...",
                  )}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={isTyping}
                  aria-describedby={
                    isTyping ? "cognito-typing-status" : undefined
                  }
                  autoComplete="off"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="ml-[5px] px-2.5 py-0.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center focus:ring-2 focus:ring-blue-300 disabled:focus:ring-0 scale-[0.85]"
                  aria-label={t("cognito.chat.send", "Enviar mensaje")}
                  title={t("cognito.chat.send", "Enviar mensaje")}
                >
                  <Send className="w-2.5 h-2.5" aria-hidden="true" />
                </button>
              </div>
              {isTyping && (
                <div
                  id="cognito-typing-status"
                  className="sr-only"
                  aria-live="assertive"
                >
                  {t("cognito.chat.typing", "Cognito está escribiendo")}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Bottom resize handle */}
        <div
          className="h-2 cursor-ns-resize hover:bg-blue-500/20 transition-colors flex items-center justify-center group"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleResizeStart(e, "bottom");
          }}
          title={t(
            "cognito.chat.resize",
            "Arrastra hacia abajo para agrandar, hacia arriba para achicar",
          )}
        >
          <div className="w-8 h-0.5 bg-gray-400 dark:bg-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
