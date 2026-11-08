import { Gamepad, Mail, Puzzle, Tools } from "iconoir-react";
import type { ComponentType, SVGProps } from "react";
import { Provisional } from "../../components/ui/Provisional";
import { findProject, person, projects } from "../../content";
import { cn } from "../../lib/utils";
import { href } from "../types";
import { Arrow, Band, PourRow, CardLink, Chip, Stats, Tag, Thumb, gutter } from "./parts/kit";
import { Frame, mailto } from "./parts/shell";
import { ShaderButton, ShaderLayer, useHover } from "./shaders/ShaderLayer";
import type { Scene } from "./shaders/scenes";

const huzounet = findProject("huzounet")!;
const lysandra = findProject("lysandra")!;
const atelier = findProject("atelier")!;

export function Home() {
  return (
    <Frame current="accueil">
      <Hero />
      <Statement />
      <ProjectGrid />
      <Paths />
      <Pictures />
      <About />
    </Frame>
  );
}

function Hero() {
  return (
    <section className="grid border-b border-ink/8 lg:grid-cols-[1fr_minmax(0,40%)]">
      <div className={cn(gutter, "flex flex-col justify-center py-16 md:py-24")}>
        {/* The name is shown large on the loading screen and stays in the header; here it is read only. */}
        <h1 className="font-display text-display">
          <span className="sr-only">{person.name}, </span>
          {person.title}
        </h1>
        <p className="mt-7 max-w-[30rem] text-lead">
          <Provisional value={person.lead} />
        </p>
        <div className="mt-9 flex flex-wrap gap-2.5">
          <ShaderButton href="#projets" className="h-[46px] text-sm">
            Voir les projets
          </ShaderButton>
          <a href={mailto} className="inline-flex h-[46px] items-center rounded-control border border-ink/12 px-5 text-sm font-medium transition-colors hover:border-ink/30">
            Écrire à Lilian
          </a>
        </div>
        <Stats
          className="mt-14 max-w-xl"
          items={[
            { value: "3", label: "Projets publiés" },
            { value: "1 901", label: "Équipements sur Huzounet" },
            { value: "MIT", label: "Licence d'Atelier" },
          ]}
        />
      </div>
      <HeroWork />
    </section>
  );
}

/** One picture per project beside the name, each opening its page, over a live two-ink field. */
function HeroWork() {
  const { hover, bind } = useHover();
  const [first, ...rest] = projects;
  const tile = (project: (typeof projects)[number], className?: string) => (
    <a href={href("d", project.slug)} className={cn("group relative block overflow-hidden rounded-lg", className)}>
      <img
        src={project.pictures[0].src}
        alt={project.pictures[0].alt}
        width={project.pictures[0].width}
        height={project.pictures[0].height}
        className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
      />
      <span className="absolute right-2.5 bottom-2.5 left-2.5 truncate justify-self-start rounded-md bg-field/85 px-2 py-1 text-[0.8125rem] font-medium sm:right-auto sm:max-w-[calc(100%-1.25rem)]">
        {project.name} <span className="hidden text-ink/55 sm:inline">· {project.kind}</span>
      </span>
    </a>
  );
  return (
    <div {...bind} className="relative isolate grid grid-cols-2 content-center gap-3 border-ink/8 p-6 max-lg:border-t md:p-12 lg:border-l lg:p-16">
      <ShaderLayer scene="hero" hover={hover} className="-z-10" />
      {tile(first, "col-span-2 aspect-[16/10]")}
      {rest.map((project) => tile(project, "aspect-[4/3]"))}
    </div>
  );
}

function Statement() {
  return (
    <Band id="a-propos-court">
      <div className="grid gap-8 lg:grid-cols-[5fr_6fr] lg:gap-16">
        <h2 data-reveal className="max-w-[36rem] font-display text-[clamp(1.75rem,1.3rem+1.3vw,2.5rem)] leading-[1.08] font-bold tracking-[-0.03em]">
          Le produit, et ce qui permet de le construire.
        </h2>
        <div data-reveal className="flex max-w-[42rem] flex-col gap-5 text-body leading-[1.68] text-ink/72">
          <p>
            Trois projets publiés : {lysandra.name}, {lysandra.summary.charAt(0).toLowerCase() + lysandra.summary.slice(1)} {huzounet.name}, {huzounet.summary.charAt(0).toLowerCase() + huzounet.summary.slice(1)}{" "}
            Et {atelier.name}, {atelier.summary.charAt(0).toLowerCase() + atelier.summary.slice(1)}
          </p>
        </div>
      </div>
    </Band>
  );
}

