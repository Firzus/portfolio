import * as React from "react";

import { useHasMounted } from "#/hooks/use-has-mounted";
import { useReducedMotion } from "#/hooks/use-reduced-motion";
import { prefersLightweightVisual, supportsGpuRendering } from "#/lib/gpu";
import { cn } from "#/lib/utils";

// Lazy so neither `shaders` nor `three` is loaded on the server or for users who
// never reach the shader path (reduced-motion, no GPU).
const HeroShaderCanvas = React.lazy(() => import("#/components/hero-shader-canvas"));

/**
 * Static, dependency-free fallback shown during SSR, on reduced-motion, or when
 * the GPU can't render. Mirrors the shader's gold-on-ink direction so the layout
 * never shifts and there is no hydration mismatch.
 */
function ShaderFallback({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,oklch(84.7%_0.149_80.3/0.30),transparent_55%),radial-gradient(circle_at_75%_80%,oklch(84.7%_0.149_80.3/0.12),transparent_50%),linear-gradient(160deg,oklch(20%_0_90),oklch(13%_0_90))]",
        className,
      )}
    />
  );
}

/**
 * Signature hero visual. SSR-safe by construction: the static fallback renders
 * on the server and the first client paint; the GPU canvas only mounts after we
 * confirm the browser, GPU support, and a non-reduced motion preference.
 */
export function HeroShader({ className }: { className?: string }) {
  const mounted = useHasMounted();
  const reducedMotion = useReducedMotion();
  const [shaderAllowed, setShaderAllowed] = React.useState(false);

  React.useEffect(() => {
    // Run the shader only with real GPU support AND on a device that isn't
    // low-power/data-saving/phone-sized (where it drains battery for little gain).
    setShaderAllowed(supportsGpuRendering() && !prefersLightweightVisual());
  }, []);

  const fallback = <ShaderFallback className={className} />;

  if (!mounted || reducedMotion || !shaderAllowed) {
    return fallback;
  }

  return (
    <React.Suspense fallback={fallback}>
      <HeroShaderCanvas className={className} fallback={fallback} />
    </React.Suspense>
  );
}

export default HeroShader;
