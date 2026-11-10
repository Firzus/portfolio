import type * as React from "react";
import { cn } from "../../../lib/utils";
import { useCarousel } from "./Carousel";

interface CarouselControlProps extends React.ComponentProps<"button"> {
  /** Which neighbour of the current slide the button brings to the middle. */
  direction: "previous" | "next";
}

/**
 * A round button stepping to the neighbouring slide. At the end of the row it is announced as
 * disabled but stays focusable: a button disabled while focused drops the keyboard's place. The
 * caller names it with `aria-label`, since it only holds an icon.
 */
export function CarouselControl({ direction, className, onClick, ...props }: CarouselControlProps) {
  const { index, count, go } = useCarousel();
  const target = direction === "previous" ? index - 1 : index + 1;
  const atEnd = target < 0 || target >= count;
  return (
    <button
      type="button"
      data-slot="carousel-control"
      data-direction={direction}
      aria-disabled={atEnd}
      onClick={(event) => {
        onClick?.(event);
        if (!atEnd) go(target);
      }}
      className={cn(
        "grid size-11 place-items-center rounded-full border border-line text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-disabled:cursor-default aria-disabled:border-line aria-disabled:text-muted aria-disabled:opacity-50 motion-reduce:transition-none no-js:hidden",
        className,
      )}
      {...props}
    />
  );
}
