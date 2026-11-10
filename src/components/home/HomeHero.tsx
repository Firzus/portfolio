import { contact } from "../../content/contact";
import { projects, projectHref } from "../../content/projects";
import { gutter } from "../../lib/layout";
import { cn } from "../../lib/utils";
import { m } from "../../paraglide/messages.js";
import { ShaderLayer, useHover } from "../motion/shaders/ShaderLayer";
import { LinkButton } from "../ui/link-button";
import { GithubActivity } from "./GithubActivity";

export function HomeHero() {
  return (
    <section className="grid border-b border-line lg:grid-cols-5">
      <div className={cn(gutter, "flex flex-col justify-center py-16 md:py-24 lg:col-span-3")}>
        {/* The name stays in the header; the heading still carries it for screen readers. */}
        <h1 className="font-display text-display font-heading">
          <span className="sr-only">Lilian PRIEU, </span>
          {m.job_title()}
        </h1>
        <p className="mt-7 max-w-md text-lead">{m.home_hero_lead()}</p>
        <div className="mt-9 flex flex-wrap gap-2.5">
          <LinkButton href="#projects">{m.home_hero_projects_cta()}</LinkButton>
          <LinkButton href={contact.email} variant="outline">
            {m.home_hero_contact_cta()}
          </LinkButton>
        </div>
        <GithubActivity />
      </div>
      <HeroPictures />
    </section>
  );
}

/** One picture per project beside the title, each opening its page, over a liquid shader. */
function HeroPictures() {
  const { hover, bind } = useHover();
  return (
    <div
      {...bind}
      className="relative isolate grid content-center border-line p-6 max-lg:border-t md:px-8 md:py-12 lg:col-span-2 lg:border-l lg:px-11 lg:py-16"
    >
      <ShaderLayer scene="hero" hover={hover} className="-z-10" />
      <ul className="grid grid-cols-2 gap-3">
        {projects.map((project, index) => {
          const picture = project.pictures[0];
          if (!picture) return null;
          const first = index === 0;
          return (
            <li key={project.slug} className={first ? "col-span-2 aspect-picture" : "aspect-tile"}>
              <a
                href={projectHref(project.slug)}
                className="relative block size-full overflow-hidden rounded-lg"
              >
                {/* Decorative here: the label below names the link and its project. */}
                <img
                  src={picture.src}
                  alt=""
                  width={picture.width}
                  height={picture.height}
                  loading={first ? "eager" : "lazy"}
                  fetchPriority={first ? "high" : "auto"}
                  data-transition-picture
                  className="size-full object-cover"
                />
                <span className="absolute bottom-2.5 left-2.5 max-w-full truncate rounded-md bg-field/85 px-2 py-1 text-caption font-medium max-sm:right-2.5">
                  {project.name}{" "}
                  <span className="hidden text-muted sm:inline">· {project.kind()}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
