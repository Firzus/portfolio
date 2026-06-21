import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";

import { ProjectBody } from "#/components/project-body";
import { SiteHeader } from "#/components/site-header";
import { Badge } from "#/components/ui/badge";
import { categoryLabel } from "#/lib/categories";
import { getProject } from "#/lib/content/server";
import { getLocale, localizeHref } from "#/paraglide/runtime";
import * as m from "#/paraglide/messages";

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ params }) => {
    const project = await getProject({ data: { slug: params.slug, locale: getLocale() } });
    if (!project) throw notFound();
    return project;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData ? `${loaderData.frontmatter.title} — ${m.meta_title()}` : m.meta_title(),
      },
      { name: "description", content: loaderData?.frontmatter.summary ?? m.meta_description() },
    ],
  }),
  component: ProjectPage,
});

function ProjectPage() {
  const project = Route.useLoaderData();
  const { frontmatter, body } = project;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <a
            href={localizeHref("/#projects")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {m.nav_projects()}
          </a>

          <header className="mt-8 flex flex-col gap-4">
            <Badge variant="muted" className="w-fit">
              {categoryLabel(frontmatter.category)}
            </Badge>
            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              {frontmatter.title}
            </h1>
            <p className="text-lg text-muted-foreground">{frontmatter.role}</p>
            <p className="text-pretty text-muted-foreground">{frontmatter.summary}</p>

            <ul className="flex flex-wrap gap-1.5">
              {frontmatter.stack.map((tech) => (
                <li key={tech}>
                  <Badge variant="outline">{tech}</Badge>
                </li>
              ))}
            </ul>

            {(frontmatter.liveUrl || frontmatter.repoUrl) && (
              <div className="flex flex-wrap items-center gap-4 pt-2 text-sm">
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
          </header>

          <ProjectBody body={body} />
        </article>
      </main>
    </div>
  );
}
