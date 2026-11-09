import gsap from "gsap";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { hasFinePointer, prefersReducedMotion } from "../../lib/motion";
import { scrollPageTo } from "./pageScroll";
import { thumbLayout } from "./scrollbarLayout";

/**
 * The page's scrollbar, drawn as a drop of ink in the right margin: it stretches along the
 * scroll's direction with its speed and settles back with a slight overshoot, brightens to the
 * accent while held, and fades when the page is still. It can be dragged, and a click on the
 * track scrolls there.
 *
 * It replaces the native bar only on screens with a fine pointer, where the head script sets the
 * root class custom-scroll that hides the native one; touch screens keep their own overlay bar.
 * Keyboard and wheel scrolling are untouched, and it is hidden from assistive technology, which
 * scrolls the page by other means.
 */
export function ScrollBar() {
  const track = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!hasFinePointer()) return;
    const root = document.documentElement;
    root.classList.add("custom-scroll");
    setActive(true);
    return () => root.classList.remove("custom-scroll");
  }, []);

  useEffect(() => {
    const bar = track.current;
    const drop = thumb.current;
    if (!active || !bar || !drop) return;
    const still = prefersReducedMotion();
    const settle = gsap
      .delayedCall(0.12, () => {
        gsap.to(drop, {
          scaleY: 1,
          scaleX: 1,
          duration: 0.5,
          ease: "back.out(1.6)",
          overwrite: true,
        });
      })
      .pause();
    let lastY = window.scrollY;
    let lastT = performance.now();
    let idle = 0;
    let frame = 0;

    const layout = () => {
      const { size, offset, scrollable } = thumbLayout({
        view: window.innerHeight,
        page: document.documentElement.scrollHeight,
        room: bar.clientHeight,
        scroll: window.scrollY,
      });
      drop.style.height = `${size}px`;
      gsap.set(drop, { y: offset });
      const state = bar.dataset.state;
      if (!scrollable) bar.dataset.state = "hidden";
      else if (!state || state === "hidden") bar.dataset.state = "idle";
    };

    const wake = () => {
      if (bar.dataset.state !== "hidden") bar.dataset.state = "active";
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        if (
          bar.dataset.state === "active" &&
          !bar.matches(":hover") &&
          !("dragging" in bar.dataset)
        )
          bar.dataset.state = "idle";
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
        gsap.to(drop, {
          scaleY: 1 + amount,
          scaleX: 1 - amount * 0.2,
          duration: 0.25,
          ease: "power3.out",
          overwrite: true,
        });
        // Once the scroll stops feeding it, the drop springs back to its round shape.
        settle.restart(true);
      });
    };

    layout();
    const resize = new ResizeObserver(layout);
    resize.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", layout);
    // The idle timer leaves the drop lit while it is held or hovered, so it restarts on release.
    bar.addEventListener("pointerup", wake);
    bar.addEventListener("pointerleave", wake);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(idle);
      settle.kill();
      resize.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", layout);
      bar.removeEventListener("pointerup", wake);
      bar.removeEventListener("pointerleave", wake);
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
    const move = (ev: PointerEvent) =>
      scrollPageTo(startScroll + ((ev.clientY - startY) / room) * span, true);
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
      aria-hidden="true"
      data-slot="scrollbar"
      data-state="idle"
      onPointerDown={jump}
      className="group fixed top-2 right-0 bottom-2 z-90 w-4 data-[state=hidden]:hidden"
    >
      <div
        ref={thumb}
        data-slot="scrollbar-thumb"
        onPointerDown={drag}
        className="absolute top-0 right-1 w-1.5 cursor-grab rounded-full bg-ink/30 opacity-40 will-change-transform group-hover:w-2 group-hover:bg-ink/50 group-hover:opacity-100 group-data-[dragging]:w-2 group-data-[dragging]:cursor-grabbing group-data-[dragging]:bg-accent group-data-[dragging]:opacity-100 group-data-[state=active]:opacity-100"
      />
    </div>
  );
}
