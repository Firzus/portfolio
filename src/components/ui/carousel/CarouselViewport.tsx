import type * as React from "react";
import { useEffect, useMemo } from "react";
import { cn, mergeRefs } from "../../../lib/utils";
import { useCarousel } from "./Carousel";

/**
 * The scrolling row of slides. Focusable, so the arrow keys scroll it. An empty box as wide as
 * the part of a neighbour left showing stands before and after the slides, so the first and the
 * last can also stop in the middle.
 */
export function CarouselViewport({ className, ref, ...props }: React.ComponentProps<"div">) {
  const { viewport, sync } = useCarousel();
  const refs = useMemo(() => mergeRefs(ref, viewport), [ref, viewport]);

  useEffect(() => {
    const scroller = viewport.current;
    if (!scroller) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    const resize = new ResizeObserver(onScroll);
    resize.observe(scroller);
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", onScroll);
      resize.disconnect();
    };
  }, [viewport, sync]);

  return (
    <div
      ref={refs}
      data-slot="carousel-viewport"
      tabIndex={0}
      className={cn(
        "flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain before:w-1/12 before:shrink-0 after:w-1/12 after:shrink-0 md:gap-5 md:before:w-1/8 md:after:w-1/8",
        className,
      )}
      {...props}
    />
  );
}
