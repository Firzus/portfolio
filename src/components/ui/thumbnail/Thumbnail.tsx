import type * as React from "react";
import { cn } from "../../../lib/utils";

/** A project picture in a hairline frame, at the shape shared by every project picture. */
export function Thumbnail({ className, loading = "lazy", ...props }: React.ComponentProps<"img">) {
  return (
    <img
      data-slot="thumbnail"
      loading={loading}
      className={cn(
        "aspect-picture w-full rounded-lg border border-line bg-surface object-cover",
        className,
      )}
      {...props}
    />
  );
}
