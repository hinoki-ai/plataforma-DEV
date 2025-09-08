'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

export interface GestureEvent {
  deltaX: number;
  deltaY: number;
  velocity: number;
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  startTime: number;
  endTime: number;
  duration: number;
  target: HTMLElement;
}

export interface SwipeGestureOptions {
  onSwipeLeft?: (event: GestureEvent) => void;
  onSwipeRight?: (event: GestureEvent) => void;
  onSwipeUp?: (event: GestureEvent) => void;
  onSwipeDown?: (event: GestureEvent) => void;
  threshold?: number;
  velocityThreshold?: number;
  timeThreshold?: number;
  preventDefault?: boolean;
  enabled?: boolean;
}

export interface PinchGestureOptions {
  onPinchStart?: (scale: number) => void;
  onPinchMove?: (scale: number, delta: number) => void;
  onPinchEnd?: (scale: number) => void;
  minScale?: number;
  maxScale?: number;
  enabled?: boolean;
}

export interface PanGestureOptions {
  onPanStart?: (event: GestureEvent) => void;
  onPanMove?: (event: GestureEvent) => void;
  onPanEnd?: (event: GestureEvent) => void;
  threshold?: number;
  axis?: 'x' | 'y' | 'both';
  enabled?: boolean;
}

/**
 * Hook for handling swipe gestures on touch devices
 */
export function useSwipeGesture(
  elementRef: React.RefObject<HTMLElement | null>,
  options: SwipeGestureOptions = {}
) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    velocityThreshold = 0.3,
    timeThreshold = 300,
    preventDefault = true,
    enabled = true,
  } = options;

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null
  );
  const [isGestureActive, setIsGestureActive] = useState(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || e.touches.length !== 1) return;

      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      setIsGestureActive(true);

      if (preventDefault) {
        e.preventDefault();
      }
    },
    [enabled, preventDefault]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !touchStartRef.current || e.touches.length !== 1) return;

      if (preventDefault) {
        e.preventDefault();
      }
    },
    [enabled, preventDefault]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const endTime = Date.now();
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const duration = endTime - touchStartRef.current.time;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / duration;

      setIsGestureActive(false);

      // Check if gesture meets thresholds
      if (
        distance < threshold ||
        duration > timeThreshold ||
        velocity < velocityThreshold
      ) {
        touchStartRef.current = null;
        return;
      }

      // Determine direction
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      let direction: 'left' | 'right' | 'up' | 'down';

      if (absX > absY) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      const gestureEvent: GestureEvent = {
        deltaX,
        deltaY,
        velocity,
        direction,
        distance,
        startTime: touchStartRef.current.time,
        endTime,
        duration,
        target: e.target as HTMLElement,
      };

      // Call appropriate callback
      switch (direction) {
        case 'left':
          onSwipeLeft?.(gestureEvent);
          break;
        case 'right':
          onSwipeRight?.(gestureEvent);
          break;
        case 'up':
          onSwipeUp?.(gestureEvent);
          break;
        case 'down':
          onSwipeDown?.(gestureEvent);
          break;
      }

      touchStartRef.current = null;

      if (preventDefault) {
        e.preventDefault();
      }
    },
    [
      enabled,
      threshold,
      timeThreshold,
      velocityThreshold,
      preventDefault,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
    ]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    // Add passive false to allow preventDefault
    const options = { passive: !preventDefault };

    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, options);
    element.addEventListener('touchend', handleTouchEnd, options);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    elementRef,
    enabled,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    preventDefault,
  ]);

  return {
    isGestureActive,
    resetGesture: () => {
      touchStartRef.current = null;
      setIsGestureActive(false);
    },
  };
}

/**
 * Hook for handling pinch/zoom gestures
 */
export function usePinchGesture(
  elementRef: React.RefObject<HTMLElement | null>,
  options: PinchGestureOptions = {}
) {
  const {
    onPinchStart,
    onPinchMove,
    onPinchEnd,
    minScale = 0.5,
    maxScale = 3,
    enabled = true,
  } = options;

  const initialDistanceRef = useRef<number>(0);
  const currentScaleRef = useRef<number>(1);
  const [isPinching, setIsPinching] = useState(false);

  const getDistance = useCallback((touches: TouchList) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }, []);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || e.touches.length !== 2) return;

      initialDistanceRef.current = getDistance(e.touches);
      setIsPinching(true);
      onPinchStart?.(currentScaleRef.current);
    },
    [enabled, getDistance, onPinchStart]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !isPinching || e.touches.length !== 2) return;

      e.preventDefault();

      const currentDistance = getDistance(e.touches);
      const scale = Math.max(
        minScale,
        Math.min(
          maxScale,
          (currentDistance / initialDistanceRef.current) *
            currentScaleRef.current
        )
      );

      const delta = scale - currentScaleRef.current;
      currentScaleRef.current = scale;

      onPinchMove?.(scale, delta);
    },
    [enabled, isPinching, getDistance, minScale, maxScale, onPinchMove]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !isPinching) return;

      setIsPinching(false);
      onPinchEnd?.(currentScaleRef.current);
    },
    [enabled, isPinching, onPinchEnd]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    element.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isPinching,
    currentScale: currentScaleRef.current,
    resetScale: () => {
      currentScaleRef.current = 1;
    },
  };
}

/**
 * Hook for handling pan/drag gestures
 */
