import type * as React from "react";
import { cn } from "../../../lib/utils";
import { rowLayout } from "./rowLayout";

/** A row of a link list whose destination does not exist yet: same layout, but not a link. */
export function RowPlaceholder({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="row-placeholder"
      className={cn(rowLayout, "text-muted", className)}
      {...props}
    />
  );
}
