import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { useState } from "react";
import { cn } from "../../../lib/utils";
import { href } from "../../types";
import { categoryOf, chronological, framesBySlug, type Category } from "../frames";
import { FrameView } from "./FrameView";

type Filter = "tout" | Category;

const filters: { value: Filter; label: string }[] = [
  { value: "tout", label: "Tout" },
  { value: "jeux", label: "Jeux" },
  { value: "outils", label: "Outils" },
];

// Each strip ends inside the grid instead of running past the edge, so it keeps only as many
// frames as fit at a readable size: six on a phone (two rows), four, five, then seven.
const fitClass = (index: number) =>
  index >= 6 ? "max-xl:hidden" : index >= 5 ? "md:max-xl:hidden" : index >= 4 ? "md:max-lg:hidden" : "";

/**
 * The work section: one strip of frames per project, oldest first, with a rail holding the
 * section name, the filter and the summary of the strip being pointed at.
 */
export function WorkSheet() {
  const [filter, setFilter] = useState<Filter>("tout");
  const [pointed, setPointed] = useState<string | null>(null);
  const shown = (slug: string) => filter === "tout" || categoryOf[slug] === filter;
  const preview = chronological.find((p) => p.slug === pointed) ?? chronological.find((p) => shown(p.slug));

  return (
    <section
      id="projets"
      aria-labelledby="c-work-title"
      data-slot="work-sheet"
      className="grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-6 px-5 lg:grid-cols-[minmax(10rem,13%)_minmax(0,1fr)]"
    >
      <div data-slot="rail" className="flex items-baseline justify-between gap-4 lg:sticky lg:top-6 lg:flex-col lg:justify-start lg:self-start">
        <h2 id="c-work-title" className="text-lead font-normal">
          Projets
        </h2>
        <ToggleGroup
          data-slot="work-filter"
          aria-label="Filtrer les projets"
          value={[filter]}
          onValueChange={(value) => value[0] && setFilter(value[0] as Filter)}
          className="c-needs-js flex gap-4 lg:mt-3 lg:flex-col lg:gap-1"
        >
          {filters.map((f) => (
            <Toggle
              key={f.value}
              value={f.value}
              className="cursor-pointer py-1 text-left text-body text-muted transition-colors duration-150 hover:text-ink data-[pressed]:font-semibold data-[pressed]:text-ink"
            >
              {f.label}
            </Toggle>
          ))}
        </ToggleGroup>
        {preview && (
          <p aria-hidden="true" key={preview.slug} className="c-fade-in mt-8 text-body max-lg:hidden">
            {preview.summary}
          </p>
        )}
      </div>

      <ol data-slot="strips" className="c-strips flex min-w-0 flex-col gap-11" onPointerLeave={() => setPointed(null)}>
        {chronological.map((project) => (
          <li
            key={project.slug}
            data-slot="strip"
            data-state={shown(project.slug) ? "shown" : "dimmed"}
            className="group/strip relative"
            onPointerEnter={() => setPointed(project.slug)}
            onFocus={() => setPointed(project.slug)}
          >
            <div
              data-slot="frames"
              className="grid grid-cols-3 gap-2 transition-opacity duration-[240ms] group-data-[state=dimmed]/strip:opacity-25 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7"
            >
              {framesBySlug[project.slug].slice(0, 7).map((frame, index) => (
                <FrameView
                  key={frame.id}
                  data-reveal=""
                  frame={frame}
                  boxAspect={1.25}
                  decorative={index > 0}
                  eager={project === chronological[0]}
                  drift={project.slug === "lysandra" && index === 0}
                  className={cn("h-22 md:h-36 lg:h-32 xl:h-36", fitClass(index))}
                />
              ))}
            </div>
            <div className="mt-2 grid grid-cols-[1fr_auto] items-baseline gap-4 text-small md:grid-cols-3">
              <a
                href={href("c", project.slug)}
                className="font-semibold text-ink underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus"
              >
                {project.name}
              </a>
              <span className="text-center text-muted max-md:hidden">{project.kind}</span>
              <span className="text-right text-muted">{project.year}</span>
            </div>
            <p className="mt-1 text-body lg:sr-only">{project.summary}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
