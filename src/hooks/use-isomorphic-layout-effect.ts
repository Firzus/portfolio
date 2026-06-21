import * as React from "react";

/**
 * `useLayoutEffect` on the client, `useEffect` on the server. Avoids React's SSR
 * warning while still letting us set initial GSAP state before the browser paints.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;
