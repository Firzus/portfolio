import gsap from "gsap";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { pageScroll } from "./page";

const MIN_THUMB = 48;

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Moves the page, through the smooth scroller when there is one so both stay in step. */
function scrollPageTo(y: number, immediate: boolean) {
  if (pageScroll.lenis) pageScroll.lenis.scrollTo(y, { immediate });
  else window.scrollTo({ top: y, behavior: immediate ? "instant" : "smooth" });
}

/**
 * The page's scrollbar, drawn as a drop of ink in the right margin: it stretches along the
 * scroll's direction with its speed and settles back with a slight overshoot, brightens to the
 * accent while held, and fades when the page is still. It can be dragged, and a click on the
 * track scrolls there.
 *
 * It replaces the native bar only on screens with a fine pointer (the head class
 * d-custom-scroll, set here); touch screens keep their own overlay bar. Keyboard and wheel
 * scrolling are untouched, and it is hidden from assistive technology, which scrolls the page
 * by other means.
 */
export function ScrollBar() {
  const track = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const root = document.documentElement;
    root.classList.add("d-custom-scroll");
    setActive(true);
    return () => root.classList.remove("d-custom-scroll");
  }, []);

  useEffect(() => {
    const bar = track.current;
    const drop = thumb.current;
    if (!active || !bar || !drop) return;
    const still = reduced();
    const settle = gsap.delayedCall(0.12, () => {
      gsap.to(drop, { scaleY: 1, scaleX: 1, duration: 0.5, ease: "back.out(1.6)", overwrite: true });
    }).pause();
    let lastY = window.scrollY;
    let lastT = performance.now();
    let idle = 0;
    let frame = 0;

    const layout = () => {
      const view = window.innerHeight;
      const page = document.documentElement.scrollHeight;
      const room = bar.clientHeight;
      const size = Math.max(MIN_THUMB, (view / page) * room);
      const progress = page > view ? window.scrollY / (page - view) : 0;
      drop.style.height = `${size}px`;
      gsap.set(drop, { y: progress * (room - size) });
      bar.dataset.state = page > view + 1 ? bar.dataset.state || "idle" : "hidden";
    };

    const wake = () => {
      if (bar.dataset.state !== "hidden") bar.dataset.state = "active";
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        if (bar.dataset.state === "active" && !bar.matches(":hover") && !("dragging" in bar.dataset)) bar.dataset.state = "idle";
      }, 1200);
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        layout();
        wake();
        if (still) return;
        const now = performance.now();
        const speed = (window.scrollY - lastY) / Math.max(1, now - lastT);
        lastY = window.scrollY;
        lastT = now;
        // A fast scroll pulls the drop long and thin, toward where the page is heading.
        const amount = Math.min(Math.abs(speed) * 0.12, 0.25);
        drop.style.transformOrigin = speed > 0 ? "50% 0%" : "50% 100%";
        gsap.to(drop, { scaleY: 1 + amount, scaleX: 1 - amount * 0.2, duration: 0.25, ease: "power3.out", overwrite: true });
        // Once the scroll stops feeding it, the drop springs back to its round shape.
        settle.restart(true);
      });
    };

    layout();
    const resize = new ResizeObserver(layout);
    resize.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", layout);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(idle);
      settle.kill();
      resize.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", layout);
    };
  }, [active]);

  const drag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const bar = track.current;
    const drop = thumb.current;
    if (!bar || !drop || e.button !== 0) return;
    e.preventDefault();
    const room = bar.clientHeight - drop.offsetHeight;
    const span = document.documentElement.scrollHeight - window.innerHeight;
    const startY = e.clientY;
    const startScroll = window.scrollY;
    drop.setPointerCapture(e.pointerId);
    bar.dataset.dragging = "";
    const move = (ev: PointerEvent) => scrollPageTo(startScroll + ((ev.clientY - startY) / room) * span, true);
    const up = () => {
      delete bar.dataset.dragging;
      drop.removeEventListener("pointermove", move);
      drop.removeEventListener("pointerup", up);
      drop.removeEventListener("pointercancel", up);
    };
    drop.addEventListener("pointermove", move);
    drop.addEventListener("pointerup", up);
    drop.addEventListener("pointercancel", up);
  };

  const jump = (e: ReactPointerEvent<HTMLDivElement>) => {
    const bar = track.current;
    const drop = thumb.current;
    if (!bar || !drop || e.target === drop) return;
    const r = bar.getBoundingClientRect();
    const span = document.documentElement.scrollHeight - window.innerHeight;
    const at = (e.clientY - r.top - drop.offsetHeight / 2) / (r.height - drop.offsetHeight);
    scrollPageTo(Math.max(0, Math.min(1, at)) * span, false);
  };

  if (!active) return null;
  return (
    <div
      ref={track}
      aria-hidden
      data-slot="scrollbar"
      data-state="idle"
      onPointerDown={jump}
      className="group fixed top-2 right-0 bottom-2 z-[90] w-4 data-[state=hidden]:hidden"
    >
      <div
        ref={thumb}
        data-slot="scrollbar-thumb"
        onPointerDown={drag}
        className="absolute top-0 right-1 w-1.5 cursor-grab rounded-full bg-ink/30 opacity-40 transition-[opacity,background-color,width] duration-300 will-change-transform group-hover:w-2 group-hover:bg-ink/50 group-hover:opacity-100 group-data-[dragging]:w-2 group-data-[dragging]:cursor-grabbing group-data-[dragging]:bg-accent group-data-[dragging]:opacity-100 group-data-[state=active]:opacity-100"
      />
    </div>
  );
}
