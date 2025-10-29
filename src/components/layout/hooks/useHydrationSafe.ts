"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const notify = () => callback();

  if (typeof queueMicrotask === "function") {
    queueMicrotask(notify);
  } else {
    setTimeout(notify, 0);
  }

  return () => {};
}

const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

// Hook for client components to detect hydration without triggering setState in effects
export function useHydrationSafe() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
