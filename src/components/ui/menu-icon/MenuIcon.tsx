import type * as React from "react";
import { cn } from "../../../lib/utils";

interface MenuIconProps extends React.ComponentProps<"span"> {
  /** Draws the cross that closes the menu instead of the two lines that open it. */
  open?: boolean;
}

/**
 * Two lines that fold into a cross. Drawn in markup rather than taken from the icon set, so the
 * stylesheet can move each line: the close button's cross unfolds from the trigger's two lines
 * while the menu opens over them.
 */
export function MenuIcon({ open = false, className, ...props }: MenuIconProps) {
  return (
    <span
      data-slot="menu-icon"
      data-state={open ? "open" : "closed"}
      aria-hidden="true"
      className={cn("relative size-4 shrink-0", className)}
      {...props}
    >
      <span className="absolute inset-x-0.5 top-1/2 -mt-px h-0.5 rounded-full bg-current" />
      <span className="absolute inset-x-0.5 top-1/2 -mt-px h-0.5 rounded-full bg-current" />
    </span>
  );
}
