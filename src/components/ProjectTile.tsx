import { ArrowRight } from "iconoir-react";
import type * as React from "react";
import { projectHref, type Picture, type Project } from "../content/projects";
import { cn } from "../lib/utils";
import { Thumbnail } from "./ui/thumbnail";

interface ProjectTileProps extends React.ComponentProps<"li"> {
  project: Project;
  picture?: Picture;
}

/**
 * A project reduced to its picture and name, for pointing to a project the reader has already met
 * as a full card. The whole tile is clickable, but the link wraps the name only, so its accessible
 * name stays the project's and not the picture's description.
 */
export function ProjectTile({ project, picture, className, ...props }: ProjectTileProps) {
  return (
    <li
      data-project-card
      data-reveal
      className={cn(
        "group relative flex items-center gap-5 p-4 transition-colors hover:bg-ink/5 motion-reduce:transition-none md:p-5",
        className,
      )}
      {...props}
    >
      {picture && (
        <Thumbnail
          src={picture.src}
          alt={picture.alt()}
          width={picture.width}
          height={picture.height}
          data-transition-picture
          className="w-28 shrink-0 rounded-md md:w-36"
        />
      )}
      <a
        href={projectHref(project.slug)}
        className="flex-1 rounded-sm font-display text-title font-heading after:absolute after:inset-0 group-hover:text-accent"
      >
        {project.name}
      </a>
      <ArrowRight
        aria-hidden="true"
        className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
      />
    </li>
  );
}
