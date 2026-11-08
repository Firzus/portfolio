import { contact } from "../../content/contact";
import { projects, projectHref } from "../../content/projects";
import { gutter } from "../../lib/layout";
import { cn } from "../../lib/utils";
import { m } from "../../paraglide/messages.js";
import { LinkButton } from "../ui/link-button";
import { ProvisionalMark } from "../ui/provisional-mark";

export function HomeHero() {
  const stats = [
    { value: String(projects.length), label: m.home_stat_projects() },
    { value: m.home_stat_huzounet_value(), label: m.home_stat_huzounet() },
    { value: "MIT", label: m.home_stat_atelier() },
  ];

  return (
    <section className="grid border-b border-line lg:grid-cols-5">
      <div className={cn(gutter, "flex flex-col justify-center py-16 md:py-24 lg:col-span-3")}>
        {/* The name stays in the header; the heading still carries it for screen readers. */}
        <h1 className="font-display text-display font-heading">
          <span className="sr-only">Lilian PRIEU, </span>
          {m.job_title()}
        </h1>
        <p className="mt-7 max-w-md text-lead">
          {m.home_hero_lead()}
          <ProvisionalMark />
        </p>
        <div className="mt-9 flex flex-wrap gap-2.5">
          <LinkButton href="#projects">{m.home_hero_projects_cta()}</LinkButton>
          <LinkButton href={contact.email} variant="outline">
            {m.home_hero_contact_cta()}
          </LinkButton>
        </div>
        <dl className="mt-14 grid max-w-xl grid-cols-3 gap-4 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse justify-end gap-2">
              <dt className="text-caption text-muted">{stat.label}</dt>
              <dd className="text-lead font-medium tracking-tight tabular-nums md:text-title">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <HeroPictures />
    </section>
  );
}

/** One picture per project beside the title, each opening its page. */
function HeroPictures() {
  return (
    <ul className="grid grid-cols-2 content-center gap-3 border-line bg-deep p-6 max-lg:border-t md:px-8 md:py-12 lg:col-span-2 lg:border-l lg:px-11 lg:py-16">
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
              {/* The label below names the link; the project cards describe the pictures. */}
              <img
                src={picture.src}
                alt=""
                width={picture.width}
                height={picture.height}
                loading={first ? "eager" : "lazy"}
                fetchPriority={first ? "high" : "auto"}
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
  );
}
