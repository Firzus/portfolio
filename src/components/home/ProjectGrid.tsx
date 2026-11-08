import { ArrowRight } from "iconoir-react";
import { projects, projectHref } from "../../content/projects";
import { m } from "../../paraglide/messages.js";
import { Band } from "../ui/band";
import { Chip } from "../ui/chip";
import { Thumbnail } from "../ui/thumbnail";

export function ProjectGrid() {
  return (
    <Band id="projects" aria-labelledby="projects-heading">
      <h2 id="projects-heading" className="font-display text-head font-heading">
        {m.home_projects_heading()}
      </h2>
      <p className="mt-4 max-w-lg text-body text-muted">{m.home_projects_intro()}</p>
      <ul className="mt-12 grid overflow-hidden rounded-xl border border-line md:grid-cols-3">
        {projects.map((project) => {
          // The first picture already stands beside the hero; the card shows the next one.
          const picture = project.pictures[1] ?? project.pictures[0];
          return (
            <li
              key={project.slug}
              data-project-card
              className="flex flex-col gap-4 border-line p-6 max-md:not-first:border-t md:not-first:border-l"
            >
              {picture && (
                <Thumbnail
                  src={picture.src}
                  alt={picture.alt()}
                  width={picture.width}
                  height={picture.height}
                />
              )}
              <h3 className="mt-2 font-display text-title font-heading">{project.name}</h3>
              <p className="-mt-2 text-small text-muted">{project.summary()}</p>
              <ul className="flex flex-wrap gap-1.5 pb-2">
                {[project.kind(), project.year, project.fact()].map((fact) => (
                  <li key={fact}>
                    <Chip>{fact}</Chip>
                  </li>
                ))}
              </ul>
              <a
                href={projectHref(project.slug)}
                className="group mt-auto inline-flex items-center gap-1.5 self-start rounded-sm pt-2 text-small font-medium transition-colors hover:text-accent motion-reduce:transition-none"
              >
                {m.home_project_link({ name: project.name })}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                />
              </a>
            </li>
          );
        })}
      </ul>
    </Band>
  );
}
