import { ArrowRight } from "iconoir-react";
import type * as React from "react";
import { projectHref, type Picture, type Project } from "../content/projects";
import { cn } from "../lib/utils";
import { m } from "../paraglide/messages.js";
import { Chip } from "./ui/chip";
import { Thumbnail } from "./ui/thumbnail";

interface ProjectCardProps extends React.ComponentProps<"li"> {
  project: Project;
  picture?: Picture;
}

/** A project in a list of cards: picture, name, summary, facts and the link to its page. */
export function ProjectCard({ project, picture, className, ...props }: ProjectCardProps) {
  return (
    <li data-project-card className={cn("flex flex-col gap-4 p-6", className)} {...props}>
      {picture && (
        <Thumbnail
          src={picture.src}
          alt={picture.alt()}
          width={picture.width}
          height={picture.height}
          data-transition-picture
        />
      )}
      <h3 className="mt-2 font-display text-title font-heading">{project.name}</h3>
      <p className="-mt-2 text-body text-muted">{project.summary()}</p>
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
}
