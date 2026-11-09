import gsap from "gsap";
import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { hasFinePointer, prefersReducedMotion } from "../../lib/motion";

/*
 * Pointer effects that move the components like the liquid of the shaders: springs that follow
 * the pointer and settle with a small elastic overshoot, a pill merged by the goo filter, a fill
 * that pours from the pointer and a ripple over pictures (filters in FluidDefs.tsx). They read the
 * browser, so they run in effects and handlers only, and do nothing under reduced motion or
 * without a pointer that hovers, except the ripple, which plays once on touch screens.
 */

const fluid = () => hasFinePointer() && !prefersReducedMotion();

const settle = "elastic.out(1, 0.45)";

/**
 * Pulls the element toward the pointer while it is over it, its `[data-magnetic-inner]` content a
 * little further so it lags like a drop, and lets both spring back on leave.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.3) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !fluid()) return;
    const inner = el.querySelector<HTMLElement>("[data-magnetic-inner]");
    const moving = inner ? [el, inner] : [el];
    const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
    const ix = inner && gsap.quickTo(inner, "x", { duration: 0.7, ease: "power3.out" });
    const iy = inner && gsap.quickTo(inner, "y", { duration: 0.7, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      x(dx * strength);
      y(dy * strength);
      ix?.(dx * strength * 0.5);
      iy?.(dy * strength * 0.5);
    };
    const leave = () => {
      gsap.to(moving, { x: 0, y: 0, duration: 1, ease: settle, overwrite: true });
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(moving);
    };
  }, [strength]);
  return ref;
}

/**
 * A pill that flows to the hovered or focused item of `list` and back to the current one. Its two
 * shapes travel at different speeds under the goo filter, so the pill stretches into a drop on the
 * way and snaps back into one shape when it lands. `current` is the index of the current item, or
 * -1 when none is current, which hides the pill at rest.
 */
export function useLiquidPill(list: RefObject<HTMLElement | null>, items: string, current: number) {
  const layer = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = list.current;
    const host = layer.current;
    if (!root || !host) return;
    const shapes = Array.from(host.children) as HTMLElement[];
    const [lead, trail] = shapes;
    if (!lead || !trail) return;
    const targets = () => Array.from(root.querySelectorAll<HTMLElement>(items));
    const place = (index: number, animate: boolean) => {
      const target = targets()[index];
      if (!target) {
        gsap.to(shapes, { opacity: 0, duration: 0.2, overwrite: true });
        return;
      }
      const base = root.getBoundingClientRect();
      const r = target.getBoundingClientRect();
      const to = {
        x: r.left - base.left,
        y: r.top - base.top,
        width: r.width,
        height: r.height,
        opacity: 1,
      };
      if (!animate || !fluid()) {
        gsap.set(shapes, { ...to, overwrite: true });
        return;
      }
      gsap.to(lead, { ...to, duration: 0.45, ease: "power3.out", overwrite: true });
      gsap.to(trail, { ...to, duration: 0.75, ease: "elastic.out(1, 0.7)", overwrite: true });
    };
    place(current, false);
    const over = (e: Event) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>(items);
      const index = item ? targets().indexOf(item) : -1;
      if (index >= 0) place(index, true);
    };
    const out = () => place(current, true);
    // The font and the window change the links' widths after the first placement.
    const resize = new ResizeObserver(() => place(current, false));
    resize.observe(root);
    root.addEventListener("pointerover", over);
    root.addEventListener("focusin", over);
    root.addEventListener("pointerleave", out);
    root.addEventListener("focusout", out);
    return () => {
      resize.disconnect();
      root.removeEventListener("pointerover", over);
      root.removeEventListener("focusin", over);
      root.removeEventListener("pointerleave", out);
      root.removeEventListener("focusout", out);
      gsap.killTweensOf(shapes);
    };
  }, [list, items, current]);
  return layer;
}

/**
 * A fill that pours into a row from where the pointer enters and drains toward where it leaves,
 * as a circle growing from that point. Spread the returned handlers on the row; the fill is its
 * `[data-slot=row-fill]` child.
 */
export function usePour() {
  const at = (e: ReactPointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return {
      fill: e.currentTarget.querySelector<HTMLElement>("[data-slot='row-fill']"),
      pos: `${e.clientX - r.left}px ${e.clientY - r.top}px`,
    };
  };
  return {
    onPointerEnter: (e: ReactPointerEvent<HTMLElement>) => {
      const { fill, pos } = at(e);
      if (!fill || !fluid()) return;
      gsap.fromTo(
        fill,
        { clipPath: `circle(0% at ${pos})` },
        { clipPath: `circle(150% at ${pos})`, duration: 0.9, ease: "power3.out", overwrite: true },
      );
    },
    onPointerLeave: (e: ReactPointerEvent<HTMLElement>) => {
      const { fill, pos } = at(e);
      if (!fill || !fluid()) return;
      gsap.to(fill, {
        clipPath: `circle(0% at ${pos})`,
        duration: 0.6,
        ease: "power2.inOut",
        overwrite: true,
      });
    },
  };
}

/**
 * Ripples a picture while it, or the link around it, is hovered: the shared displacement filter
 * is attached to that picture only, swells, drifts, then flattens out and is detached on leave.
 * Touch screens cannot hover, so there each picture ripples once as it comes into view instead.
 */
export function useRipple<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const touch = !hasFinePointer() && window.matchMedia("(pointer: coarse)").matches;
    if (!hasFinePointer() && !touch) return;
    const map = document.querySelector("[data-slot='ripple-map']");
    const noise = document.querySelector("[data-slot='ripple-noise']");
    if (!map || !noise) return;
    const state = { scale: 0, fx: 0.012, fy: 0.02 };
    const apply = () => {
      map.setAttribute("scale", state.scale.toFixed(2));
      noise.setAttribute("baseFrequency", `${state.fx.toFixed(4)} ${state.fy.toFixed(4)}`);
    };
    let drift: gsap.core.Tween | undefined;
    const enter = () => {
      el.style.filter = "url(#fluid-ripple)";
      gsap.to(state, {
        scale: 22,
        duration: 0.5,
        ease: "power2.out",
        onUpdate: apply,
        overwrite: "auto",
      });
      drift?.kill();
      drift = gsap.to(state, {
        fx: 0.02,
        fy: 0.012,
        duration: 2.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        onUpdate: apply,
      });
      gsap.to(el, { scale: 1.035, duration: 0.8, ease: settle });
    };
    const leave = () => {
      drift?.kill();
      gsap.to(state, {
        scale: 0,
        duration: 0.9,
        ease: settle,
        onUpdate: apply,
        overwrite: "auto",
        onComplete: () => {
          el.style.filter = "";
        },
      });
      gsap.to(el, { scale: 1, duration: 0.9, ease: settle });
    };
    const cleanup = () => {
      drift?.kill();
      gsap.killTweensOf([state, el]);
      el.style.filter = "";
    };
    if (touch) {
      let timer = 0;
      const seen = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          seen.disconnect();
          enter();
          timer = window.setTimeout(leave, 700);
        },
        { threshold: 0.6 },
      );
      seen.observe(el);
      return () => {
        seen.disconnect();
        window.clearTimeout(timer);
        cleanup();
      };
    }
    const host = el.closest("a") ?? el;
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
      cleanup();
    };
  }, []);
  return ref;
}
