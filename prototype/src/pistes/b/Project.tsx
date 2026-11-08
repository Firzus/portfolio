import { useRef } from "react";
import { LinkButton } from "../../components/ui/button";
import { Provisional } from "../../components/ui/Provisional";
import { person, projects, type Project as ProjectData } from "../../content";
import { useReveal } from "../../lib/motion";
import { href } from "../types";
import { Contact } from "./sections/Contact";
import { Footer } from "./sections/Footer";
import { Ledger } from "./sections/Ledger";
import { mailto } from "./lib/hooks";
import { Rail } from "./sections/Rail";
import { ScreenTabs } from "./ui/ScreenTabs";

const isPlaceholder = (url: string) => url.startsWith("#");

/** Case study template shared by the three projects. */
export function Project({ project }: { project: ProjectData }) {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);

  const [lead, ...screens] = project.pictures;
  const [primary, ...otherLinks] = project.links;
  const others = projects.filter((p) => p.slug !== project.slug);
  const facts = [
    { label: "Catégorie", value: project.kind },
    { label: "Année", value: project.year },
    ...project.facts,
  ];

  return (
    <div ref={root} className="relative">
      <Rail />
      <main>
        <header className="px-6 pt-16 pb-20 md:pt-24 xl:grid xl:grid-cols-[minmax(0,35rem)_minmax(0,1fr)] xl:gap-x-16 xl:pl-[22vw]">
          <div>
            <h1 className="font-display text-display font-bold">{project.name}</h1>
            <p data-reveal className="mt-8 max-w-[34ch] text-lead">{project.summary}</p>
            <div data-reveal className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              {primary && !isPlaceholder(primary.href) ? (
                <LinkButton href={primary.href}>
                  Ouvrir {primary.label} <span aria-hidden>↗</span>
                </LinkButton>
              ) : (
                <>
                  <LinkButton href={mailto(person.email)}>Écrire un e-mail</LinkButton>
                  {primary && <p className="text-body text-muted">{primary.label}</p>}
                </>
              )}
              <a className="text-body underline decoration-1 underline-offset-4 hover:decoration-2" href={`${href("b")}#projets`}>
                Tous les projets
              </a>
            </div>
          </div>
          <dl className="mt-14 grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-x-6 gap-y-4 self-end xl:mt-0">
            {facts.map((fact) => (
              <div key={fact.label} className="contents">
                <dt data-reveal className="text-small text-muted">
                  {fact.label}
                </dt>
                <dd data-reveal className="text-body">
                  {fact.value}
                </dd>
              </div>
            ))}
            <dt data-reveal className="text-small text-muted">
              Rôle
            </dt>
            <dd data-reveal className="text-body">
              <Provisional value={project.role} />
            </dd>
          </dl>
        </header>

        <figure>
          <img
            src={lead.src}
            alt={lead.alt}
            width={lead.width}
            height={lead.height}
            fetchPriority="high"
            style={{ aspectRatio: `${lead.width} / ${lead.height}` }}
            className="block max-h-[85svh] w-full bg-surface object-cover object-top"
          />
          <figcaption data-reveal className="mt-3 px-6 text-small text-muted xl:pl-[22vw]">{lead.caption}</figcaption>
        </figure>

        <section aria-labelledby="contexte-titre" className="px-6 pt-30 xl:pl-[22vw]">
          <h2 id="contexte-titre" data-reveal className="font-display text-head font-bold">
            Contexte
          </h2>
          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,35rem)_minmax(0,1fr)] xl:gap-x-16">
            {project.context.map((paragraph) => (
              <p key={paragraph} data-reveal className="max-w-[52ch]">
                {paragraph}
              </p>
            ))}
          </div>
          {otherLinks.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-x-8">
              {otherLinks.map((link) => (
                <li key={link.href}>
                  <a className="underline underline-offset-4" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        {screens.length > 0 && (
          <section aria-labelledby="ecrans-titre" className="px-6 pt-30 xl:pl-[22vw]">
            <h2 id="ecrans-titre" data-reveal className="font-display text-head font-bold">
              Écrans
            </h2>
            <div data-reveal className="mt-8">
              <ScreenTabs label={`Écrans de ${project.name}`} pictures={screens} />
            </div>
          </section>
        )}

        <Ledger id="projets" heading="Et les autres projets ?" projects={others} />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
