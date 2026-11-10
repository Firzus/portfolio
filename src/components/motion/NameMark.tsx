import gsap from "gsap";
import { useEffect, useRef } from "react";
import { hasFinePointer, prefersReducedMotion } from "../../lib/motion";
import { cn } from "../../lib/utils";
import { nameMark } from "./lettering";
import { swollenName } from "./wave";

/**
 * The name in the hand lettering of the loading screen, filled with the ink. When the link around
 * it is hovered, a swell runs through the letters once, as on the loading screen. Decorative: the
 * link names itself with hidden text.
 */
export function NameMark({ className }: { className?: string }) {
  const mark = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = mark.current;
    const path = svg?.querySelector("path");
    const host = svg?.closest("a");
    if (!path || !host || !hasFinePointer() || prefersReducedMotion()) return;
    const swell = { amount: 0, x: -400, phase: 0 };
    const draw = () => path.setAttribute("d", swollenName(swell));
    let run: gsap.core.Timeline | undefined;
    const play = () => {
      // A swell already crossing the name finishes before another starts, so a quick in and out
      // does not restart it from the left.
      if (run?.isActive()) return;
      run = gsap
        .timeline({ onUpdate: draw, onComplete: draw })
        .fromTo(swell, { x: -400 }, { x: nameMark.width + 400, duration: 1.2, ease: "sine.inOut" })
        .fromTo(swell, { phase: 0 }, { phase: 6, duration: 1.2, ease: "none" }, 0)
        .to(swell, { amount: 1, duration: 0.35, ease: "power2.out" }, 0)
        .to(swell, { amount: 0, duration: 0.45, ease: "power2.in" }, 0.75);
    };
    host.addEventListener("pointerenter", play);
    return () => {
      host.removeEventListener("pointerenter", play);
      run?.kill();
      path.setAttribute("d", nameMark.d);
    };
  }, []);
  return (
    <svg
      ref={mark}
      data-slot="name-mark"
      aria-hidden="true"
      viewBox={`0 0 ${nameMark.width} ${nameMark.height}`}
      className={cn("h-7 w-auto overflow-visible fill-ink", className)}
    >
      <path d={nameMark.d} />
    </svg>
  );
}
