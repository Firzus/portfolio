import type * as React from "react";
import { createContext, use, useCallback, useMemo, useRef, useState } from "react";
import { prefersReducedMotion } from "../../../lib/motion";
import { cn } from "../../../lib/utils";

interface CarouselState {
  /** Position of the slide nearest the middle of the viewport, from 0. */
  index: number;
  count: number;
  viewport: React.RefObject<HTMLDivElement | null>;
  /** Reads the scroll position again; the viewport calls it as it scrolls or resizes. */
  sync: () => void;
  /** Scrolls the slide at this position to the middle. */
  go: (index: number) => void;
}

const CarouselContext = createContext<CarouselState | null>(null);

export function useCarousel(): CarouselState {
  const state = use(CarouselContext);
  if (!state) throw new Error("A carousel part must be rendered inside <Carousel>.");
  return state;
}

const middle = (element: HTMLElement) => element.offsetLeft + element.offsetWidth / 2;

interface CarouselProps extends React.ComponentProps<"div"> {
  /** Number of slides, known while rendering so the server draws the controls in their state. */
  count: number;
}

/**
 * A row of slides scrolled sideways, one at a time in the middle. The scrolling is the browser's
 * own, so touch, trackpad and keyboard work without scripts; the controls only add to it.
 *
 * The caller names the region (`aria-label` or `aria-labelledby`) and gives `aria-roledescription`
 * in the page's language, since assistive technology reads it aloud.
 */
export function Carousel({ count, className, children, ...props }: CarouselProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const sync = useCallback(() => {
    const scroller = viewport.current;
    if (!scroller) return;
    const centre = scroller.scrollLeft + scroller.clientWidth / 2;
    let nearest = 0;
    let gap = Infinity;
    Array.from(scroller.children).forEach((slide, position) => {
      const distance = Math.abs(middle(slide as HTMLElement) - centre);
      if (distance < gap) [nearest, gap] = [position, distance];
    });
    setIndex(nearest);
  }, []);

  const go = useCallback((target: number) => {
    const scroller = viewport.current;
    const slide = scroller?.children[target] as HTMLElement | undefined;
    if (!scroller || !slide) return;
    scroller.scrollTo({
      left: middle(slide) - scroller.clientWidth / 2,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, []);

  const state = useMemo(() => ({ index, count, viewport, sync, go }), [index, count, sync, go]);
  return (
    <CarouselContext value={state}>
      <div data-slot="carousel" role="region" className={cn("relative", className)} {...props}>
        {children}
      </div>
    </CarouselContext>
  );
}
