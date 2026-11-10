import type * as React from "react";
import { useMemo } from "react";
import { cn, mergeRefs } from "../../../lib/utils";
import { useRipple } from "../../motion/fluid";

/**
 * A project picture in a hairline frame, at the shape shared by every project picture. It
 * ripples once as it comes into view on a touch screen.
 */
export function Thumbnail({
  className,
  loading = "lazy",
  ref,
  ...props
}: React.ComponentProps<"img">) {
  const ripple = useRipple<HTMLImageElement>();
  const refs = useMemo(() => mergeRefs(ref, ripple), [ref, ripple]);
  return (
    <img
      ref={refs}
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
