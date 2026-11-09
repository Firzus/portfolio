import { m } from "../paraglide/messages.js";
import { localizeHref } from "../paraglide/runtime.js";

export interface Picture {
  src: string;
  width: number;
  height: number;
  /**
   * Description for where the picture stands alone (project cards, project pages). A message
   * function, so the text follows the locale of the page being rendered.
   */
  alt: () => string;
}

export interface Project {
  slug: string;
  name: string;
  year: string;
  kind: () => string;
  summary: () => string;
  /** The fact shown on the project's card. */
  fact: () => string;
  /** The first picture stands for the project. */
  pictures: Picture[];
  /** The project's own site, when it has one. */
  site?: string;
}

// Provisional pictures, reprinted as violet duotones, until Lilian provides the real ones.
const picture = (name: string, alt: () => string): Picture => ({
  src: `/images/placeholders/${name}.webp`,
  width: 1586,
  height: 992,
  alt,
});

// A capture of the project set on an Encre background, exported at twice its 1000 by 625 layout.
const media = (slug: string, name: string, alt: () => string): Picture => ({
  src: `/images/projects/${slug}/${name}.avif`,
  width: 2000,
  height: 1250,
  alt,
});

/** Single source of the projects, so the home page and the project pages cannot diverge. */
export const projects: Project[] = [
  {
    slug: "lysandra",
    name: "Lysandra",
    year: "2026",
    kind: m.project_lysandra_kind,
    summary: m.project_lysandra_summary,
    fact: m.project_lysandra_fact,
    pictures: [
      picture("lysandra-1", m.project_lysandra_picture_1),
      picture("lysandra-2", m.project_lysandra_picture_2),
    ],
    site: "https://lysandra.faill.studio",
  },
  {
    slug: "huzounet",
    name: "Huzounet",
    year: "2025",
    kind: m.project_huzounet_kind,
    summary: m.project_huzounet_summary,
    fact: m.project_huzounet_fact,
    pictures: [
      media("huzounet", "home", m.project_huzounet_picture_home),
      media("huzounet", "equipments", m.project_huzounet_picture_equipments),
      media("huzounet", "market", m.project_huzounet_picture_market),
      media("huzounet", "mobile", m.project_huzounet_picture_mobile),
    ],
    site: "https://huzounet.fr",
  },
  {
    slug: "atelier",
    name: "Atelier",
    year: "2026",
    kind: m.project_atelier_kind,
    summary: m.project_atelier_summary,
    fact: () => "Unity 6, URP",
    pictures: [
      media("atelier", "behaviour", m.project_atelier_picture_behaviour),
      media("atelier", "node-picker", m.project_atelier_picture_node_picker),
      media("atelier", "custom-node", m.project_atelier_picture_custom_node),
    ],
  },
];

export function findProject(slug: string): Project {
  const project = projects.find((candidate) => candidate.slug === slug);
  if (!project) throw new Error(`Unknown project: ${slug}`);
  return project;
}

/** Path of a project's page in the current locale (`/projets/<slug>`, `/en/projects/<slug>`). */
export function projectHref(slug: string): string {
  return localizeHref(`/projets/${slug}`);
}
