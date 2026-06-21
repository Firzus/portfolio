import { ArrowUpRight, ExternalLink, Github } from "lucide-react";

import { Badge } from "#/components/ui/badge";
import type { Project } from "#/lib/content/projects";
import { cn } from "#/lib/utils";
import { categoryLabel } from "#/lib/categories";
import { localizeHref } from "#/paraglide/runtime";
import * as m from "#/paraglide/messages";

type ProjectCardProps = {
  project: Project;
  className?: string;
};

export function ProjectCard({ project, className }: ProjectCardProps) {
  const { slug, frontmatter } = project;
  const caseStudyHref = localizeHref(`/projects/${slug}`);

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <Badge variant="muted">{categoryLabel(frontmatter.category)}</Badge>
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold tracking-tight">
          {/* Stretched link makes the whole card navigate to the case study. */}
          <a href={caseStudyHref} className="outline-none after:absolute after:inset-0">
            <span className="sr-only">{m.project_view_case_study()} — </span>
            {frontmatter.title}
          </a>
        </h3>
        <p className="text-sm text-muted-foreground">{frontmatter.role}</p>
      </div>

      <p className="text-pretty text-sm text-muted-foreground">{frontmatter.summary}</p>

      <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
        {frontmatter.stack.map((tech) => (
          <li key={tech}>
            <Badge variant="outline">{tech}</Badge>
          </li>
        ))}
      </ul>

      {(frontmatter.liveUrl || frontmatter.repoUrl) && (
        <div className="relative z-10 flex flex-wrap items-center gap-4 border-t border-border/60 pt-4 text-sm">
          {frontmatter.liveUrl && (
            <a
              href={frontmatter.liveUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <ExternalLink className="size-4" />
              {m.project_live()}
            </a>
          )}
          {frontmatter.repoUrl && (
            <a
              href={frontmatter.repoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <Github className="size-4" />
              {m.project_repo()}
            </a>
          )}
        </div>
      )}
    </article>
  );
}
