import type * as React from "react";
import { cn } from "../../../lib/utils";

/** A short fact set in a filled pill. */
export function Chip({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="chip"
      className={cn(
        "inline-flex items-center rounded-md bg-ink/6 px-2 py-1 text-caption font-medium text-ink/70",
        className,
      )}
      {...props}
    />
  );
}
