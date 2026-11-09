import Lenis from "lenis";
import { useEffect } from "react";
import { prefersReducedMotion, transitionOriginKey } from "../../lib/motion";

/** The page's smooth scroller, for controls that move the page (the scrollbar drop). */
export const pageScroll: { lenis?: Lenis } = {};

/** Moves the page, through the smooth scroller when there is one so both stay in step. */
export function scrollPageTo(y: number, immediate: boolean) {
  if (pageScroll.lenis) pageScroll.lenis.scrollTo(y, { immediate });
  else window.scrollTo({ top: y, behavior: immediate ? "instant" : "smooth" });
}

/**
 * Page-level motion:
 * - smooth scrolling with inertia (Lenis), skipped under reduced motion;
 * - preparation of the page transition styled in global.css: the click point is kept, for this
 *   document and for the next one, so the new page spreads from there, and a clicked project
 *   picture is named so the browser morphs it into the project page's hero picture.
 */
export function usePageMotion() {
  useEffect(() => {
    const lenis = prefersReducedMotion()
      ? undefined
      : new Lenis({ autoRaf: true, anchors: true, lerp: 0.09 });
    pageScroll.lenis = lenis;

    const root = document.documentElement;
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
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const link = (e.target as Element).closest("a");
      if (!link || link.target) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;

      // A router navigation stays in this document; a plain link loads the next one, whose head
      // script reads the point back.
      const origin = { x: Math.round(e.clientX), y: Math.round(e.clientY) };
      root.style.setProperty("--vt-x", `${origin.x}px`);
      root.style.setProperty("--vt-y", `${origin.y}px`);
      try {
        sessionStorage.setItem(transitionOriginKey, JSON.stringify(origin));
      } catch {
        // Without storage the next page spreads from its default point.
      }

      clearNames();
      const picture =
        link.querySelector<HTMLElement>("[data-transition-picture]") ??
        link
          .closest("[data-project-card]")
          ?.querySelector<HTMLElement>("[data-transition-picture]");
      if (!picture) return;
      // A transition with two elements of the same name is skipped, so the page's own hero
      // picture gives up the name to the clicked one.
      document
        .querySelectorAll<HTMLElement>("[data-transition-hero]")
        .forEach((el) => name(el, "none"));
      name(picture, "project-hero");
    };

    // A page restored from the back-forward cache still carries the names of the last click.
    const onShow = (e: PageTransitionEvent) => e.persisted && clearNames();

    document.addEventListener("click", onClick);
    window.addEventListener("pageshow", onShow);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("pageshow", onShow);
      clearNames();
      lenis?.destroy();
      pageScroll.lenis = undefined;
    };
  }, []);
}
