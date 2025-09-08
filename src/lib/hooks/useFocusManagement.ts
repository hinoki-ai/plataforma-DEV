'use client';

import { useEffect, useRef } from 'react';

interface UseFocusManagementOptions {
  trapFocus?: boolean;
  initialFocus?: string;
  returnFocus?: boolean;
}

/**
 * Focus management hook for accessibility
 * Handles focus trapping, initial focus, and keyboard navigation
 */
export function useFocusManagement({
  trapFocus = false,
  initialFocus,
  returnFocus = true,
}: UseFocusManagementOptions = {}) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    // Set initial focus
    if (initialFocus) {
      const initialElement = container.querySelector(
        initialFocus
      ) as HTMLElement;
      initialElement?.focus();
    } else {
      firstElement?.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!trapFocus) return;

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }

      if (event.key === 'Escape') {
        container.dispatchEvent(new CustomEvent('escape-pressed'));
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [trapFocus, initialFocus, returnFocus]);

  return containerRef;
}

/**
 * Announce content changes to screen readers
 */
export function useAriaLive(regionId: string, message: string, polite = true) {
  useEffect(() => {
    const region = document.getElementById(regionId);
    if (region) {
      region.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  }, [message, regionId, polite]);
}

/**
 * Skip to main content function
 */
export function skipToMainContent() {
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.tabIndex = -1;
    mainContent.focus();
    // Remove tabindex after focus
    setTimeout(() => {
      mainContent.removeAttribute('tabindex');
    }, 100);
  }
}

/**
 * Focus trap for modals and dialogs
 */
export function createFocusTrap(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;

  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);

  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}
