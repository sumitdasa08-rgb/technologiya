import { useCallback } from "react";

/**
 * Custom hook for triggering haptic feedback on mobile devices
 * Uses the Vibration API when available
 */
export const useHaptic = (duration: number = 10) => {
  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(duration);
    }
  }, [duration]);

  return { triggerHaptic };
};

/**
 * Standalone function for triggering haptic feedback
 * Useful for non-hook contexts
 */
export const triggerHapticFeedback = (duration: number = 10): void => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(duration);
  }
};
