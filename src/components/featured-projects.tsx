import { useMemo, useState } from "react";

import { ProjectCard } from "#/components/project-card";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import type { Project } from "#/lib/content/projects";
import { projectCategories, type ProjectCategory } from "#/lib/content/schema";
import { categoryLabel } from "#/lib/categories";
import { cn } from "#/lib/utils";
import { localizeHref } from "#/paraglide/runtime";
import * as m from "#/paraglide/messages";

type Filter = ProjectCategory | "all";

type FeaturedProjectsProps = {
  projects: Project[];
};

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const featured = useMemo(() => projects.filter((p) => p.frontmatter.featured), [projects]);
  const secondary = useMemo(() => projects.filter((p) => !p.frontmatter.featured), [projects]);

  // Only offer filters for categories actually present in the featured set.
  const availableCategories = useMemo(() => {
    const present = new Set(featured.map((p) => p.frontmatter.category));
    return projectCategories.filter((category) => present.has(category));
  }, [featured]);

  const visibleFeatured = useMemo(
    () => (filter === "all" ? featured : featured.filter((p) => p.frontmatter.category === filter)),
    [featured, filter],
  );

  if (featured.length === 0 && secondary.length === 0) return null;

  return (
    <section id="projects" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="flex flex-col gap-3">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          {m.featured_title()}
        </h2>
        <p className="max-w-2xl text-pretty text-muted-foreground">{m.featured_subtitle()}</p>
      </div>

      <div
        role="group"
        aria-label={m.featured_filter_label()}
        className="mt-8 flex flex-wrap gap-2"
      >
        <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
          {m.featured_filter_all()}
        </FilterButton>
        {availableCategories.map((category) => (
          <FilterButton
            key={category}
            active={filter === category}
            onClick={() => setFilter(category)}
          >
            {categoryLabel(category)}
          </FilterButton>
        ))}
      </div>

      {visibleFeatured.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleFeatured.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
          {m.featured_empty()}
        </p>
      )}

      {secondary.length > 0 && (
        <div className="mt-16">
          <h3 className="text-lg font-semibold tracking-tight">{m.featured_secondary_title()}</h3>
          <ul className="mt-4 divide-y divide-border/60 rounded-xl border border-border">
            {secondary.map((project) => (
              <li key={project.slug}>
                <a
                  href={localizeHref(`/projects/${project.slug}`)}
                  className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-accent/50"
                >
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate font-medium">{project.frontmatter.title}</span>
                    <span className="truncate text-sm text-muted-foreground">
                      {project.frontmatter.summary}
                    </span>
                  </span>
                  <Badge variant="muted" className="shrink-0">
                    {categoryLabel(project.frontmatter.category)}
                  </Badge>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      aria-pressed={active}
      className={cn("rounded-full", !active && "text-muted-foreground")}
    >
      {children}
    </Button>
  );
}
