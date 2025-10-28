'use client';

import { useRef, useCallback, useEffect } from 'react';

interface GestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
}

interface GestureOptions {
  swipeThreshold?: number;
  pinchThreshold?: number;
  doubleTapDelay?: number;
  longPressDelay?: number;
  preventScroll?: boolean;
}

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export function useMobileGestures(handlers: GestureHandlers, options: GestureOptions = {}) {
  const {
    swipeThreshold = 50,
    pinchThreshold = 0.1,
    doubleTapDelay = 300,
    longPressDelay = 500,
    preventScroll = false,
  } = options;

  const startTouches = useRef<TouchPoint[]>([]);
  const lastTap = useRef<TouchPoint | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const initialDistance = useRef<number>(0);

  const getDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getTouchPoint = useCallback(
    (touch: Touch): TouchPoint => ({
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    }),
    []
  );

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      const touches = Array.from(event.touches).map(getTouchPoint);
      startTouches.current = touches;

      // Handle long press for single touch
      if (touches.length === 1 && handlers.onLongPress) {
        longPressTimer.current = setTimeout(() => {
          handlers.onLongPress?.();
        }, longPressDelay);
      }

      // Handle pinch start for two touches
      if (touches.length === 2) {
        initialDistance.current = getDistance(event.touches[0], event.touches[1]);
      }

      if (preventScroll && touches.length > 1) {
        event.preventDefault();
      }
    },
    [handlers, longPressDelay, preventScroll, getTouchPoint, getDistance]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      // Clear long press timer on move
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      // Handle pinch gesture
      if (event.touches.length === 2 && handlers.onPinch && initialDistance.current > 0) {
        const currentDistance = getDistance(event.touches[0], event.touches[1]);
        const scale = currentDistance / initialDistance.current;

        if (Math.abs(scale - 1) > pinchThreshold) {
          handlers.onPinch(scale);
        }
      }

      if (preventScroll) {
        event.preventDefault();
      }
    },
    [handlers, pinchThreshold, preventScroll, getDistance]
  );

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      // Clear long press timer
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      const endTouches = Array.from(event.changedTouches).map(getTouchPoint);

      if (startTouches.current.length === 1 && endTouches.length === 1) {
        const start = startTouches.current[0];
        const end = endTouches[0];

        const deltaX = end.x - start.x;
        const deltaY = end.y - start.y;
        const deltaTime = end.timestamp - start.timestamp;

        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Handle swipe gestures
        if (distance > swipeThreshold && deltaTime < 500) {
          const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

          if (Math.abs(angle) < 45) {
            // Right swipe
            handlers.onSwipeRight?.();
          } else if (Math.abs(angle) > 135) {
            // Left swipe
            handlers.onSwipeLeft?.();
          } else if (angle > 45 && angle < 135) {
            // Down swipe
            handlers.onSwipeDown?.();
          } else if (angle < -45 && angle > -135) {
            // Up swipe
            handlers.onSwipeUp?.();
          }
        }

        // Handle double tap
        else if (distance < 20 && deltaTime < 200 && handlers.onDoubleTap) {
          if (
            lastTap.current &&
            end.timestamp - lastTap.current.timestamp < doubleTapDelay &&
            Math.abs(end.x - lastTap.current.x) < 50 &&
            Math.abs(end.y - lastTap.current.y) < 50
          ) {
            handlers.onDoubleTap();
            lastTap.current = null;
          } else {
            lastTap.current = end;
          }
        }
      }

      // Reset for next gesture
      startTouches.current = [];
      initialDistance.current = 0;
    },
    [handlers, swipeThreshold, doubleTapDelay, getTouchPoint]
  );

  const attachGestures = useCallback(
    (element: HTMLElement | null) => {
      if (!element) return;

      element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll });
      element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });

      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    },
    [handleTouchStart, handleTouchMove, handleTouchEnd, preventScroll]
  );

  return { attachGestures };
}

// Hook for haptic feedback
export function useHapticFeedback() {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const lightTap = useCallback(() => vibrate(10), [vibrate]);
  const mediumTap = useCallback(() => vibrate(20), [vibrate]);
  const heavyTap = useCallback(() => vibrate([30, 10, 30]), [vibrate]);
  const success = useCallback(() => vibrate([100, 50, 100]), [vibrate]);
  const error = useCallback(() => vibrate([200, 100, 200, 100, 200]), [vibrate]);

  return {
    vibrate,
    lightTap,
    mediumTap,
    heavyTap,
    success,
    error,
  };
}

// Hook for device orientation
export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const updateOrientation = () => {
      if (window.innerHeight > window.innerWidth) {
        setOrientation('portrait');
      } else {
        setOrientation('landscape');
      }
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
}

// Import useState for the orientation hook
import { useState } from 'react';
