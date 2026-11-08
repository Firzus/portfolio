import gsap from "gsap";
import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type RefObject } from "react";

/*
 * Fluid interaction for piste D, so the components move like the liquid of the shaders:
 * - springs that follow the pointer and can be redirected mid-flight (gsap.quickTo), settling
 *   with a small elastic overshoot;
 * - a "gooey" SVG filter (blur, then a hard alpha threshold) that merges two shapes into one drop;
 * - a turbulence displacement that ripples a picture while it is hovered.
 * Everything is skipped under reduced motion and on touch screens, where nothing hovers.
 */

const fluid = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const settle = "elastic.out(1, 0.45)";

/** The filters, rendered once per page; elements point at them with `filter: url(#…)`. */
export function FluidDefs() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        <filter id="d-goo" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" />
        </filter>
        {/* Duotone that recolours the provisional pictures into the palette (see theme.css). */}
        <filter id="d-duo" colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer><feFuncR type="table" tableValues="0.071 0.424 0.945" /><feFuncG type="table" tableValues="0.051 0.361 0.933" /><feFuncB type="table" tableValues="0.220 0.941 0.984" /></feComponentTransfer>
        </filter>
        <filter id="d-ripple" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence data-slot="ripple-noise" type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="4" result="noise" />
          <feDisplacementMap data-slot="ripple-map" in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * Pulls the element toward the pointer while it is over it, its content a little further so it
 * lags like a drop, and lets both spring back on leave.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.3) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !fluid()) return;
    const inner = el.querySelector<HTMLElement>("[data-magnetic-inner]");
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
      gsap.to(inner ? [el, inner] : el, { x: 0, y: 0, duration: 1, ease: settle, overwrite: true });
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);
  return ref;
}

/**
 * A pill that flows to the hovered item of a list and back to the current one. Two shapes travel
 * at different speeds under the goo filter, so the pill stretches into a drop on the way and
 * snaps back into one shape when it lands.
 */
export function useLiquidPill(list: RefObject<HTMLElement | null>, items: string, current: number) {
  const layer = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = list.current;
    const host = layer.current;
    if (!root || !host) return;
    const [lead, trail] = Array.from(host.children) as HTMLElement[];
    const targets = () => Array.from(root.querySelectorAll<HTMLElement>(items));
    const place = (index: number, animate: boolean) => {
      const target = targets()[index];
      if (!target) {
        gsap.to([lead, trail], { opacity: 0, duration: 0.2 });
        return;
      }
      const base = root.getBoundingClientRect();
      const r = target.getBoundingClientRect();
      const to = { x: r.left - base.left, y: r.top - base.top, width: r.width, height: r.height, opacity: 1 };
      if (!animate || !fluid()) {
        gsap.set([lead, trail], to);
        return;
      }
      gsap.to(lead, { ...to, duration: 0.45, ease: "power3.out", overwrite: true });
      gsap.to(trail, { ...to, duration: 0.75, ease: "elastic.out(1, 0.7)", overwrite: true });
    };
    place(current, false);
    const over = (e: Event) => {
      const index = targets().indexOf((e.target as HTMLElement).closest(items) as HTMLElement);
      if (index >= 0) place(index, true);
    };
    const out = () => place(current, true);
    const resize = () => place(current, false);
    root.addEventListener("pointerover", over);
    root.addEventListener("focusin", over);
    root.addEventListener("pointerleave", out);
    root.addEventListener("focusout", out);
    window.addEventListener("resize", resize);
    return () => {
      root.removeEventListener("pointerover", over);
      root.removeEventListener("focusin", over);
      root.removeEventListener("pointerleave", out);
      root.removeEventListener("focusout", out);
      window.removeEventListener("resize", resize);
    };
  }, [list, items, current]);
  return layer;
}

/**
 * A fill that pours into a row from where the pointer enters and drains toward where it leaves,
 * as a circle growing from that point. Spread the returned handlers on the row and put
 * `data-pour` on an absolutely positioned child.
 */
export function usePour() {
  const at = (e: ReactPointerEvent<HTMLElement>) => {
    const row = e.currentTarget;
    const r = row.getBoundingClientRect();
    return { row, fill: row.querySelector<HTMLElement>("[data-pour]"), pos: `${e.clientX - r.left}px ${e.clientY - r.top}px` };
  };
  return {
    onPointerEnter: (e: ReactPointerEvent<HTMLElement>) => {
      const { fill, pos } = at(e);
      if (!fill || !fluid()) return;
      gsap.fromTo(fill, { clipPath: `circle(0% at ${pos})` }, { clipPath: `circle(150% at ${pos})`, duration: 0.9, ease: "power3.out", overwrite: true });
    },
    onPointerLeave: (e: ReactPointerEvent<HTMLElement>) => {
      const { fill, pos } = at(e);
      if (!fill || !fluid()) return;
      gsap.to(fill, { clipPath: `circle(0% at ${pos})`, duration: 0.6, ease: "power2.inOut", overwrite: true });
    },
  };
}

/**
 * Ripples a picture while it is hovered: the shared displacement filter is attached to the
 * hovered picture only, swells, drifts, then flattens out and is detached on leave. Touch screens
 * cannot hover, so there each picture ripples once as it comes into view instead.
 */
export function useRipple<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    const touch =
      !fluid() && window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || (!fluid() && !touch)) return;
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
      // Keep the picture's duotone, if any, under the ripple.
      el.style.filter = "";
      const base = getComputedStyle(el).filter;
      el.style.filter = base === "none" ? "url(#d-ripple)" : `${base} url(#d-ripple)`;
      gsap.to(state, { scale: 22, duration: 0.5, ease: "power2.out", onUpdate: apply, overwrite: "auto" });
      drift = gsap.to(state, { fx: 0.02, fy: 0.012, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1, onUpdate: apply });
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
    if (touch) {
      let timer = 0;
      const seen = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
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
        drift?.kill();
      };
    }
    const host = el.closest("a") ?? el;
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
      drift?.kill();
    };
  }, []);
  return ref;
}
