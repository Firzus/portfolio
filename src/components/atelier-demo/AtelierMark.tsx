import { useId } from "react";
import type * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Atelier's mark, from its brand kit: a hexagon (the kernel) cut by three seams into a cube (the
 * modules assembled around it). The seams are cut out, so the background shows through them. It
 * takes the text colour.
 */
export function AtelierMark({ className, ...props }: React.ComponentProps<"svg">) {
  const seams = useId();
  return (
    <svg
      data-slot="atelier-mark"
      aria-hidden="true"
      viewBox="0 0 100 100"
      className={cn("shrink-0", className)}
      {...props}
    >
      <mask id={seams}>
        <path
          d="M50 4 L86 24 Q90 26 90 31 L90 69 Q90 74 86 76 L50 96 L14 76 Q10 74 10 69 L10 31 Q10 26 14 24 Z"
          fill="#fff"
        />
        <path
          d="M50 50 L50 94 M50 50 L88 29 M50 50 L12 29"
          stroke="#000"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
      </mask>
      <rect width="100" height="100" fill="currentColor" mask={`url(#${seams})`} />
    </svg>
  );
}
