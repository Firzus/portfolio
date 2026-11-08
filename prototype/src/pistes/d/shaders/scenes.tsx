import { useState } from "react";
import { FilmGrain, FlowingGradient, Liquify, Shader } from "shaders/react";

/*
 * GPU scenes of piste D. Their colours come from the --sh-* variables in theme.css, so
 * the palette is set in one place with the rest of the site. This module touches the GPU, so it is
 * only ever loaded in the browser, through ShaderLayer.
 */

export type Scene = "hero" | "button" | "icon-play" | "icon-tools" | "icon-unity" | "icon-contact";

type SceneProps = { scene: Scene; hover: boolean; className?: string; onReady: () => void };

const names = ["ground", "deep", "mid", "bright", "button-dark", "button", "button-light", "button-fold"] as const;
type Inks = Record<(typeof names)[number], string>;

/** Reads the palette once per scene; it never changes while a page is open. */
function readInks(): Inks {
  const style = getComputedStyle(document.querySelector("[data-piste]") ?? document.documentElement);
  return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(`--sh-${name}`).trim()])) as Inks;
}

export default function ShaderScene({ scene, hover, className, onReady }: SceneProps) {
  const [ink] = useState(readInks);
  return (
    <Shader className={className} colorSpace="srgb" disableTelemetry onReady={onReady}>
      {layers(scene, hover, ink)}
    </Shader>
  );
}

function layers(scene: Scene, hover: boolean, ink: Inks) {
  switch (scene) {
    case "hero":
      // Slow flow of the palette's hues that the cursor drags like a liquid: soft and slow to
      // settle, so the mass follows the pointer and keeps moving after it.
      return (
        <>
          <FlowingGradient colorA={ink.ground} colorB={ink.deep} colorC={ink.bright} colorD={ink.mid} speed={hover ? 0.6 : 0.3} distortion={0.8} seed={7} />
          <Liquify intensity={30} stiffness={2} damping={1.5} radius={1.2} edges="mirror" />
          <FilmGrain strength={0.12} animated />
        </>
      );
    case "button":
      // The accent with light and dark folds that the pointer pushes around like a liquid. The
      // darkest fold keeps 6:1 or more against the button text.
      return (
        <>
          <FlowingGradient colorA={ink["button-dark"]} colorB={ink.button} colorC={ink["button-light"]} colorD={ink["button-fold"]} speed={hover ? 0.9 : 0.35} distortion={0.9} seed={3} />
          <Liquify intensity={14} stiffness={2} damping={1.5} radius={1.4} edges="mirror" />
        </>
      );
    default:
      return <Icon scene={scene} hover={hover} ink={ink} />;
  }
}

/**
 * The liquid inside an icon drop: a slow flow of the palette's hues, each icon with its own mix
 * and seed, which the pointer pushes around like the hero. The pictogram is drawn over it in SVG.
 */
const iconMix: Record<string, [keyof Inks, keyof Inks, keyof Inks, keyof Inks, number]> = {
  "icon-play": ["bright", "mid", "deep", "button-light", 11],
  "icon-tools": ["deep", "mid", "bright", "ground", 23],
  "icon-unity": ["mid", "bright", "deep", "button-light", 37],
  "icon-contact": ["mid", "deep", "bright", "mid", 51],
};

function Icon({ scene, hover, ink }: { scene: Scene; hover: boolean; ink: Inks }) {
  const [a, b, c, d, seed] = iconMix[scene];
  return (
    <>
      <FlowingGradient colorA={ink[a]} colorB={ink[b]} colorC={ink[c]} colorD={ink[d]} speed={hover ? 1.1 : 0.3} distortion={1} seed={seed} />
      <Liquify intensity={10} stiffness={2} damping={1.5} radius={1.5} edges="mirror" />
    </>
  );
}
