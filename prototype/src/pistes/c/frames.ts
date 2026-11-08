import type { CSSProperties } from "react";
import { projects, type Picture, type Project } from "../../content";

/** A point of a picture to centre on, in fractions of its width and height, and how far to zoom in. */
export type Crop = { x: number; y: number; zoom: number };

/**
 * One frame of the contact sheet: a real screenshot, whole or as a detail crop of the same file,
 * or a piece of Atelier drawn in HTML (its interface structure, its mark).
 */
export type Frame =
  | { id: string; type: "picture"; picture: Picture; caption: string; alt: string; crop?: Crop }
  | { id: string; type: "atelier-ui" | "atelier-mark"; caption: string; alt: string };

/**
 * Background size and position that show `crop` inside a box of `boxAspect` (width / height):
 * the picture is scaled to cover the box, then by `zoom`. A background rather than a scaled <img>
 * keeps the frame's box the size of the frame, so the page's layout checks measure it correctly.
 */
export function cropStyle(crop: Crop, picture: Picture, boxAspect: number): CSSProperties {
  const aspect = picture.width / picture.height;
  const wide = aspect > boxAspect;
  const visibleX = (wide ? boxAspect / aspect : 1) / crop.zoom;
  const visibleY = (wide ? 1 : aspect / boxAspect) / crop.zoom;
  // A background-position percentage aligns that point of the picture with the same point of the
  // box, so the visible window starts at p * (1 - visible); solve it for the crop's centre.
  const solve = (centre: number, visible: number) =>
    visible >= 1 ? 50 : Math.min(100, Math.max(0, ((centre - visible / 2) / (1 - visible)) * 100));
  const zoom = `${(crop.zoom * 100).toFixed(1)}%`;
  return {
    backgroundImage: `url(${picture.src})`,
    backgroundSize: wide ? `auto ${zoom}` : `${zoom} auto`,
    backgroundPosition: `${solve(crop.x, visibleX).toFixed(1)}% ${solve(crop.y, visibleY).toFixed(1)}%`,
  };
}

const project = (slug: string) => projects.find((p) => p.slug === slug)!;
const picture = (slug: string, index = 0) => project(slug).pictures[index];

const whole = (slug: string, index = 0): Frame => {
  const p = picture(slug, index);
  return { id: `${slug}-${index}`, type: "picture", picture: p, caption: p.caption, alt: p.alt };
};

const detail = (slug: string, index: number, id: string, caption: string, crop: Crop): Frame => ({
  id: `${slug}-${id}`,
  type: "picture",
  picture: picture(slug, index),
  caption,
  alt: caption,
  crop,
});

/** Every frame of each project, in the order shown on its strip and on its project page. */
export const framesBySlug: Record<string, Frame[]> = {
  huzounet: [
    whole("huzounet", 0),
    detail("huzounet", 1, "ensemble", "Détail : un ensemble d'équipements de l'élément Feu", { x: 0.38, y: 0.35, zoom: 2.4 }),
    whole("huzounet", 1),
    detail("huzounet", 1, "filtres", "Détail : les filtres par mode, niveau, budget et élément", { x: 0.13, y: 0.3, zoom: 2.4 }),
    whole("huzounet", 2),
    detail("huzounet", 2, "boss", "Détail : les fiches de boss de la base des monstres", { x: 0.55, y: 0.7, zoom: 2.6 }),
    detail("huzounet", 3, "outils", "Détail : la liste des outils", { x: 0.28, y: 0.38, zoom: 1.9 }),
    whole("huzounet", 3),
  ],
  lysandra: [
    whole("lysandra", 0),
    detail("lysandra", 0, "heroine", "Détail : l'héroïne face au ciel d'îles flottantes", { x: 0.82, y: 0.72, zoom: 2.8 }),
    detail("lysandra", 0, "ile", "Détail : l'île flottante de l'accueil", { x: 0.3, y: 0.42, zoom: 1.8 }),
    detail("lysandra", 0, "titre", "Détail : « Rendez-vous là-haut », le titre de l'accueil", { x: 0.5, y: 0.53, zoom: 2.6 }),
    detail("lysandra", 0, "demo", "Détail : les boutons « Tester la démo » et « Soutenir le projet »", { x: 0.5, y: 0.93, zoom: 2.8 }),
    detail("lysandra", 0, "logo", "Détail : le logo de Lysandra", { x: 0.07, y: 0.05, zoom: 5 }),
    detail("lysandra", 0, "kickstarter", "Détail : l'accès à la campagne Kickstarter", { x: 0.9, y: 0.04, zoom: 4 }),
  ],
  atelier: [
    whole("atelier", 0),
    { id: "atelier-ui", type: "atelier-ui", caption: "Un comportement Atelier : un déclencheur, des conditions, puis des instructions", alt: "" },
    detail("atelier", 0, "nom", "Détail : le nom du projet sur sa bannière", { x: 0.19, y: 0.48, zoom: 2.2 }),
    detail("atelier", 0, "phrase", "Détail : « Assemble gameplay. In the Inspector or in C#. »", { x: 0.29, y: 0.69, zoom: 1.7 }),
    { id: "atelier-mark", type: "atelier-mark", caption: "La marque d'Atelier, un cube dans un hexagone", alt: "Marque d'Atelier" },
    detail("atelier", 0, "cube", "Détail : le cube de la bannière", { x: 0.83, y: 0.64, zoom: 2.2 }),
    detail("atelier", 0, "licence", "Détail : open source, Unity 6, licence MIT", { x: 0.23, y: 0.36, zoom: 2.6 }),
  ],
};

export type Category = "jeux" | "outils";

/** The filter each project answers to; derived from its `kind` in the shared content. */
export const categoryOf: Record<string, Category> = { lysandra: "jeux", huzounet: "outils", atelier: "outils" };

/** Projects in the order they were made (oldest first), as the contact sheet shows them. */
export const chronological: Project[] = [...projects].sort((a, b) => a.year.localeCompare(b.year));
