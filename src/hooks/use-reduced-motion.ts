import * as React from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Tracks the user's reduced-motion preference. Returns `true` during SSR and the
 * first client render so motion-heavy work (shaders, GSAP) is never started
 * before we know the real preference, avoiding hydration mismatches and flashes.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(true);

  React.useEffect(() => {
    const media = window.matchMedia(QUERY);
    setReduced(media.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
