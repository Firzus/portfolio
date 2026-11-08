import { useState } from "react";
import type { Picture, Project } from "../../../content";
import { cn } from "../../../lib/utils";
import { href } from "../../types";

/** Screenshots keep their top edge; a wide banner keeps its left side, where its title sits. */
const framing = (picture: Picture) => (picture.width / picture.height > 1.7 ? "object-left" : "object-top");

type LedgerProps = {
  id: string;
  heading: string;
  intro?: string;
  projects: Project[];
};

/**
 * The quiet ledger: one row per project, and beside the column the screen of the row being
 * pointed at or focused (the first one at rest). On narrower screens each row carries its own picture.
 */
export function Ledger({ id, heading, intro, projects }: LedgerProps) {
  const [active, setActive] = useState(0);
  const [pointing, setPointing] = useState(false);

  return (
    <section id={id} aria-labelledby={`${id}-titre`} data-slot="ledger" className="scroll-mt-24 px-6 py-30 xl:pl-[22vw]">
      <div className="xl:grid xl:grid-cols-[minmax(0,35rem)_minmax(0,1fr)] xl:gap-x-16">
        <div className="xl:contents">
          <h2 id={`${id}-titre`} data-reveal className="font-display text-head font-bold xl:col-start-1">
            {heading}
          </h2>
          {intro && (
            <p data-reveal className="mt-6 max-w-[38ch] text-lead xl:col-start-1">
              {intro}
            </p>
          )}
          <ul
            data-slot="ledger-list"
            data-state={pointing ? "pointing" : "rest"}
            className="mt-10 flex flex-col gap-10 xl:col-start-1 xl:gap-2"
            onMouseLeave={() => setPointing(false)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPointing(false);
            }}
          >
            {projects.map((project, i) => {
              const picture = project.pictures[0];
              return (
                <li key={project.slug} data-slot="ledger-row" data-active={i === active ? "" : undefined} data-reveal>
                  <a
                    href={href("b", project.slug)}
                    onMouseEnter={() => {
                      setActive(i);
                      setPointing(true);
                    }}
                    onFocus={() => {
                      setActive(i);
                      setPointing(true);
                    }}
                    className="group grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-1 py-4 xl:grid-cols-[minmax(0,1fr)_11.5rem_5.5rem] xl:items-baseline"
                  >
                    <img
                      src={picture.src}
                      alt=""
                      width={picture.width}
                      height={picture.height}
                      loading="lazy"
                      className={cn("col-span-full mb-5 aspect-[16/10] w-full bg-surface object-cover xl:hidden", framing(picture))}
                    />
                    <span className="font-display text-head font-bold decoration-2 underline-offset-6 group-hover:underline">
                      {project.name}
                    </span>
                    <span className="hidden text-small xl:block">{project.kind}</span>
                    <span className="text-right text-body whitespace-nowrap tabular-nums">
                      {project.year}
                      <span
                        aria-hidden
                        className="ml-3 inline-block transition-transform duration-150 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transition-none"
                      >
                        →
                      </span>
                    </span>
                    <span className="col-span-full text-small xl:hidden">{project.kind}</span>
                    <span className="col-span-full mt-2 max-w-[46ch] text-body xl:col-span-2">{project.summary}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div
          data-reveal
          className={cn(
            "relative hidden aspect-[4/3] self-start bg-surface xl:col-start-2 xl:mt-10 xl:block",
            intro ? "xl:row-start-3" : "xl:row-start-2",
          )}
        >
          {projects.map((project, i) => {
            const picture = project.pictures[0];
            return (
              <figure
                key={project.slug}
                data-state={i === active ? "active" : "idle"}
                aria-hidden={i === active ? undefined : true}
                className="absolute inset-0 opacity-0 transition-opacity duration-300 ease-out data-[state=active]:opacity-100 motion-reduce:transition-none"
              >
                <img
                  src={picture.src}
                  alt={picture.alt}
                  width={picture.width}
                  height={picture.height}
                  loading="lazy"
                  className={cn("size-full object-cover", framing(picture))}
                />
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
