import gsap from "gsap";
import { useEffect, type RefObject } from "react";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Staggered entrance for every `[data-reveal]` element inside `scope`, once per element as it
 * enters the viewport. Elements are shown at once under reduced motion.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (reduced()) {
      items.forEach((el) => el.setAttribute("data-revealed", ""));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
        if (!entering.length) return;
        entering.forEach((el) => {
          observer.unobserve(el);
          el.setAttribute("data-revealed", "");
        });
        gsap.fromTo(
          entering,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.075, clearProps: "transform" },
        );
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [scope]);
}

export { reduced as prefersReducedMotion };
