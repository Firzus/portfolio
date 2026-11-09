import { projects } from "../../content/projects";
import { m } from "../../paraglide/messages.js";
import { ProjectCard } from "../ProjectCard";
import { Band } from "../ui/band";

export function ProjectGrid() {
  return (
    <Band id="projects" aria-labelledby="projects-heading">
      <h2 id="projects-heading" className="font-display text-head font-heading">
        {m.home_projects_heading()}
      </h2>
      <p className="mt-4 max-w-lg text-body text-muted">{m.home_projects_intro()}</p>
      <ul className="mt-12 grid overflow-hidden rounded-xl border border-line md:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            // The first picture already stands beside the hero; the card shows the next one.
            picture={project.pictures[1] ?? project.pictures[0]}
            className="border-line max-md:not-first:border-t md:not-first:border-l"
          />
        ))}
      </ul>
    </Band>
  );
}
