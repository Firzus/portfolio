import type * as React from "react";
import { cn } from "../../../lib/utils";
import { usePour } from "../../motion/fluid";
import { rowLayout } from "./rowLayout";

/** A row of a link list, closed by a hairline; a faint fill pours in from where the pointer enters. */
export function RowLink({
  className,
  children,
  onPointerEnter,
  onPointerLeave,
  ...props
}: React.ComponentProps<"a">) {
  const pour = usePour();
  return (
    <a
      data-slot="row-link"
      className={cn(
        rowLayout,
        "group relative isolate rounded-sm transition-colors hover:text-accent motion-reduce:transition-none",
        className,
      )}
      onPointerEnter={(e) => {
        pour.onPointerEnter(e);
        onPointerEnter?.(e);
      }}
      onPointerLeave={(e) => {
        pour.onPointerLeave(e);
        onPointerLeave?.(e);
      }}
      {...props}
    >
      <span
        data-slot="row-fill"
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-3 inset-y-0 -z-10 rounded-md bg-ink/5"
      />
      {children}
    </a>
  );
}
