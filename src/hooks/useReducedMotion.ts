'use client';

import { useSyncExternalStore } from 'react';

/**
 * Get the current reduced motion preference
 */
function getReducedMotionPreference(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Subscribe to reduced motion preference changes
 */
function subscribeToReducedMotion(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);

  return () => {
    mediaQuery.removeEventListener('change', callback);
  };
}

/**
 * Hook to detect user's reduced motion preference
 *
 * Returns true if the user has enabled "reduce motion" in their system settings.
 * This hook listens for changes to the preference and updates accordingly.
 *
 * Uses useSyncExternalStore for proper synchronization with external state.
 *
 * @returns boolean - true if reduced motion is preferred
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 *
 * return (
 *   <motion.div
 *     animate={prefersReducedMotion ? {} : { scale: 1.1 }}
 *   >
 *     Content
 *   </motion.div>
 * );
 * ```
 */
export function useReducedMotion(): boolean {
  // Use useSyncExternalStore for proper synchronization
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionPreference,
    () => false // Server-side default
  );

  return prefersReducedMotion;
}

export default useReducedMotion;
