import { Tabs } from "@base-ui/react/tabs";
import { useEffect, useRef, useState } from "react";
import { Provisional } from "../../components/ui/Provisional";
import { projects, type Picture, type Project as ProjectData } from "../../content";
import { cn } from "../../lib/utils";
import { href } from "../types";
import { Arrow, Band, PourRow, CardLink, Chip, Stats, Tag, Thumb, gutter } from "./parts/kit";
import { Frame } from "./parts/shell";
import { ShaderButton } from "./shaders/ShaderLayer";
import { useLiquidPill } from "./motion/fluid";

export function Project({ project }: { project: ProjectData }) {
  const [lead] = project.pictures;
  const main = project.links[0];
  const others = projects.filter((p) => p.slug !== project.slug);

  return (
    <Frame current="projets">
      <section className="grid border-b border-ink/8 lg:grid-cols-[1fr_minmax(0,46%)]">
        <div className={cn(gutter, "flex flex-col justify-center py-14 md:py-20")}>
          <nav aria-label="Fil d'Ariane" className="text-small font-medium text-ink/55">
            <a href={`${href("d")}#projets`} className="hover:text-ink">
              Projets
            </a>
            <span aria-hidden> / </span>
            <span aria-current="page" className="text-ink">
              {project.name}
            </span>
          </nav>
          <h1 className="mt-6 font-display text-display font-bold">
            {project.name}
          </h1>
          <p className="mt-6 max-w-[30rem] text-lead">
            {project.summary}
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            <ShaderButton href={main.href} className="h-[46px] text-sm">
              {main.label} {main.href.startsWith("http") && <span aria-hidden>↗</span>}
            </ShaderButton>
            <a href={`${href("d")}#projets`} className="inline-flex h-[46px] items-center rounded-control border border-ink/12 px-5 text-sm font-medium hover:border-ink/30">
              Tous les projets
            </a>
          </div>
          <Stats compact className="mt-12 max-w-xl" items={project.facts.map((fact) => ({ value: fact.value, label: fact.label }))} />
        </div>
        <figure className="relative max-lg:border-t max-lg:border-ink/8">
          <img data-vt-hero src={lead.src} alt={lead.alt} width={lead.width} height={lead.height} fetchPriority="high" className="size-full min-h-72 object-cover [view-transition-name:project-hero]" />
          <figcaption className="absolute bottom-3 left-3 rounded-md bg-field/85 px-2 py-1 text-[0.8125rem] text-ink/80">{lead.caption}</figcaption>
        </figure>
      </section>

      <Band>
        <div className="grid gap-8 lg:grid-cols-[5fr_6fr] lg:gap-16">
          <div>
            <h2 className="font-display text-[clamp(1.75rem,1.3rem+1.3vw,2.5rem)] leading-[1.08] font-bold tracking-[-0.03em]">Contexte</h2>
            <p className="mt-3 text-body text-ink/60">
              {project.kind}, {project.year}.
            </p>
          </div>
          <div data-reveal className="flex max-w-[42rem] flex-col gap-5 text-body leading-[1.68] text-ink/72">
            {project.context.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </Band>

      <Band>
        <div className="grid gap-8 lg:grid-cols-[2fr_3fr] lg:gap-16">
          <div>
            <Tag>Rôle</Tag>
            <h2 className="mt-3 font-display text-[1.375rem] leading-snug tracking-tight">Ce que Lilian a fait</h2>
            <p className="mt-3 text-body leading-relaxed text-ink/72">
              <Provisional value={project.role} />
            </p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {project.facts.map((fact) => (
                <Chip key={fact.label}>{fact.value}</Chip>
              ))}
            </div>
          </div>
          <ul className="self-start border-t border-ink/8">
            {project.links.map((link) => (
              <li key={link.href}>
                <PourRow href={link.href}>
                  <span className="w-16 shrink-0">
                    <Tag>Lien</Tag>
                  </span>
                  <span className="flex-1">{link.label}</span>
                  <Arrow external={link.href.startsWith("http")} className="text-ink/50 group-hover:text-accent" />
                </PourRow>
              </li>
            ))}
            <li>
              <PourRow href={`${href("d")}#contact`}>
                <span className="w-16 shrink-0">
                  <Tag>Contact</Tag>
                </span>
                <span className="flex-1">Parler de ce projet avec Lilian</span>
                <Arrow className="text-ink/50 group-hover:text-accent" />
              </PourRow>
            </li>
          </ul>
        </div>
      </Band>

      <Band>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-[clamp(1.75rem,1.4rem+1vw,2.25rem)] leading-[1.05] font-bold tracking-[-0.03em]">Images</h2>
          <p className="text-[0.8125rem] text-ink/55">Illustrations provisoires</p>
        </div>
        <PictureTabs name={project.name} pictures={project.pictures} />
      </Band>

      <Band>
        <h2 className="font-display text-[clamp(1.75rem,1.4rem+1vw,2.25rem)] leading-[1.05] font-bold tracking-[-0.03em]">Autres projets</h2>
        <ul className="mt-10 grid overflow-hidden rounded-xl border border-ink/8 md:grid-cols-2">
          {others.map((other) => (
            <li key={other.slug} data-card className="flex flex-col gap-4 border-ink/8 p-6 max-md:not-first:border-t md:not-first:border-l">
              <Thumb src={other.pictures[0].src} alt={other.pictures[0].alt} />
              <h3 className="mt-2 font-display text-[1.375rem] tracking-tight">{other.name}</h3>
              <p className="-mt-2 pb-2 text-[0.9375rem] leading-relaxed text-ink/65">{other.summary}</p>
              <CardLink href={href("d", other.slug)}>Voir le projet {other.name}</CardLink>
            </li>
          ))}
        </ul>
      </Band>
    </Frame>
  );
}

/**
 * The project's pictures as Base UI tabs with mono labels. Prerendered and without JavaScript it
 * is the plain list of every picture, since inactive tab panels would be hidden.
 */
function PictureTabs({ name, pictures }: { name: string; pictures: Picture[] }) {
  const [enhanced, setEnhanced] = useState(false);
  useEffect(() => setEnhanced(true), []);
  const [active, setActive] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  // -1 until hydrated, so the pill is placed again once the tab list exists.
  const pill = useLiquidPill(list, "[role='tab']", enhanced ? active : -1);

  const figure = (picture: Picture) => (
    <figure>
      <Thumb src={picture.src} alt={picture.alt} />
      <figcaption className="mt-3 text-[0.8125rem] text-ink/60">{picture.caption}</figcaption>
    </figure>
  );

  if (!enhanced) {
    return (
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        {pictures.map((picture) => (
          <div key={picture.src}>{figure(picture)}</div>
        ))}
      </div>
    );
  }

  return (
    <Tabs.Root value={active} onValueChange={(value) => setActive(value as number)} className="mt-10">
      <Tabs.List ref={list} aria-label={`Images de ${name}`} className="relative isolate flex flex-wrap gap-1.5">
        <span ref={pill} aria-hidden className="pointer-events-none absolute inset-0 -z-10 [filter:url(#d-goo)]">
          <span className="absolute top-0 left-0 rounded-md bg-pill opacity-0" />
          <span className="absolute top-0 left-0 rounded-md bg-pill opacity-0" />
        </span>
        {pictures.map((picture, i) => (
          <Tabs.Tab
            key={picture.src}
            value={i}
            className="cursor-pointer rounded-md px-2.5 py-1.5 text-[0.8125rem] font-medium text-ink/60 transition-colors duration-150 outline-none hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus data-active:text-ink"
          >
            {picture.caption.replace("Image provisoire : ", "")}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {pictures.map((picture, i) => (
        <Tabs.Panel key={picture.src} value={i} className="mt-6 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus">
          {figure(picture)}
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  );
}
