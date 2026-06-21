import * as React from "react";
import { Shader, Swirl, RadialGradient, FilmGrain } from "shaders/react";

import { cn } from "#/lib/utils";

// Brand palette (gold accent on near-black), sRGB hex matching the OKLCH tokens
// in styles.css so the shader reads as part of the design system.
const GOLD = "#ffc14a";
const GOLD_DEEP = "#8d6b2d";
const INK = "#0b0b0b";

type HeroShaderCanvasProps = {
  className?: string;
  fallback: React.ReactNode;
};

/**
 * GPU canvas for the signature hero shader. Imported lazily so neither `shaders`
 * nor `three` is ever pulled into the server bundle. A single slow gold swirl
 * over ink, soft-masked at the edges with a faint static grain — restraint over
 * spectacle, one motion only.
 */
export default function HeroShaderCanvas({ className, fallback }: HeroShaderCanvasProps) {
  const [shaderVisible, setShaderVisible] = React.useState(false);

  return (
    <div className={cn("absolute inset-0", className)}>
      {/* Fallback stays painted underneath until the first shader frame is ready,
          then we cross-fade to avoid any flash of an empty canvas. */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          shaderVisible && "opacity-0",
        )}
      >
        {fallback}
      </div>
      <Shader
        colorSpace="srgb"
        onReady={() => setShaderVisible(true)}
        className={cn(
          "size-full transition-opacity duration-700",
          shaderVisible ? "opacity-100" : "opacity-0",
        )}
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Base: slow gold marbling — the single signature motion. */}
        <Swirl colorA={INK} colorB={GOLD} speed={0.35} detail={1.1} blend={62} />
        {/* Deepen the lower-right so the swirl reads as light from top-left. */}
        <RadialGradient
          colorA="rgba(0,0,0,0)"
          colorB={GOLD_DEEP}
          center={{ x: 0.78, y: 0.82 }}
          radius={0.95}
          opacity={0.35}
          blendMode="multiply"
        />
        {/* Soft vignette mask: fade the canvas edges into the card. */}
        <RadialGradient
          colorA="rgba(0,0,0,0)"
          colorB={INK}
          center={{ x: 0.4, y: 0.3 }}
          radius={0.85}
          opacity={0.85}
        />
        {/* Faint static grain for a premium, non-digital finish. */}
        <FilmGrain
          strength={0.16}
          bias={2.4}
          animated={false}
          opacity={0.5}
          blendMode="softLight"
        />
      </Shader>
    </div>
  );
}
