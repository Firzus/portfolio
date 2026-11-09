import { m } from "../paraglide/messages.js";
import { localizeHref } from "../paraglide/runtime.js";
import atelierIsOnScreen from "./code/atelier-is-on-screen.cs?raw";

export interface Picture {
  src: string;
  width: number;
  height: number;
  /**
   * Description for where the picture stands alone (project cards, project pages). A message
   * function, so the text follows the locale of the page being rendered.
   */
  alt: () => string;
  /** A stand-in until Lilian provides the real picture; the page marks it as provisional. */
  provisional?: boolean;
  /** Shown on the home page only: on the project page, the project's demo reproduces it. */
  reproducedByDemo?: boolean;
}

export interface Stat {
  value: () => string;
  label: () => string;
}

export interface ProjectLink {
  href: string;
  /** Kind of destination, shown before the label (site, demo, repository). */
  type: () => string;
  label: () => string;
}

export interface CodeSample {
  fileName: string;
  source: string;
  intro: () => string;
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
  /** Studio or frame of the project and its dates, shown under the name on its page. */
  period: () => string;
  /** A line that stays in English in every locale. */
  signature?: () => string;
  context: (() => string)[];
  role: () => string;
  built: (() => string)[];
  /** Technologies, by their own names. */
  stack: string[];
  stats: Stat[];
  links: ProjectLink[];
  code?: CodeSample;
  /** A working reproduction of the project, shown at the top of its page instead of a picture. */
  demo?: "atelier-inspector";
}

// Provisional pictures, reprinted as violet duotones, until Lilian provides the real ones.
const picture = (name: string, alt: () => string): Picture => ({
  src: `/images/placeholders/${name}.webp`,
  width: 1586,
  height: 992,
  alt,
  provisional: true,
});

const literal = (text: string) => () => text;

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
    period: m.project_lysandra_period,
    context: [m.project_lysandra_context_1, m.project_lysandra_context_2],
    role: m.project_lysandra_role,
    built: [
      m.project_lysandra_built_1,
      m.project_lysandra_built_2,
      m.project_lysandra_built_3,
      m.project_lysandra_built_4,
      m.project_lysandra_built_5,
      m.project_lysandra_built_6,
      m.project_lysandra_built_7,
      m.project_lysandra_built_8,
      m.project_lysandra_built_9,
    ],
    stack: ["Unity 6", "URP", "Cinemachine", "Tauri 2", "Cloudflare R2"],
    stats: [
      { value: literal("7"), label: m.project_lysandra_stat_team },
      { value: literal("16"), label: m.project_lysandra_stat_decisions },
    ],
    links: [
      {
        href: "https://lysandra.faill.studio",
        type: m.row_type_demo,
        label: m.project_lysandra_link,
      },
    ],
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
    period: m.project_huzounet_period,
    context: [
      m.project_huzounet_context_1,
      m.project_huzounet_context_2,
      m.project_huzounet_context_3,
    ],
    role: m.project_huzounet_role,
    built: [
      m.project_huzounet_built_1,
      m.project_huzounet_built_2,
      m.project_huzounet_built_3,
      m.project_huzounet_built_4,
      m.project_huzounet_built_5,
      m.project_huzounet_built_6,
      m.project_huzounet_built_7,
    ],
    stack: ["Next.js", "Payload CMS", "PostgreSQL", "Tauri 2", "TanStack Start"],
    stats: [
      { value: m.project_huzounet_stat_visitors_value, label: m.project_huzounet_stat_visitors },
      { value: m.home_stat_huzounet_value, label: m.project_huzounet_stat_builds },
    ],
    links: [{ href: "https://huzounet.fr", type: m.row_type_site, label: m.project_huzounet_link }],
  },
  {
    slug: "atelier",
    name: "Atelier",
    year: "2026",
    kind: m.project_atelier_kind,
    summary: m.project_atelier_summary,
    fact: () => "Unity 6, URP",
    pictures: [
      {
        ...media("atelier", "behaviour", m.project_atelier_picture_behaviour),
        reproducedByDemo: true,
      },
      {
        ...media("atelier", "node-picker", m.project_atelier_picture_node_picker),
        reproducedByDemo: true,
      },
      media("atelier", "custom-node", m.project_atelier_picture_custom_node),
    ],
    period: m.project_atelier_period,
    signature: m.project_atelier_signature,
    demo: "atelier-inspector",
    context: [
      m.project_atelier_context_1,
      m.project_atelier_context_2,
      m.project_atelier_context_3,
    ],
    role: m.project_atelier_role,
    built: [
      m.project_atelier_built_1,
      m.project_atelier_built_2,
      m.project_atelier_built_3,
      m.project_atelier_built_4,
    ],
    stack: ["Unity 6", "URP", "C#"],
    stats: [
      { value: literal("0.1.0"), label: m.project_atelier_stat_version },
      { value: literal("MIT"), label: m.project_atelier_stat_license },
    ],
    links: [
      {
        href: "https://github.com/Firzus/atelier",
        type: m.row_type_repository,
        label: m.project_atelier_link,
      },
    ],
    code: {
      fileName: "IsOnScreenCondition.cs",
      source: atelierIsOnScreen,
      intro: m.project_atelier_code_intro,
    },
  },
];

/** The project with this slug, or undefined for an address that names no project. */
export function lookupProject(slug: string): Project | undefined {
  return projects.find((candidate) => candidate.slug === slug);
}

export function findProject(slug: string): Project {
  const project = lookupProject(slug);
  if (!project) throw new Error(`Unknown project: ${slug}`);
  return project;
}

/** Path of a project's page in the current locale (`/projets/<slug>`, `/en/projects/<slug>`). */
export function projectHref(slug: string): string {
  return localizeHref(`/projets/${slug}`);
}
