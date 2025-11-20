"use client";

import { useState, useRef, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2, Map, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useSession } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatWidget() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { resolvedTheme } = useTheme();
  const { session } = useSession();
  const pathname = usePathname();

  // Use the new 'chat' action instead of 'ask' query
  const askAction = useAction(api.functions.ask.chat);

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "¡Buenos días! 🌅";
    if (hour < 18) return "¡Buenas tardes! ☀️";
    return "¡Buenas noches! 🌙";
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

  // Get contextual Cognito personality message based on page and role
  const getCognitoMessage = () => {
    const context = getPageContext();

    const contextualMessages = {
      admin: [
        "¡Hola administrador! ¿Qué vamos a gestionar hoy?",
        "¡Listo para mantener todo funcionando perfectamente!",
        "¡Tu centro educativo te necesita! Vamos a trabajar juntos.",
      ],
      teacher: [
        "¡Hola profesor! ¿Qué clase vamos a preparar hoy?",
        "¡Tus estudiantes te esperan con entusiasmo!",
        "¡Vamos a hacer una jornada educativa increíble!",
      ],
      parent: [
        "¡Hola apoderado! ¿Cómo podemos ayudar a tu estudiante?",
        "¡Bienvenido a seguir el progreso de tu hijo!",
        "¡Estamos aquí para mantenerte informado!",
      ],
      master: [
        "¡Hola maestro del sistema! ¿Qué operaciones avanzadas realizaremos?",
        "¡Todo el sistema está bajo control!",
        "¡Listo para optimizar la plataforma educativa!",
      ],
      general: [
        "¡Estoy feliz de verte!",
        "¡Vamos a aprender juntos!",
        "¡Tu plataforma favorita te da la bienvenida!",
        "¡Listo para una jornada educativa increíble!",
        "¡Hola! ¿Qué vamos a crear hoy?",
      ],
    };

    const messages =
      contextualMessages[context.section as keyof typeof contextualMessages] ||
      contextualMessages.general;
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Handle tour start
  const handleStartTour = () => {
    // For now, just show a message about tours
    // In a full implementation, this would trigger an interactive tour
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "¡Excelente idea! Los tours interactivos te ayudarán a conocer todas las funciones de la plataforma. Esta funcionalidad estará disponible próximamente. Mientras tanto, puedes preguntarme cualquier cosa sobre cómo usar la plataforma.",
      },
    ]);
  };

  // Handle minimize toggle
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await askAction({ question: userMessage });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response as string },
      ]);
    } catch (error: any) {
      console.error("Chat error:", error);

      let errorMessage =
        "Lo siento, ocurrió un error. Por favor, inténtalo de nuevo.";

      // Handle specific error types
      if (error?.message?.includes("Connection lost")) {
        errorMessage =
          "La conexión se perdió. Por favor, verifica tu conexión a internet e inténtalo de nuevo.";
      } else if (error?.message?.includes("timeout")) {
        errorMessage =
          "La respuesta tomó demasiado tiempo. ¿Puedes hacer tu pregunta más específica?";
      } else if (error?.message?.includes("rate limit")) {
        errorMessage =
          "Demasiadas solicitudes. Por favor, espera un momento e inténtalo de nuevo.";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Show minimized avatar when minimized
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={handleMinimize}
          className="w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-primary hover:bg-primary/90"
          title="Maximizar Cognito"
        >
          <Bot className="w-8 h-8 text-primary-foreground" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md h-[600px] flex flex-col shadow-xl fixed bottom-4 right-4 z-50">
      <CardHeader className="border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="w-5 h-5 text-primary" />
            Cognito
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartTour}
              className="h-8 w-8 p-0"
              title="Tour Interactivo"
            >
              <Map className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMinimize}
              className="h-8 w-8 p-0"
              title="Minimizar"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground mt-20 px-6">
                <div className="mb-4">
                  <p className="text-lg font-semibold mb-1">
                    {getTimeBasedGreeting()}
                  </p>
                  <p className="text-sm opacity-90">{getCognitoMessage()}</p>
                </div>
                <p className="mb-4">
                  👋 Soy Cognito, tu asistente educativo inteligente.
                </p>
                <p className="text-sm">
                  Pregúntame <strong>Cómo</strong>, <strong>Dónde</strong>, o{" "}
                  <strong>Por qué</strong> sobre la plataforma.
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartTour}
                    className="flex items-center gap-1"
                  >
                    <Map className="w-4 h-4" />
                    Tour Interactivo
                  </Button>
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted",
                  )}
                >
                  {m.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={cn(
                    "p-3 rounded-lg text-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-muted text-foreground rounded-tl-none",
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 mr-auto max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-muted p-3 rounded-lg rounded-tl-none flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 border-t bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex w-full gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta cómo, dónde, o por qué..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-4 h-4" />
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
