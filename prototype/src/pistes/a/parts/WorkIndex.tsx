import { useState, type ReactNode } from "react";
import { projects, type Project } from "../../../content";
import { cn } from "../../../lib/utils";
import { href } from "../../types";
import { frame } from "./frame";
import { AtelierUi } from "./AtelierUi";

/** The large picture of each project in the work index, cropped for a near-square stage. */
function StagePicture({ project, className }: { project: Project; className?: string }): ReactNode {
  if (project.slug === "atelier") return <AtelierUi className={className} />;
  const picture = project.pictures[0];
  // Lysandra has a single screenshot, already shown whole in the hero: here it is framed on the heroine.
  const position = project.slug === "lysandra" ? "object-[85%_50%] scale-[1.7] origin-[86%_78%]" : "object-[62%_50%]";
  return (
    <img
      src={picture.src}
      alt={picture.alt}
      width={picture.width}
      height={picture.height}
      loading="lazy"
      className={cn("size-full object-cover", position, className)}
    />
  );
}

/**
 * Small index, large picture. Pointing at or focusing a row pins that project's screen in the
 * frame; without JavaScript the first one stays shown and every row is still a plain link.
 */
export function WorkIndex() {
  const [active, setActive] = useState(0);
  return (
    <section id="projets" data-slot="work" aria-labelledby="a-work-title" className="a-work">
      <div className={cn(frame, "flex flex-col justify-between gap-12 py-6 lg:py-8")}>
        <h2 id="a-work-title" data-reveal className="max-w-[8ch] font-display text-head">
          Jeux et outils
        </h2>
        <ul className="flex flex-col gap-10 lg:gap-6">
          {projects.map((project, i) => (
            <li
              key={project.slug}
              data-slot="work-row"
              data-state={i === active ? "active" : "inactive"}
              data-reveal
              className="group"
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
            >
              <div className="a-ratio-screen mb-4 overflow-hidden lg:hidden">
                <StagePicture project={project} />
              </div>
              <a
                href={href("a", project.slug)}
                className="flex flex-wrap items-baseline justify-between gap-x-4 text-muted transition-colors duration-150 group-data-[state=active]:text-ink hover:text-ink motion-reduce:transition-none"
              >
                <span className="text-lead font-extrabold underline decoration-transparent decoration-2 underline-offset-4 group-data-[state=active]:decoration-ink">
                  {project.name}
                </span>
                <span className="text-small font-medium">
                  {project.kind}, {project.year}
                </span>
              </a>
              <p className="mt-1 max-w-[46ch] text-body">{project.summary}</p>
            </li>
          ))}
        </ul>
      </div>
      <div data-slot="work-stage" className="relative hidden overflow-hidden bg-ink lg:mr-8 lg:block">
        {projects.map((project, i) => (
          <div
            key={project.slug}
            data-slot="work-picture"
            data-state={i === active ? "active" : "inactive"}
            aria-hidden={i !== active}
          >
            <StagePicture project={project} />
          </div>
        ))}
      </div>
    </section>
  );
}
