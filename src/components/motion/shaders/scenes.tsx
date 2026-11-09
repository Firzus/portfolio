import { useState } from "react";
import { FilmGrain, FlowingGradient, Liquify, Shader } from "shaders/react";

/*
 * The GPU scenes. This module touches the GPU, so it is only ever loaded in the browser, through
 * ShaderLayer. Its colours are the theme tokens of global.css, read once per scene since they
 * never change while a page is open.
 */

export type Scene =
  | "hero"
  | "button"
  | "icon-play"
  | "icon-tools"
  | "icon-unity"
  | "icon-agents"
  | "icon-contact";

const tokens = {
  ground: "--color-ground",
  deep: "--color-deep",
  mid: "--color-shader-mid",
  bright: "--color-shader-bright",
  buttonDark: "--color-shader-button-dark",
  button: "--color-accent",
  buttonLight: "--color-shader-button-light",
  buttonFold: "--color-shader-button-fold",
};
type Inks = Record<keyof typeof tokens, string>;

function readInks(): Inks {
  const style = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    Object.entries(tokens).map(([name, token]) => [name, style.getPropertyValue(token).trim()]),
  ) as Inks;
}

interface SceneProps {
  scene: Scene;
  hover: boolean;
  className?: string;
  onReady: () => void;
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
      // A slow flow of the palette that the pointer drags like a liquid: soft and slow to settle,
      // so the mass follows the pointer and keeps moving after it.
      return (
        <>
          <FlowingGradient
            colorA={ink.ground}
            colorB={ink.deep}
            colorC={ink.bright}
            colorD={ink.mid}
            speed={hover ? 0.6 : 0.3}
            distortion={0.8}
            seed={7}
          />
          <Liquify intensity={30} stiffness={2} damping={1.5} radius={1.2} edges="mirror" />
          <FilmGrain strength={0.12} animated />
        </>
      );
    case "button":
      return (
        <>
          <FlowingGradient
            colorA={ink.buttonDark}
            colorB={ink.button}
            colorC={ink.buttonLight}
            colorD={ink.buttonFold}
            speed={hover ? 0.9 : 0.35}
            distortion={0.9}
            seed={3}
          />
          <Liquify intensity={14} stiffness={2} damping={1.5} radius={1.4} edges="mirror" />
        </>
      );
    default:
      return <Icon scene={scene} hover={hover} ink={ink} />;
  }
}

type IconScene = Exclude<Scene, "hero" | "button">;
type Mix = [keyof Inks, keyof Inks, keyof Inks, keyof Inks, number];

/** Each icon drop mixes the palette in its own order, with its own seed. */
const iconMix: Record<IconScene, Mix> = {
  "icon-play": ["bright", "mid", "deep", "buttonLight", 11],
  "icon-tools": ["deep", "mid", "bright", "ground", 23],
  "icon-unity": ["mid", "bright", "deep", "buttonLight", 37],
  "icon-agents": ["bright", "deep", "mid", "ground", 44],
  "icon-contact": ["mid", "deep", "bright", "mid", 51],
};

function Icon({ scene, hover, ink }: { scene: IconScene; hover: boolean; ink: Inks }) {
  const [a, b, c, d, seed] = iconMix[scene];
  return (
    <>
      <FlowingGradient
        colorA={ink[a]}
        colorB={ink[b]}
        colorC={ink[c]}
        colorD={ink[d]}
        speed={hover ? 1.1 : 0.3}
        distortion={1}
        seed={seed}
      />
      <Liquify intensity={10} stiffness={2} damping={1.5} radius={1.5} edges="mirror" />
    </>
  );
}
