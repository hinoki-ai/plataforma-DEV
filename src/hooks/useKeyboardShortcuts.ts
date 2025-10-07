"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
  category?: string;
  enabled?: boolean;
}

export interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  globalShortcuts?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  ignoreInputFields?: boolean;
  debugMode?: boolean;
}

/**
 * Enhanced keyboard shortcuts hook with conflict resolution and accessibility
 */
export function useKeyboardShortcuts({
  shortcuts,
  globalShortcuts = true,
  preventDefault = true,
  stopPropagation = false,
  ignoreInputFields = true,
  debugMode = false,
}: UseKeyboardShortcutsOptions) {
  const activeShortcuts = useRef(new Set<string>());
  const keyboardEventRef = useRef<KeyboardEvent | null>(null);

  const createShortcutKey = useCallback((shortcut: KeyboardShortcut) => {
    const modifiers = [];
    if (shortcut.ctrlKey) modifiers.push("ctrl");
    if (shortcut.altKey) modifiers.push("alt");
    if (shortcut.metaKey) modifiers.push("meta");
    if (shortcut.shiftKey) modifiers.push("shift");

    return `${modifiers.join("+")}-${shortcut.key.toLowerCase()}`;
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      keyboardEventRef.current = event;

      // Skip if typing in input fields
      if (ignoreInputFields) {
        const target = event.target as HTMLElement;
        const isInputField =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.contentEditable === "true" ||
          target.isContentEditable;

        if (isInputField) {
          if (debugMode)
            console.log("Ignoring shortcut in input field:", target.tagName);
          return;
        }
      }

      // Process shortcuts
      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;

        const matches =
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!event.ctrlKey === !!shortcut.ctrlKey &&
          !!event.altKey === !!shortcut.altKey &&
          !!event.metaKey === !!shortcut.metaKey &&
          !!event.shiftKey === !!shortcut.shiftKey;

        if (matches) {
          if (debugMode) {
            console.log("Keyboard shortcut matched:", {
              key: shortcut.key,
              description: shortcut.description,
              event: event,
            });
          }

          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();

          const shortcutKey = createShortcutKey(shortcut);
          activeShortcuts.current.add(shortcutKey);

          try {
            shortcut.action();
          } catch (error) {
            console.error("Error executing keyboard shortcut:", error);
          }

          // Clean up active shortcuts after execution
          setTimeout(() => {
            activeShortcuts.current.delete(shortcutKey);
          }, 100);

          break; // Stop processing after first match
        }
      }
    },
    [
      shortcuts,
      preventDefault,
      stopPropagation,
      ignoreInputFields,
      debugMode,
      createShortcutKey,
    ],
  );

  useEffect(() => {
    if (!globalShortcuts) return;

    // Add debouncing to prevent rapid-fire shortcuts
    let timeoutId: NodeJS.Timeout;
    const debouncedHandler = (event: KeyboardEvent) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handleKeyDown(event), 10);
    };

    document.addEventListener("keydown", debouncedHandler);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("keydown", debouncedHandler);
    };
  }, [handleKeyDown, globalShortcuts]);

  // Utility functions
  const getShortcutByKey = useCallback(
    (key: string) => {
      return shortcuts.find((shortcut) => createShortcutKey(shortcut) === key);
    },
    [shortcuts, createShortcutKey],
  );

  const isShortcutActive = useCallback(
    (shortcut: KeyboardShortcut) => {
      const key = createShortcutKey(shortcut);
      return activeShortcuts.current.has(key);
    },
    [createShortcutKey],
  );

  const formatShortcut = useCallback((shortcut: KeyboardShortcut) => {
    const modifiers = [];
    if (shortcut.ctrlKey) modifiers.push("Ctrl");
    if (shortcut.altKey) modifiers.push("Alt");
    if (shortcut.metaKey) modifiers.push("Cmd");
    if (shortcut.shiftKey) modifiers.push("Shift");

    const key =
      shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;

    return [...modifiers, key].join(" + ");
  }, []);

  const getShortcutsByCategory = useCallback(
    (category?: string) => {
      return shortcuts.filter((shortcut) =>
        category ? shortcut.category === category : !shortcut.category,
      );
    },
    [shortcuts],
  );

  return {
    shortcuts,
    activeShortcuts: Array.from(activeShortcuts.current),
    getShortcutByKey,
    isShortcutActive,
    formatShortcut,
    getShortcutsByCategory,
    currentEvent: keyboardEventRef.current,
  };
}

/**
 * Navigation-specific keyboard shortcuts hook
 */
