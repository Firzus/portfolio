import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { prefersReducedMotion } from "../../../lib/motion";
import { cn } from "../../../lib/utils";
import { useMagnetic } from "../motion/fluid";
import { loaderDone } from "../motion/loaderSignal";
import type { Scene } from "./scenes";

const ShaderScene = lazy(() => import("./scenes"));

/**
 * A decorative shader filling its positioned parent. Prerendered, without JavaScript, under
 * reduced motion or without a usable GPU, it stays the static fill set for its scene in
 * theme.css; the canvas fades in over that fill once its first frame is ready.
 */
export function ShaderLayer({ scene, hover = false, className }: { scene: Scene; hover?: boolean; className?: string }) {
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let active = true;
    loaderDone.then(() => active && setLive(true));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div aria-hidden data-scene={scene} className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {live && (
        <Suspense fallback={null}>
          <ShaderScene
            scene={scene}
            hover={hover}
            onReady={() => setReady(true)}
            className={cn("size-full transition-opacity duration-700 ease-out", ready ? "opacity-100" : "opacity-0")}
          />
        </Suspense>
      )}
    </div>
  );
}

/** Tracks pointer hover and keyboard focus on an element, for the shader it holds. */
export function useHover() {
  const [hover, setHover] = useState(false);
  const on = () => setHover(true);
  const off = () => setHover(false);
  return { hover, bind: { onPointerEnter: on, onPointerLeave: off, onFocus: on, onBlur: off } };
}

/** A primary action drawn on a live accent shader, pulled toward the pointer like a drop. */
export function ShaderButton({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const { hover, bind } = useHover();
  const magnet = useMagnetic<HTMLAnchorElement>(0.28);
  return (
    <a
      ref={magnet}
      href={href}
      {...bind}
      className={cn(
        "relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-control bg-accent px-5 font-bold text-accent-ink transition-[scale] duration-150 select-none active:scale-[0.97] motion-reduce:transition-none",
        className,
      )}
    >
      <ShaderLayer scene="button" hover={hover} className="-z-10" />
      <span data-magnetic-inner className="inline-flex items-center gap-2">
        {children}
      </span>
    </a>
  );
}