function ProjectGrid() {
  return (
    <Band id="projets">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="font-display text-head font-bold">Trois projets, du jeu à l'outil</h2>
          <p className="mt-4 max-w-[34rem] text-body leading-relaxed text-ink/65">
            Un jeu d'aventure, un site de référence pour joueurs et un outil pour Unity. Chaque projet a sa page avec le contexte, le rôle, les images et les liens.
          </p>
        </div>
        <a href={href("d", "huzounet")} className="group inline-flex h-[43px] items-center gap-2 rounded-control border border-ink/20 px-4 text-sm font-medium hover:border-ink/40">
          Ouvrir un cas complet <Arrow />
        </a>
      </div>
      <ul className="mt-12 grid overflow-hidden rounded-xl border border-ink/8 md:grid-cols-3">
        {projects.map((project) => (
          <li key={project.slug} data-card data-reveal className="flex flex-col gap-4 border-ink/8 p-6 max-md:not-first:border-t md:not-first:border-l">
            <Thumb src={project.pictures[0].src} alt={project.pictures[0].alt} />
            <h3 className="mt-2 font-display text-[1.375rem] tracking-tight">{project.name}</h3>
            <p className="-mt-2 text-[0.9375rem] leading-relaxed text-ink/65">{project.summary}</p>
            <div className="flex flex-wrap gap-1.5 pb-2">
              {[project.kind, project.year, ...project.facts.slice(0, 1).map((f) => f.value)].map((value) => (
                <Chip key={value}>{value}</Chip>
              ))}
            </div>
            <CardLink href={href("d", project.slug)}>
              Voir le projet {project.name}
            </CardLink>
          </li>
        ))}
      </ul>
    </Band>
  );
}

type Row = { type: string; label: string; href: string; external?: boolean };
type Path = { tag: string; icon: Scene; question: string; more: { label: string; href: string }; rows: Row[] };

const paths: Path[] = [
  {
    tag: "Jouer",
    icon: "icon-play",
    question: "Essayer un jeu que j'ai programmé ?",
    more: { label: "Le cas Lysandra", href: href("d", "lysandra") },
    rows: [
      { type: "Démo", label: "Tester la démo de Lysandra", href: lysandra.links[0].href, external: true },
      { type: "Projet", label: "Lysandra : contexte, rôle et images", href: href("d", "lysandra") },
    ],
  },
  {
    tag: "Outils",
    icon: "icon-tools",
    question: "Voir un outil utilisé par des joueurs ?",
    more: { label: "Le cas Huzounet", href: href("d", "huzounet") },
    rows: [
      { type: "Site", label: "huzounet.fr, équipements, monstres et marché", href: huzounet.links[0].href, external: true },
      { type: "Projet", label: "Huzounet : contexte, rôle et images", href: href("d", "huzounet") },
    ],
  },
  {
    tag: "Unity",
    icon: "icon-unity",
    question: "Assembler du gameplay sans ouvrir d'IDE ?",
    more: { label: "Le cas Atelier", href: href("d", "atelier") },
    rows: [
      { type: "Projet", label: "Atelier : un déclencheur, des conditions, des instructions", href: href("d", "atelier") },
      { type: "Dépôt", label: "Dépôt GitHub d'Atelier (lien à venir)", href: atelier.links[0].href },
    ],
  },
  {
    tag: "Contact",
    icon: "icon-contact",
    question: "Travailler ensemble ?",
    more: { label: "Écrire à Lilian", href: mailto },
    rows: [
      { type: "E-mail", label: person.email, href: mailto },
      ...person.links.map((link) => ({ type: "Profil", label: link.label, href: link.href, external: true })),
    ],
  },
];

function Paths() {
  return (
    <Band>
      <div className="lg:pl-[12%]">
        <h2 className="font-display text-head font-bold">Par où commencer ?</h2>
        <p className="mt-4 max-w-[26rem] text-body leading-relaxed text-ink/65">Choisissez ce que vous voulez voir, chaque ligne mène directement au bon endroit.</p>
      </div>
      <div className="mt-14 flex flex-col gap-14">
        {paths.map((path) => (
          <PathBlock key={path.tag} path={path} />
        ))}
      </div>
    </Band>
  );
}