export function useNavigationShortcuts(userRole?: string) {
  const router = useRouter();
  const pathname = usePathname();

  const navigationShortcuts: KeyboardShortcut[] = [
    // Global shortcuts
    {
      key: "k",
      ctrlKey: true,
      action: () => {
        // Trigger global search - this would integrate with your search component
        const event = new CustomEvent("open-global-search");
        document.dispatchEvent(event);
      },
      description: "Abrir búsqueda rápida",
      category: "Navegación",
    },
    {
      key: "h",
      altKey: true,
      action: () => {
        const homeRoutes = {
          ADMIN: "/admin",
          PROFESOR: "/profesor",
          PARENT: "/parent",
        };
        const route = homeRoutes[userRole as keyof typeof homeRoutes] || "/";
        router.push(route);
      },
      description: "Ir al inicio",
      category: "Navegación",
    },
    {
      key: "/",
      action: () => {
        const event = new CustomEvent("focus-search");
        document.dispatchEvent(event);
      },
      description: "Enfocar búsqueda",
      category: "Navegación",
    },
    {
      key: "Escape",
      action: () => {
        // Close modals, dropdowns, etc.
        const event = new CustomEvent("close-overlays");
        document.dispatchEvent(event);
      },
      description: "Cerrar overlays",
      category: "General",
    },

    // Role-specific shortcuts
    ...(userRole === "ADMIN"
      ? [
          {
            key: "u",
            altKey: true,
            action: () => router.push("/admin/usuarios"),
            description: "Gestión de usuarios",
            category: "Administración",
          },
          {
            key: "c",
            altKey: true,
            action: () => router.push("/admin/calendario-escolar"),
            description: "Calendario escolar",
            category: "Administración",
          },
        ]
      : []),

    ...(userRole === "PROFESOR"
      ? [
          {
            key: "p",
            altKey: true,
            action: () => router.push("/profesor/planificaciones"),
            description: "Planificaciones",
            category: "Profesor",
          },
          {
            key: "r",
            altKey: true,
            action: () => router.push("/profesor/reuniones"),
            description: "Reuniones",
            category: "Profesor",
          },
        ]
      : []),

    ...(userRole === "PARENT"
      ? [
          {
            key: "e",
            altKey: true,
            action: () => router.push("/parent/estudiantes"),
            description: "Información de estudiantes",
            category: "Apoderado",
          },
          {
            key: "m",
            altKey: true,
            action: () => router.push("/parent/comunicacion"),
            description: "Comunicación",
            category: "Apoderado",
          },
        ]
      : []),
  ];

  return useKeyboardShortcuts({
    shortcuts: navigationShortcuts,
    globalShortcuts: true,
    preventDefault: true,
    ignoreInputFields: true,
  });
}

/**
 * Accessibility keyboard shortcuts
 */
export function useAccessibilityShortcuts() {
  const skipToContent = useCallback(() => {
    const main = document.querySelector("main");
    if (main) {
      main.focus();
      main.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const skipToNavigation = useCallback(() => {
    const nav = document.querySelector('nav[role="navigation"]');
    if (nav) {
      const firstLink = nav.querySelector("a, button");
      if (firstLink instanceof HTMLElement) {
        firstLink.focus();
      }
    }
  }, []);

  const increaseFont = useCallback(() => {
    const html = document.documentElement;
    const currentSize = parseFloat(getComputedStyle(html).fontSize);
    html.style.fontSize = `${Math.min(currentSize * 1.1, 24)}px`;
  }, []);

  const decreaseFont = useCallback(() => {
    const html = document.documentElement;
    const currentSize = parseFloat(getComputedStyle(html).fontSize);
    html.style.fontSize = `${Math.max(currentSize * 0.9, 12)}px`;
  }, []);

  const toggleHighContrast = useCallback(() => {
    document.body.classList.toggle("high-contrast");
  }, []);

  const accessibilityShortcuts: KeyboardShortcut[] = [
    {
      key: "1",
      altKey: true,
      action: skipToContent,
      description: "Ir al contenido principal",
      category: "Accesibilidad",
    },
    {
      key: "2",
      altKey: true,
      action: skipToNavigation,
      description: "Ir a la navegación",
      category: "Accesibilidad",
    },
    {
      key: "=",
      ctrlKey: true,
      action: increaseFont,
      description: "Aumentar tamaño de fuente",
      category: "Accesibilidad",
    },
    {
      key: "-",
      ctrlKey: true,
      action: decreaseFont,
      description: "Disminuir tamaño de fuente",
      category: "Accesibilidad",
    },
    {
      key: "i",
      altKey: true,
      shiftKey: true,
      action: toggleHighContrast,
      description: "Alto contraste",
      category: "Accesibilidad",
    },
  ];

  return useKeyboardShortcuts({
    shortcuts: accessibilityShortcuts,
    globalShortcuts: true,
    preventDefault: true,
    ignoreInputFields: false, // Allow in input fields for accessibility
  });
}

/**
 * Development shortcuts (only in development mode)
 */
export function useDevelopmentShortcuts() {
  const isDevelopment = process.env.NODE_ENV === "development";

  const developmentShortcuts: KeyboardShortcut[] = isDevelopment
    ? [
        {
          key: "d",
          ctrlKey: true,
          shiftKey: true,
          action: () => {
            // Toggle React DevTools highlighting
            if (
              typeof window !== "undefined" &&
              (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
            ) {
              console.log("React DevTools detected");
            }
          },
          description: "Toggle React DevTools",
          category: "Desarrollo",
        },
        {
          key: "l",
          ctrlKey: true,
          shiftKey: true,
          action: () => {
            localStorage.clear();
            sessionStorage.clear();
            location.reload();
          },
          description: "Limpiar storage y recargar",
          category: "Desarrollo",
        },
        {
          key: "p",
          ctrlKey: true,
          shiftKey: true,
          action: () => {
            // Log performance metrics
            if (typeof window !== "undefined" && "performance" in window) {
              const navigation = performance.getEntriesByType(
                "navigation",
              )[0] as PerformanceNavigationTiming;
              console.log("Performance Metrics:", {
                domContentLoaded:
                  navigation.domContentLoadedEventEnd -
                    (navigation as any).activationStart || 0,
                loadComplete:
                  navigation.loadEventEnd -
                    (navigation as any).activationStart || 0,
                firstPaint: performance
                  .getEntriesByType("paint")
                  .find((p) => p.name === "first-paint")?.startTime,
                firstContentfulPaint: performance
                  .getEntriesByType("paint")
                  .find((p) => p.name === "first-contentful-paint")?.startTime,
              });
            }
          },
          description: "Mostrar métricas de rendimiento",
          category: "Desarrollo",
        },
      ]
    : [];

  return useKeyboardShortcuts({
    shortcuts: developmentShortcuts,
    globalShortcuts: true,
    preventDefault: true,
    ignoreInputFields: true,
    debugMode: isDevelopment,
  });
}
