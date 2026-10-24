"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_EXIT_DURATION = 220;

type AnimatedDismissOptions = {
  onDismiss: () => void;
  disabled?: boolean;
  duration?: number;
};

export function useAnimatedDismiss({
  onDismiss,
  disabled = false,
  duration = DEFAULT_EXIT_DURATION,
}: AnimatedDismissOptions) {
  const [isClosing, setIsClosing] = useState(false);
  const closingRef = useRef(false);
  const disabledRef = useRef(disabled);
  const dismissRef = useRef(onDismiss);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    disabledRef.current = disabled;
    dismissRef.current = onDismiss;
  }, [disabled, onDismiss]);

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    },
    [],
  );

  const startDismiss = useCallback(
    (force: boolean) => {
      if (closingRef.current || (!force && disabledRef.current)) return;

      closingRef.current = true;
      setIsClosing(true);

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      timerRef.current = window.setTimeout(
        () => {
          timerRef.current = null;
          closingRef.current = false;
          setIsClosing(false);
          dismissRef.current();
        },
        reduceMotion ? 0 : duration,
      );
    },
    [duration],
  );

  const requestDismiss = useCallback(() => startDismiss(false), [startDismiss]);
  const forceDismiss = useCallback(() => startDismiss(true), [startDismiss]);

  return { isClosing, requestDismiss, forceDismiss };
}
