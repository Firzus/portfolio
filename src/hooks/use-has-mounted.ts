import * as React from "react";

/**
 * Returns `false` during SSR and the first client render, then `true` after
 * mount. Use it to gate browser-only / GPU-only UI so the server and the
 * initial client tree stay identical (no hydration mismatch).
 */
export function useHasMounted(): boolean {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}
