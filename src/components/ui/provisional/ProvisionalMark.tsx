import type * as React from "react";
import { cn } from "../../../lib/utils";
import { m } from "../../../paraglide/messages.js";

/** Visible mark after a text that Lilian has not confirmed yet. */
export function ProvisionalMark({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="provisional-mark"
      className={cn(
        "ml-2 inline-block rounded-sm bg-surface px-1.5 align-middle text-small font-normal text-muted",
        className,
      )}
      {...props}
    >
      {m.provisional_mark()}
    </span>
  );
}
