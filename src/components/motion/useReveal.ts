import { useRouter } from "@tanstack/react-router";
import gsap from "gsap";
import { useEffect } from "react";
import { prefersReducedMotion } from "../../lib/motion";

/**
 * Staggered entrance for the `[data-reveal]` elements of the page, once per element as it enters
 * the window. The stylesheet never hides them, so they stay readable without scripts. Elements
 * already on screen when the page appears are left alone, since fading them out would make them
 * blink; only those below the window are hidden, out of sight, until they enter. Under reduced
 * motion nothing moves.
 */
export function useReveal() {
  const router = useRouter();
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let observer: IntersectionObserver | undefined;

    const scan = () => {
      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries, self) => {
          const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target);
          if (!entering.length) return;
          entering.forEach((el) => self.unobserve(el));
          gsap.to(entering, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.075,
            clearProps: "opacity,transform",
          });
        },
        { rootMargin: "0px 0px -8% 0px" },
      );
      const below = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
        (el) => el.getBoundingClientRect().top > window.innerHeight,
      );
      gsap.set(below, { opacity: 0, y: 24 });
      below.forEach((el) => observer?.observe(el));
    };

    scan();
    // The new page's elements exist only once the router has rendered it.
    const unsubscribe = router.subscribe("onRendered", (event) => {
      if (event.pathChanged) scan();
    });
    return () => {
      unsubscribe();
      observer?.disconnect();
    };
  }, [router]);
}
