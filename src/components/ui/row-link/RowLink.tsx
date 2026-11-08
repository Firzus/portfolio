import type * as React from "react";
import { cn } from "../../../lib/utils";
import { rowLayout } from "./rowLayout";

/** A row of a link list, closed by a hairline. */
export function RowLink({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      data-slot="row-link"
      className={cn(
        rowLayout,
        "group rounded-sm transition-colors hover:text-accent motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}
