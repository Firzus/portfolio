import type * as React from "react";
import { cn } from "../../../lib/utils";
import { useCarousel } from "./Carousel";

interface CarouselSlideProps extends React.ComponentProps<"div"> {
  /** Position of the slide in the row, from 0. */
  index: number;
}

/**
 * One slide. Away from the middle it is a drop of ink that the stylesheet settles into a frame
 * as it arrives; pressing a slide left showing at the side brings it to the middle.
 *
 * The caller labels it with its position (`aria-label`) and gives `aria-roledescription` in the
 * page's language.
 */
export function CarouselSlide({ index, className, onClick, ...props }: CarouselSlideProps) {
  const carousel = useCarousel();
  return (
    <div
      data-slot="carousel-slide"
      data-active={index === carousel.index ? "" : undefined}
      role="group"
      onClick={(event) => {
        onClick?.(event);
        if (index !== carousel.index) carousel.go(index);
      }}
      className={cn(
        "relative w-5/6 shrink-0 snap-center overflow-hidden rounded-lg border border-line bg-surface md:w-3/4",
        className,
      )}
      {...props}
    />
  );
}
