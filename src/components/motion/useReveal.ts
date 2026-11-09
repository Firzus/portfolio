import gsap from "gsap";
import { useEffect } from "react";
import { prefersReducedMotion } from "../../lib/motion";

/**
 * Staggered entrance for every `[data-reveal]` element of the page, once per element as it enters
 * the window. Pass a value that changes with the page (its path) so a router navigation scans the
 * new content. The elements are never hidden by the stylesheet, so they stay readable without
 * scripts; under reduced motion they do not move at all.
 */
export function useReveal(page: string) {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target);
        if (!entering.length) return;
        entering.forEach((el) => observer.unobserve(el));
        gsap.fromTo(
          entering,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.075,
            clearProps: "opacity,transform",
          },
        );
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [page]);
}
