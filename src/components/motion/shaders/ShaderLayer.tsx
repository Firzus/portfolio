import { lazy, Suspense, useEffect, useState } from "react";
import { loaderDone, prefersReducedMotion } from "../../../lib/motion";
import { cn } from "../../../lib/utils";
import type { Scene } from "./scenes";

const ShaderScene = lazy(() => import("./scenes"));

interface ShaderLayerProps {
  scene: Scene;
  /** Whether the area holding the shader is hovered or focused; the liquid then flows faster. */
  hover?: boolean;
  className?: string;
}

/**
 * A decorative shader filling its positioned parent. Rendered by the server, without scripts,
 * under reduced motion or without a usable GPU, it stays the static fill the stylesheet gives its
 * scene; the canvas fades in over that fill once its first frame is ready. It starts only after
 * the loading screen, whose animation the shader compilation would make stutter.
 */
export function ShaderLayer({ scene, hover = false, className }: ShaderLayerProps) {
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let active = true;
    void loaderDone.then(() => active && setLive(true));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      data-scene={scene}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {live && (
        <Suspense fallback={null}>
          <ShaderScene
            scene={scene}
            hover={hover}
            onReady={() => setReady(true)}
            className={cn(
              "size-full transition-opacity duration-700 ease-out",
              ready ? "opacity-100" : "opacity-0",
            )}
          />
        </Suspense>
      )}
    </div>
  );
}

/** Tracks pointer hover and keyboard focus within an element, for the shader it holds. */
export function useHover() {
  const [hover, setHover] = useState(false);
  const on = () => setHover(true);
  const off = () => setHover(false);
  return {
    hover,
    bind: { onPointerEnter: on, onPointerLeave: off, onFocus: on, onBlur: off },
  };
}
