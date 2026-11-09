import { ArrowLeft, ArrowRight, ArrowUpRight } from "iconoir-react";
import { contact } from "../content/contact";
import { projects, type Picture, type Project } from "../content/projects";
import { gutter } from "../lib/layout";
import { cn } from "../lib/utils";
import { m } from "../paraglide/messages.js";
import { localizeHref } from "../paraglide/runtime.js";
import { ProjectCard } from "./ProjectCard";
import { Band } from "./ui/band";
import { Chip } from "./ui/chip";
import { LinkButton } from "./ui/link-button";
import { ProvisionalMark } from "./ui/provisional-mark";
import { RowLink } from "./ui/row-link";
import { Thumbnail } from "./ui/thumbnail";

const sectionHeading = "font-display text-head font-heading";

/** A project's case study: what it is, Lilian's role, what was built, pictures and links. */
export function ProjectPage({ project }: { project: Project }) {
  const [lead, ...pictures] = project.pictures;
  return (
    <main>
      <ProjectHero project={project} picture={lead} />

      <Band aria-labelledby="context-heading">
        <div className="grid gap-8 lg:grid-cols-5 lg:gap-16">
          <h2 id="context-heading" className={cn(sectionHeading, "lg:col-span-2")}>
            {m.project_context_heading()}
          </h2>
          <div className="flex max-w-2xl flex-col gap-5 text-body text-muted lg:col-span-3">
            {project.context.map((paragraph) => (
              <p key={paragraph()}>{paragraph()}</p>
            ))}
          </div>
        </div>
      </Band>

      <Band aria-labelledby="role-heading">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-2">
            <h2 id="role-heading" className={sectionHeading}>
              {m.project_role_heading()}
            </h2>
            <p className="mt-5 max-w-md text-body text-muted">{project.role()}</p>
            <ul className="mt-6 flex flex-wrap gap-1.5">
              {project.stack.map((name) => (
                <li key={name}>
                  <Chip>{name}</Chip>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-3">
            <h2 id="built-heading" className="font-display text-title font-heading">
              {m.project_built_heading()}
            </h2>
            <ul aria-labelledby="built-heading" className="mt-5 border-t border-line">
              {project.built.map((item) => (
                <li key={item()} className="border-b border-line py-3.5 text-body">
                  {item()}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Band>

      {pictures.length > 0 && (
        <Band aria-labelledby="pictures-heading">
          <h2 id="pictures-heading" className={sectionHeading}>
            {m.project_pictures_heading()}
          </h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {pictures.map((picture) => (
              <li key={picture.src} className="md:odd:last:col-span-2">
                <ProjectFigure picture={picture} />
              </li>
            ))}
          </ul>
        </Band>
      )}

      {project.code && (
        <Band aria-labelledby="code-heading">
          <div className="grid gap-8 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-2">
              <h2 id="code-heading" className={sectionHeading}>
                {m.project_code_heading()}
              </h2>
              <p className="mt-5 max-w-md text-body text-muted">{project.code.intro()}</p>
            </div>
            <figure className="min-w-0 overflow-hidden rounded-lg border border-line bg-surface lg:col-span-3">
              <figcaption className="border-b border-line px-4 py-2.5 text-caption text-muted">
                {project.code.fileName}
              </figcaption>
              <pre className="overflow-x-auto p-4 text-caption leading-relaxed">
                <code className="font-mono">{project.code.source}</code>
              </pre>
            </figure>
          </div>
        </Band>
      )}

      <Band aria-labelledby="links-heading">
        <div className="grid gap-8 lg:grid-cols-5 lg:gap-16">
          <h2 id="links-heading" className={cn(sectionHeading, "lg:col-span-2")}>
            {m.project_links_heading()}
          </h2>
          <ul className="border-t border-line lg:col-span-3">
            {project.links.map((link) => (
              <li key={link.href}>
                <RowLink href={link.href}>
                  <span className="w-20 shrink-0 text-caption text-muted">{link.type()}</span>
                  <span className="flex-1">{link.label()}</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 text-muted group-hover:text-accent"
                  />
                </RowLink>
              </li>
            ))}
            <li>
              <RowLink href={contact.email}>
                <span className="w-20 shrink-0 text-caption text-muted">{m.contact_email()}</span>
                <span className="flex-1">{m.project_contact_row()}</span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 text-muted group-hover:text-accent"
                />
              </RowLink>
            </li>
          </ul>
        </div>
      </Band>

      <Band aria-labelledby="others-heading">
        <h2 id="others-heading" className={sectionHeading}>
          {m.project_others_heading()}
        </h2>
        <ul className="mt-12 grid overflow-hidden rounded-xl border border-line md:grid-cols-2">
          {projects
            .filter((other) => other.slug !== project.slug)
            .map((other) => (
              <ProjectCard
                key={other.slug}
                project={other}
                picture={other.pictures[0]}
                className="border-line max-md:not-first:border-t md:not-first:border-l"
              />
            ))}
        </ul>
      </Band>
    </main>
  );
}

function ProjectHero({ project, picture }: { project: Project; picture?: Picture }) {
  const [primary] = project.links;
  return (
    <section className="grid border-b border-line lg:grid-cols-5">
      <div className={cn(gutter, "flex flex-col justify-center py-14 md:py-20 lg:col-span-3")}>
        <h1 className="font-display text-display font-heading">{project.name}</h1>
        <p className="mt-5 text-small text-muted">
          {project.kind()} · {project.period()}
        </p>
        <p className="mt-6 max-w-md text-lead">{project.summary()}</p>
        {project.signature && (
          <p lang="en" className="mt-4 text-body font-medium text-accent">
            {project.signature}
          </p>
        )}
        <div className="mt-9 flex flex-wrap gap-2.5">
          {primary && (
            <LinkButton href={primary.href}>
              {primary.label()}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </LinkButton>
          )}
          <LinkButton href={`${localizeHref("/")}#projects`} variant="outline">
            <ArrowLeft aria-hidden="true" className="size-4" />
            {m.project_all_link()}
          </LinkButton>
        </div>
        <dl className="mt-12 grid max-w-md grid-cols-2 gap-4 md:gap-8">
          {project.stats.map((stat) => (
            <div key={stat.label()} className="flex flex-col-reverse justify-end gap-2">
              <dt className="text-caption text-muted">{stat.label()}</dt>
              <dd className="text-lead font-medium tracking-tight tabular-nums md:text-title">
                {stat.value()}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      {picture && (
        <div className="flex items-center border-line bg-deep p-6 max-lg:border-t md:px-8 md:py-12 lg:col-span-2 lg:border-l lg:px-11">
          <ProjectFigure picture={picture} eager className="w-full" />
        </div>
      )}
    </section>
  );
}

interface ProjectFigureProps {
  picture: Picture;
  /** Loads at once, for the picture seen when the page opens. */
  eager?: boolean;
  className?: string;
}

function ProjectFigure({ picture, eager = false, className }: ProjectFigureProps) {
  return (
    <figure className={className}>
      <Thumbnail
        src={picture.src}
        alt={picture.alt()}
        width={picture.width}
        height={picture.height}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
      />
      {picture.provisional && (
        <figcaption className="mt-2">
          <ProvisionalMark className="ml-0" />
        </figcaption>
      )}
    </figure>
  );
}
