import { useEffect, useState } from "react";
import { prefersReducedMotion } from "../../../lib/motion";

/**
 * False during prerendering and the first client render, true once hydrated. Interactive parts
 * render their plain, complete fallback until then, so the page reads the same without JavaScript.
 */
export function useEnhanced() {
  const [enhanced, setEnhanced] = useState(false);
  useEffect(() => setEnhanced(true), []);
  return enhanced;
}

/**
 * Index of the picture shown by a slow crossfade: each one holds for `holdMs`, the cycle pauses
 * while the tab is hidden, and under reduced motion only the first picture is shown.
 */
export function useCycle(length: number, holdMs: number) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (length < 2 || prefersReducedMotion()) return;
    let timer: number | undefined;
    const schedule = () => {
      timer = window.setTimeout(() => {
        setIndex((i) => (i + 1) % length);
        schedule();
      }, holdMs);
    };
    const onVisibility = () => {
      window.clearTimeout(timer);
      if (!document.hidden) schedule();
    };
    schedule();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [length, holdMs]);
  return index;
}

export const mailto = (email: string) =>
  `mailto:${email}?subject=${encodeURIComponent("Contact depuis le portfolio")}`;
