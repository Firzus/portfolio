import type * as React from "react";
import { cn } from "../../../lib/utils";
import { useCarousel } from "./Carousel";

const padded = (value: number) => String(value).padStart(2, "0");

/**
 * The current position over the number of slides, as figures. Hidden from assistive technology,
 * which reads the position from each slide's own label.
 */
export function CarouselCount({ className, ...props }: React.ComponentProps<"p">) {
  const { index, count } = useCarousel();
  return (
    <p
      data-slot="carousel-count"
      aria-hidden="true"
      className={cn(
        "font-display text-title font-heading whitespace-nowrap tabular-nums no-js:hidden",
        className,
      )}
      {...props}
    >
      {padded(index + 1)}
      <span className="text-muted"> / {padded(count)}</span>
    </p>
  );
}
