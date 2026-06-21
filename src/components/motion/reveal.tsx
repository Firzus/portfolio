import * as React from "react";

import { useIsomorphicLayoutEffect } from "#/hooks/use-isomorphic-layout-effect";
import { cn } from "#/lib/utils";

type RevealProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Stagger applied to direct children instead of animating the node as one block. */
  stagger?: boolean;
  /** Delay before the reveal starts, in seconds. */
  delay?: number;
  as?: "div" | "section";
};

/**
 * Sober scroll-reveal: a short fade + upward translate as the element enters the
 * viewport. SSR-safe (content is always in the DOM) and progressive — GSAP and
 * ScrollTrigger are imported only on the client, and reduced-motion skips all
 * animation, leaving content fully visible.
 */
export function Reveal({
  children,
  className,
  stagger = false,
  delay = 0,
  as = "div",
  ...rest
}: RevealProps) {
  const ref = React.useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled || !ref.current) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const targets = stagger ? (gsap.utils.toArray(node.children) as HTMLElement[]) : [node];
        gsap.from(targets, {
          opacity: 0,
          y: 16,
          duration: 0.6,
          ease: "power2.out",
          delay,
          stagger: stagger ? 0.08 : 0,
          scrollTrigger: {
            trigger: node,
            start: "top 85%",
            once: true,
          },
        });
      }, node);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [stagger, delay]);

  const Tag = as;
  return (
    <Tag ref={ref as React.Ref<HTMLDivElement>} className={cn(className)} {...rest}>
      {children}
    </Tag>
  );
}
