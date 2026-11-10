import type * as React from "react";
import { gutter } from "../../../lib/layout";
import { cn } from "../../../lib/utils";

/** A full-width section of the framed column, closed by a hairline. */
export function Band({ className, children, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="band"
      className={cn(gutter, "border-b border-line py-14 md:py-20", className)}
      {...props}
    >
      {children}
    </section>
  );
}
