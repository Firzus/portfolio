import { nameMark } from "./lettering";

/** Peak displacement of the wave, in lettering units (the name is about 1900 × 400). */
const LIFT = 14;
const SWAY = 5;
/** Width of the swell, in lettering units. */
const SPREAD = 360;
/** Wavelength of the ripple running through the swell, in lettering units. */
const WAVE = 260;

export type Swell = {
  /** 0 at rest, 1 at full swell. */
  amount: number;
  /** Centre of the swell along the name, in lettering units. */
  x: number;
  /** Phase of the ripple, in radians; advance it over time to make the ripple travel. */
  phase: number;
};

// The traced path holds absolute commands only, so it splits into commands and x/y pairs: each
// point keeps the text that follows it (a command letter, a comma, a space).
const number = String.raw`-?\d+(?:\.\d+)?`;
const parts = nameMark.d.split(new RegExp(`(${number}) (${number})`));
const head = parts[0] ?? "";
const points: { x: number; y: number; after: string }[] = [];
for (let i = 1; i < parts.length; i += 3) {
  points.push({ x: Number(parts[i]), y: Number(parts[i + 1]), after: parts[i + 2] ?? "" });
}

/**
 * The name's path with a swell running through it. It moves the path's own points rather than
 * pixels (an SVG displacement filter pixelates the edges), so the letters stay crisp.
 */
export function swollenName({ amount, x: centre, phase }: Swell) {
  if (amount < 0.002) return nameMark.d;
  let out = head;
  for (const { x, y, after } of points) {
    const near = Math.exp(-(((x - centre) / SPREAD) ** 2)) * amount;
    const lift = LIFT * near * Math.sin((x / WAVE) * Math.PI * 2 - phase);
    const sway = SWAY * near * Math.cos((y / WAVE) * Math.PI * 2 - phase);
    out += `${(x + sway).toFixed(1)} ${(y + lift).toFixed(1)}${after}`;
  }
  return out;
}
