import { useRef } from "react";
import { Provisional } from "../../components/ui/Provisional";
import { LinkButton } from "../../components/ui/button";
import { projects, type Project } from "../../content";
import { useReveal } from "../../lib/motion";
import { cn } from "../../lib/utils";
import { href } from "../types";
import { AtelierUi } from "./parts/AtelierUi";
import { Contact } from "./parts/Contact";
import { frame, sectionGap } from "./parts/frame";
import { ScreenTabs, type ScreenItem } from "./parts/ScreenTabs";
import { SiteFooter } from "./parts/SiteFooter";
import { SiteHeader } from "./parts/SiteHeader";

function screensOf(project: Project): ScreenItem[] {
  const items: ScreenItem[] = project.pictures.map((picture, i) => ({
    id: picture.src,
    label: picture.caption,
    thumb: picture,
    content: (
      <div className={cn("a-ratio-screen overflow-hidden", picture.width / picture.height > 1.7 && "bg-ink")}>
        <img
          src={picture.src}
          alt={picture.alt}
          width={picture.width}
          height={picture.height}
          loading={i === 0 ? "eager" : "lazy"}
          className="size-full object-contain"
        />
      </div>
    ),
  }));
  if (project.slug === "atelier") {
    items.push({
      id: "atelier-ui",
      label: "Un comportement : déclencheur, conditions, instructions",
      thumb: project.pictures[0],
      thumbPosition: "object-right",
      content: <AtelierUi className="a-ratio-screen h-auto" />,
    });
  }
  return items;
}

/**
 * Facts of the project, set beside its screens. No entrance here: this subtree is replaced
 * after hydration, after the page's entrance observer has already collected its elements.
 */
function ProjectFacts({ project }: { project: Project }) {
  return (
    <dl className="flex flex-col gap-5">
      {project.facts.map((fact) => (
        <div key={fact.label}>
          <dt className="text-small font-medium text-muted">{fact.label}</dt>
          <dd className="text-lead font-extrabold">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** One case study: the project's name holds the top, its screens change in the frame beneath. */
export function ProjectPage({ project }: { project: Project }) {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  const index = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(index + 1) % projects.length];
  const nextPicture = next.pictures[0];

  return (
    <div ref={root}>
      <SiteHeader onHome={false} />
      <main>
        <section data-slot="project-hero" aria-labelledby="a-project-title" className={frame}>
          <div className="pt-3 pb-8 text-center lg:pt-4 lg:pb-12">
            <h1 id="a-project-title" className="font-display text-display">
              {project.name}
            </h1>
            <p data-reveal className="mx-auto mt-6 max-w-[44ch] text-lead font-medium">{project.summary}</p>
            <div data-reveal className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <span className="text-small font-medium">
                {project.kind}, {project.year}
              </span>
              {project.links.map((link) => (
                <LinkButton key={link.href} href={link.href}>
                  {link.label}
                </LinkButton>
              ))}
            </div>
          </div>
          <ScreenTabs items={screensOf(project)} aside={<ProjectFacts project={project} />} />
        </section>

        <section
          data-slot="project-story"
          aria-labelledby="a-context-title"
          className={cn(frame, sectionGap, "grid gap-8 lg:grid-cols-12")}
        >
          <h2 id="a-context-title" data-reveal className="font-display text-head lg:col-span-4">
            Contexte
          </h2>
          <div className="flex flex-col gap-6 lg:col-span-7 lg:col-start-6">
            {project.context.map((paragraph) => (
              <p key={paragraph} data-reveal className="max-w-[62ch]">
                {paragraph}
              </p>
            ))}
            <h3 data-reveal className="mt-8 font-display text-lead">
              Rôle
            </h3>
            <p data-reveal className="max-w-[62ch]">
              <Provisional value={project.role} />
            </p>
          </div>
        </section>

        <section
          data-slot="project-next"
          aria-labelledby="a-next-title"
          className={cn(frame, sectionGap, "mb-32 grid items-end gap-8 lg:mb-48 lg:grid-cols-12")}
        >
          <div className="lg:col-span-5">
            <h2 id="a-next-title" data-reveal className="font-display text-head">
              <a
                className="underline decoration-transparent decoration-4 underline-offset-8 transition-[text-decoration-color] duration-150 hover:decoration-ink motion-reduce:transition-none"
                href={href("a", next.slug)}
              >
                {next.name}
              </a>
            </h2>
            <p data-reveal className="mt-4 max-w-[40ch]">
              Projet suivant. {next.summary}
            </p>
          </div>
          <a
            href={href("a", next.slug)}
            tabIndex={-1}
            aria-hidden="true"
            data-reveal
            className={cn("a-ratio-screen block overflow-hidden lg:col-span-7", next.slug === "atelier" && "bg-ink")}
          >
            <img
              src={nextPicture.src}
              alt=""
              width={nextPicture.width}
              height={nextPicture.height}
              loading="lazy"
              className={cn(
                "size-full transition-transform duration-500 hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:scale-100",
                next.slug === "atelier" ? "object-contain" : "object-cover",
              )}
            />
          </a>
        </section>

        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}
