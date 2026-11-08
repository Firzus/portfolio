import { Provisional } from "../../../components/ui/Provisional";
import { LinkButton } from "../../../components/ui/button";
import { findProject, person, type Picture, type Project } from "../../../content";
import { cn } from "../../../lib/utils";
import { href } from "../../types";
import { frame, textLink } from "./frame";

type Screen = { project: Project; picture: Picture; fit: "cover" | "contain" };

/** One screen per project, all shown at the screenshots' own 16:10 ratio. */
const screens: Screen[] = [
  { slug: "lysandra", picture: 0, fit: "cover" as const },
  { slug: "huzounet", picture: 1, fit: "cover" as const },
  { slug: "atelier", picture: 0, fit: "contain" as const },
].flatMap(({ slug, picture, fit }) => {
  const project = findProject(slug);
  return project ? [{ project, picture: project.pictures[picture], fit }] : [];
});

/** The pinned name: it holds at the top while the projects' screens pass under its lower edge. */
export function Hero() {
  return (
    <section data-slot="hero" aria-labelledby="a-title">
      <div data-slot="hero-pin" className={cn(frame, "a-pin bg-ground pt-3 pb-5 text-center lg:pt-4 lg:pb-8")}>
        <h1 id="a-title" className="font-display text-display">
          <span className="block text-display whitespace-nowrap">{person.name}</span>
          <span className="block text-head">{person.title}</span>
        </h1>
      </div>

      <div className={cn(frame, "a-screens pt-4 lg:pt-6")}>
        <p data-slot="hero-lead" data-reveal className="max-w-[26ch] text-lead font-medium">
          <Provisional value={person.lead} />
        </p>
        <div data-slot="hero-action" data-reveal>
          <LinkButton href={`mailto:${person.email}`}>Écrire à Lilian</LinkButton>
        </div>

        {screens.map(({ project, picture, fit }, i) => (
          <figure key={project.slug} data-slot="hero-screen" data-reveal>
            <div className={cn("a-ratio-screen overflow-hidden", fit === "contain" && "bg-ink")}>
              <img
                src={picture.src}
                alt={picture.alt}
                width={picture.width}
                height={picture.height}
                loading={i === 0 ? "eager" : "lazy"}
                className={cn("size-full", fit === "cover" ? "object-cover" : "object-contain")}
              />
            </div>
            <figcaption className="mt-3 flex flex-wrap justify-between gap-x-6 gap-y-1 text-small">
              <span>
                <a className={cn(textLink, "font-extrabold")} href={href("a", project.slug)}>
                  {project.name}
                </a>
                <span className="ml-3">
                  {project.kind}, {project.year}
                </span>
              </span>
              <span>{picture.caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