export function usePanGesture(
  elementRef: React.RefObject<HTMLElement | null>,
  options: PanGestureOptions = {}
) {
  const {
    onPanStart,
    onPanMove,
    onPanEnd,
    threshold = 10,
    axis = 'both',
    enabled = true,
  } = options;

  const startPositionRef = useRef<{ x: number; y: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || e.touches.length !== 1) return;

      const touch = e.touches[0];
      startPositionRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    },
    [enabled]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !startPositionRef.current || e.touches.length !== 1)
        return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - startPositionRef.current.x;
      const deltaY = touch.clientY - startPositionRef.current.y;

      // Check if movement exceeds threshold
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance < threshold && !isPanning) return;

      // Filter by axis if specified
      let filteredDeltaX = deltaX;
      let filteredDeltaY = deltaY;

      if (axis === 'x') {
        filteredDeltaY = 0;
      } else if (axis === 'y') {
        filteredDeltaX = 0;
      }

      const gestureEvent: GestureEvent = {
        deltaX: filteredDeltaX,
        deltaY: filteredDeltaY,
        velocity: 0, // Could be calculated if needed
        direction:
          Math.abs(deltaX) > Math.abs(deltaY)
            ? deltaX > 0
              ? 'right'
              : 'left'
            : deltaY > 0
              ? 'down'
              : 'up',
        distance,
        startTime: 0,
        endTime: Date.now(),
        duration: 0,
        target: e.target as HTMLElement,
      };

      if (!isPanning) {
        setIsPanning(true);
        onPanStart?.(gestureEvent);
      } else {
        onPanMove?.(gestureEvent);
      }
    },
    [enabled, threshold, axis, isPanning, onPanStart, onPanMove]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !startPositionRef.current) return;

      if (isPanning) {
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - startPositionRef.current.x;
        const deltaY = touch.clientY - startPositionRef.current.y;

        const gestureEvent: GestureEvent = {
          deltaX,
          deltaY,
          velocity: 0,
          direction:
            Math.abs(deltaX) > Math.abs(deltaY)
              ? deltaX > 0
                ? 'right'
                : 'left'
              : deltaY > 0
                ? 'down'
                : 'up',
          distance: Math.sqrt(deltaX * deltaX + deltaY * deltaY),
          startTime: 0,
          endTime: Date.now(),
          duration: 0,
          target: e.target as HTMLElement,
        };

        onPanEnd?.(gestureEvent);
      }

      setIsPanning(false);
      startPositionRef.current = null;
    },
    [enabled, isPanning, onPanEnd]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isPanning,
    resetPan: () => {
      setIsPanning(false);
      startPositionRef.current = null;
    },
  };
}

/**
 * Combined gesture hook for complex interactions
 */
export function useMultiGesture(
  elementRef: React.RefObject<HTMLElement | null>,
  options: {
    swipe?: SwipeGestureOptions;
    pinch?: PinchGestureOptions;
    pan?: PanGestureOptions;
    enabled?: boolean;
  } = {}
) {
  const { swipe, pinch, pan, enabled = true } = options;

  const swipeGesture = useSwipeGesture(elementRef, {
    ...swipe,
    enabled: enabled && !!swipe,
  });

  const pinchGesture = usePinchGesture(elementRef, {
    ...pinch,
    enabled: enabled && !!pinch,
  });

  const panGesture = usePanGesture(elementRef, {
    ...pan,
    enabled: enabled && !!pan,
  });

  return {
    swipe: swipeGesture,
    pinch: pinchGesture,
    pan: panGesture,
    isActive:
      swipeGesture.isGestureActive ||
      pinchGesture.isPinching ||
      panGesture.isPanning,
    reset: () => {
      swipeGesture.resetGesture();
      pinchGesture.resetScale();
      panGesture.resetPan();
    },
  };
}

/**
 * Navigation-specific gesture combinations
 */
export function useNavigationGestures(
  options: {
    onSwipeToGoBack?: () => void;
    onSwipeToGoForward?: () => void;
    onSwipeToOpenMenu?: () => void;
    onSwipeToCloseMenu?: () => void;
    onPinchToZoom?: (scale: number) => void;
    enabled?: boolean;
  } = {}
) {
  const {
    onSwipeToGoBack,
    onSwipeToGoForward,
    onSwipeToOpenMenu,
    onSwipeToCloseMenu,
    onPinchToZoom,
    enabled = true,
  } = options;

  const elementRef = useRef<HTMLElement>(null);

  const swipeOptions: SwipeGestureOptions = {
    onSwipeRight: onSwipeToGoBack || onSwipeToOpenMenu,
    onSwipeLeft: onSwipeToGoForward || onSwipeToCloseMenu,
    threshold: 80,
    velocityThreshold: 0.4,
    enabled,
  };

  const pinchOptions: PinchGestureOptions = {
    onPinchMove: onPinchToZoom,
    enabled: enabled && !!onPinchToZoom,
  };

  const gestures = useMultiGesture(elementRef, {
    swipe: swipeOptions,
    pinch: pinchOptions,
    enabled,
  });

  // Auto-attach to body if no specific element
  useEffect(() => {
    if (!elementRef.current) {
      elementRef.current = document.body;
    }
  }, []);

  return {
    ...gestures,
    attachToElement: (element: HTMLElement) => {
      elementRef.current = element;
    },
  };
}

/**
 * Utility for vibration feedback on supported devices
 */
export function useHapticFeedback() {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const tapFeedback = useCallback(() => vibrate(10), [vibrate]);
  const longPressFeedback = useCallback(() => vibrate([20, 10, 20]), [vibrate]);
  const errorFeedback = useCallback(() => vibrate([100, 50, 100]), [vibrate]);
  const successFeedback = useCallback(
    () => vibrate([20, 10, 20, 10, 20]),
    [vibrate]
  );

  return {
    vibrate,
    tapFeedback,
    longPressFeedback,
    errorFeedback,
    successFeedback,
    isSupported: 'vibrate' in navigator,
  };
}
