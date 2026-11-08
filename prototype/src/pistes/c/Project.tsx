import { useRef } from "react";
import { Provisional } from "../../components/ui/Provisional";
import { person, type Project as ProjectData } from "../../content";
import { useReveal } from "../../lib/motion";
import { href } from "../types";
import { ArrowLink } from "./components/ArrowLink";
import { ContactBand, FooterLine } from "./components/Closing";
import { FrameView } from "./components/FrameView";
import { Loupe } from "./components/Loupe";
import { chronological, framesBySlug } from "./frames";

export function Project({ project }: { project: ProjectData }) {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  const position = chronological.findIndex((p) => p.slug === project.slug);
  const next = chronological[(position + 1) % chronological.length];

  return (
    <>
      <main ref={root}>
        <nav aria-label="Navigation" className="flex items-center justify-between gap-5 px-5 pt-5 text-body">
          <a href={href("c")} className="font-semibold hover:underline">
            {person.name}
          </a>
          <ArrowLink href={`${href("c")}#projets`} direction="left">
            Tous les projets
          </ArrowLink>
        </nav>

        <header className="grid gap-x-5 gap-y-5 px-5 pt-10 md:grid-cols-12 md:pt-14">
          <h1 className="font-display text-display font-normal md:col-span-6">{project.name}</h1>
          <p data-reveal="" className="text-lead md:col-span-6 md:self-end lg:col-span-5 lg:col-start-8">{project.summary}</p>
        </header>

        <section aria-label="Le projet" className="mt-12 grid gap-x-5 gap-y-10 px-5 md:grid-cols-12 md:mt-16">
          <div data-reveal="" className="flex flex-col gap-3 md:col-span-6 lg:col-span-5">
            <h2 className="text-body font-semibold">Contexte</h2>
            {project.context.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
          <div data-reveal="" className="flex flex-col gap-3 md:col-span-6 lg:col-span-3 lg:col-start-7">
            <h2 className="text-body font-semibold">Rôle</h2>
            <p>
              <Provisional value={project.role} />
            </p>
            <h2 className="mt-6 text-body font-semibold">Liens</h2>
            <ul className="flex flex-col gap-3">
              {project.links.map((link, index) => (
                <li key={link.href}>
                  <ArrowLink variant={index === 0 ? "solid" : "text"} href={link.href}>
                    {link.label}
                  </ArrowLink>
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal="" className="flex flex-col gap-3 md:col-span-6 lg:col-span-3 lg:col-start-10">
            <h2 className="text-body font-semibold">Repères</h2>
            <dl className="flex flex-col gap-2.5">
              {[{ label: "Année", value: project.year }, { label: "Domaine", value: project.kind }, ...project.facts].map((f) => (
                <div key={f.label} className="flex justify-between gap-4">
                  <dt className="text-muted">{f.label}</dt>
                  <dd className="text-right">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section aria-labelledby="c-sheet-title" className="mt-24 px-5 md:mt-32">
          <h2 id="c-sheet-title" className="mb-6 text-lead font-normal">
            Planche de {project.name}
          </h2>
          <Loupe frames={framesBySlug[project.slug]} label={`Images de ${project.name}`} />
        </section>

        <section aria-labelledby="c-next-title" className="c-field mt-36 bg-ground px-5 py-20 text-ink max-md:mt-28 md:py-24">
          <div className="group relative grid gap-x-5 gap-y-8 md:grid-cols-12">
            <div data-reveal="" className="flex flex-col gap-4 md:col-span-4">
              <h2 id="c-next-title" className="text-head">
                <a href={href("c", next.slug)} className="after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-focus">
                  {next.name}
                </a>
              </h2>
              <p>
                Le projet suivant, {next.year} : {next.summary.charAt(0).toLowerCase() + next.summary.slice(1)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 md:col-span-8 md:grid-cols-4">
              {framesBySlug[next.slug].slice(0, 4).map((frame) => (
                <FrameView
                  key={frame.id}
                  frame={frame}
                  boxAspect={1.25}
                  decorative
                  eager
                  className="aspect-[5/4] transition-opacity duration-200 group-hover:opacity-80"
                />
              ))}
            </div>
          </div>
        </section>

        <ContactBand />
      </main>
      <FooterLine />
    </>
  );
}
