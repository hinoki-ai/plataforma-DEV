"use client";

import { useState } from "react";

interface UseSidebarGesturesProps {
  onToggleSidebar: (collapsed: boolean) => void;
  isSidebarCollapsed: boolean;
}

export function useSidebarGestures({
  onToggleSidebar,
  isSidebarCollapsed,
}: UseSidebarGesturesProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Close sidebar on left swipe, open on right swipe (when closed)
    if (isLeftSwipe && !isSidebarCollapsed) {
      onToggleSidebar(true);
    } else if (isRightSwipe && isSidebarCollapsed) {
      onToggleSidebar(false);
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
