import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

/** The page's smooth scroller, for controls that move the page (the custom scrollbar). */
export const pageScroll: { lenis?: Lenis } = {};

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Page-level motion of piste D:
 * - smooth scrolling with inertia (Lenis), skipped under reduced motion;
 * - preparation of the cross-document view transition defined in theme.css: the click point is
 *   kept for the next page, so its reveal spreads from there, and the clicked project picture is
 *   named so the browser morphs it into the project page's hero picture.
 */
export function useFluidPage() {
  useEffect(() => {
    const lenis = reduced() ? undefined : new Lenis({ autoRaf: true, anchors: true, lerp: 0.09 });
    pageScroll.lenis = lenis;

    const named = new Set<HTMLElement>();
    const clearNames = () => {
      named.forEach((el) => (el.style.viewTransitionName = ""));
      named.clear();
    };
    const name = (el: HTMLElement, value: string) => {
      el.style.viewTransitionName = value;
      named.add(el);
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element).closest("a");
      if (!link || link.target) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;

      sessionStorage.setItem("vt-origin", JSON.stringify({ x: Math.round(e.clientX), y: Math.round(e.clientY) }));

      clearNames();
      if (!url.pathname.includes("/projets/")) return;
      const picture = link.querySelector("img") ?? link.closest("[data-card]")?.querySelector("img");
      if (!picture) return;
      // A transition with two elements of the same name is skipped, so the page's own hero
      // picture gives up the name to the clicked one.
      document.querySelectorAll<HTMLElement>("[data-vt-hero]").forEach((el) => name(el, "none"));
      name(picture, "project-hero");
    };

    // A page restored from the back-forward cache still carries the names of the last click.
    const onShow = (e: PageTransitionEvent) => e.persisted && clearNames();

    document.addEventListener("click", onClick);
    window.addEventListener("pageshow", onShow);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("pageshow", onShow);
      lenis?.destroy();
      pageScroll.lenis = undefined;
    };
  }, []);
}