/** One intent: its shader icon reacts while the pointer is anywhere over the block. */
function PathBlock({ path }: { path: Path }) {
  const { hover, bind } = useHover();
  return (
    <div {...bind} data-reveal className="group/path grid gap-6 lg:grid-cols-[2fr_3fr] lg:gap-16">
      <div className="flex gap-5">
        <IconDrop scene={path.icon} hover={hover} />
        <div>
          <Tag>{path.tag}</Tag>
          <h3 className="mt-1 font-display text-[1.375rem] leading-snug tracking-tight">{path.question}</h3>
          <a href={path.more.href} className="group mt-2 inline-flex gap-1.5 text-[0.8125rem] text-ink/55 hover:text-ink">
            {path.more.label} <Arrow />
          </a>
        </div>
      </div>
      <ul className="border-t border-ink/8">
        {path.rows.map((row) => (
          <li key={row.label}>
            <PourRow href={row.href}>
              <span className="w-16 shrink-0">
                <Tag>{row.type}</Tag>
              </span>
              <span className="flex-1">{row.label}</span>
              <Arrow external={row.external} className="text-ink/50 group-hover:text-accent" />
            </PourRow>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Iconoir pictograms, the project's icon set, one per intent. */
const glyphs: Record<string, ComponentType<SVGProps<SVGSVGElement> & { strokeWidth?: number }>> = {
  "icon-play": Gamepad,
  "icon-tools": Tools,
  "icon-unity": Puzzle,
  "icon-contact": Mail,
};

/**
 * An intent's icon: a drop that slowly changes shape, filled with a live liquid shader, under
 * a crisp pictogram that lifts when the block is hovered.
 */
function IconDrop({ scene, hover }: { scene: Scene; hover: boolean }) {
  const Glyph = glyphs[scene];
  return (
    <span aria-hidden data-drop style={{ animationDelay: `${-2.3 * Object.keys(glyphs).indexOf(scene)}s` }} className="relative grid size-14 shrink-0 place-items-center overflow-hidden">
      <ShaderLayer scene={scene} hover={hover} />
      <Glyph
        strokeWidth={1.6}
        className="relative size-7 text-ink transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/path:-translate-y-0.5 group-hover/path:scale-110 motion-reduce:transition-none"
      />
    </span>
  );
}

function Pictures() {
  const all = projects.flatMap((project) => project.pictures.map((picture) => ({ project, picture })));
  return (
    <Band>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 className="font-display text-[clamp(1.75rem,1.4rem+1vw,2.25rem)] leading-[1.05] font-bold tracking-[-0.03em]">Images des projets</h2>
        <p className="text-[0.8125rem] text-ink/55">Illustrations provisoires</p>
      </div>
      <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {all.map(({ project, picture }) => (
          <li key={picture.src} data-reveal>
            <a href={href("d", project.slug)} className="group block">
              <Thumb src={picture.src} alt={picture.alt} className="transition-[border-color] duration-150 group-hover:border-ink/25" />
              <p className="mt-4 text-[0.8125rem] font-medium text-ink/50">{project.name}</p>
              <p className="mt-1.5 text-[0.9375rem] leading-snug font-semibold tracking-tight">{picture.caption.replace("Image provisoire : ", "")}</p>
            </a>
          </li>
        ))}
      </ul>
    </Band>
  );
}

function About() {
  return (
    <section id="a-propos" className="border-b border-ink/8">
      <div className={cn(gutter, "grid gap-12 py-16 md:py-24 lg:grid-cols-[2fr_3fr] lg:gap-16")}>
        <figure className="grid aspect-square w-full max-w-sm place-items-center rounded-xl bg-surface">
          <figcaption className="text-sm text-ink/55">Portrait de Lilian, à venir</figcaption>
        </figure>
        <div>
          <h2 className="font-display text-[clamp(1.75rem,1.4rem+1vw,2.375rem)] leading-[1.05] font-bold tracking-[-0.03em]">Bonjour, je suis Lilian</h2>
          <p className="mt-5 max-w-[38rem] text-body leading-relaxed text-ink/72">
            <Provisional value={person.about} />
          </p>
          <div id="contact" className="mt-10 max-w-[38rem] rounded-xl bg-surface p-6">
            <h3 className="text-lg font-bold tracking-tight">Écrire à Lilian</h3>
            <p className="mt-1.5 text-[0.8125rem] text-ink/60">
              <Provisional value={{ text: "Pour un poste, une mission ou une question sur un projet.", provisional: true }} />
            </p>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <span className="flex h-10 flex-1 items-center text-[0.9375rem] font-medium select-all">{person.email}</span>
              <ShaderButton href={mailto} className="h-10 rounded-lg px-4 text-[0.8125rem]">
                Envoyer un e-mail
              </ShaderButton>
            </div>
            <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.8125rem] text-ink/55">
              {person.links.map((link) => (
                <a key={link.label} href={link.href} className="group hover:text-ink">
                  {link.label} <Arrow external />
                </a>
              ))}
              <a href={person.cv.href} className="hover:text-ink">
                {person.cv.label} (provisoire)
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
