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

// The traced path holds absolute commands only, so it splits into commands and x/y pairs.
const parts = nameMark.d.split(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/);
const points: number[] = [];
for (let i = 1; i < parts.length; i += 3) points.push(Number(parts[i]), Number(parts[i + 1]));

/**
 * The name's path with a swell running through it. It moves the path's own points rather than
 * pixels (an SVG displacement filter pixelates the edges), so the letters stay crisp.
 */
export function swollenName({ amount, x: centre, phase }: Swell) {
  if (amount < 0.002) return nameMark.d;
  let out = parts[0];
  for (let i = 0, p = 0; i < points.length; i += 2, p += 3) {
    const x = points[i];
    const y = points[i + 1];
    const near = Math.exp(-(((x - centre) / SPREAD) ** 2)) * amount;
    const lift = LIFT * near * Math.sin((x / WAVE) * Math.PI * 2 - phase);
    const sway = SWAY * near * Math.cos((y / WAVE) * Math.PI * 2 - phase);
    out += `${(x + sway).toFixed(1)} ${(y + lift).toFixed(1)}${parts[p + 3]}`;
  }
  return out;
}
