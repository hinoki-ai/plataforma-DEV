"use client";

import {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  ReactNode,
} from "react";

interface DesktopToggleContextType {
  isDesktopForced: boolean;
  toggleDesktopMode: () => void;
  isActualMobile: boolean;
  isHydrated: boolean;
}

const DesktopToggleContext = createContext<
  DesktopToggleContextType | undefined
>(undefined);

export function DesktopToggleProvider({ children }: { children: ReactNode }) {
  const [isDesktopForced, setIsDesktopForced] = useState(false);
  const [isActualMobile, setIsActualMobile] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useLayoutEffect(() => {
    // Mark as hydrated to prevent SSR mismatches
    setIsHydrated(true);

    // Check if device is actually mobile
    const checkMobile = () => {
      if (typeof window === "undefined") return;

      const isMobile =
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );
      setIsActualMobile(isMobile);
    };

    checkMobile();

    // Load saved preference - only after hydration
    try {
      const saved = localStorage.getItem("desktopToggle");
      if (saved === "true") {
        setIsDesktopForced(true);
      }
    } catch (error) {
      // Handle cases where localStorage is not available
    }

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleDesktopMode = () => {
    const newValue = !isDesktopForced;
    setIsDesktopForced(newValue);

    // Safely handle localStorage
    try {
      if (typeof window !== "undefined" && isHydrated) {
        localStorage.setItem("desktopToggle", newValue.toString());
      }
    } catch (error) {}
  };

  return (
    <DesktopToggleContext.Provider
      value={{
        isDesktopForced,
        toggleDesktopMode,
        isActualMobile,
        isHydrated,
      }}
    >
      {children}
    </DesktopToggleContext.Provider>
  );
}

export function useDesktopToggle() {
  const context = useContext(DesktopToggleContext);
  if (context === undefined) {
    throw new Error(
      "useDesktopToggle must be used within a DesktopToggleProvider",
    );
  }
  return context;
}

// Custom hook to determine if we should use desktop layout
export function useResponsiveMode() {
  const { isDesktopForced, isActualMobile, isHydrated } = useDesktopToggle();

  // During SSR or before hydration, assume desktop layout to prevent mismatches
  if (!isHydrated) {
    return {
      shouldUseMobileLayout: false,
      shouldUseDesktopLayout: true,
      isDesktopForced: false,
      isActualMobile: false,
      isHydrated: false,
    };
  }

  // If desktop is forced, always use desktop layout
  // If not forced and on mobile, use mobile layout
  // If not forced and on desktop, use desktop layout
  const shouldUseMobileLayout = isActualMobile && !isDesktopForced;
  const shouldUseDesktopLayout = !isActualMobile || isDesktopForced;

  return {
    shouldUseMobileLayout,
    shouldUseDesktopLayout,
    isDesktopForced,
    isActualMobile,
    isHydrated,
  };
}
