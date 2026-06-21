import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";

import { ProjectBody } from "#/components/project-body";
import { SiteHeader } from "#/components/site-header";
import { Badge } from "#/components/ui/badge";
import { notFoundHead } from "#/components/not-found-page";
import { categoryLabel } from "#/lib/categories";
import { getProject } from "#/lib/content/server";
import { buildPageHead } from "#/lib/seo/meta";
import { projectJsonLd } from "#/lib/structured-data";
import { getLocale, localizeHref } from "#/paraglide/runtime";
import * as m from "#/paraglide/messages";

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ params }) => {
    const project = await getProject({ data: { slug: params.slug, locale: getLocale() } });
    if (!project) throw notFound();
    return project;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return notFoundHead();
    const title = `${loaderData.frontmatter.title} — ${m.meta_title()}`;
    return buildPageHead({
      title,
      description: loaderData.frontmatter.summary,
      pathname: `/projects/${loaderData.slug}`,
      ogType: "article",
      extraMeta: [
        {
          "script:ld+json": projectJsonLd(
            loaderData.slug,
            loaderData.frontmatter,
            loaderData.locale,
          ),
        },
      ],
    });
  },
  notFoundComponent: ProjectNotFound,
  component: ProjectPage,
});

function ProjectNotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {m.project_not_found_title()}
          </h1>
          <p className="text-pretty text-muted-foreground">{m.project_not_found_body()}</p>
          <a
            href={localizeHref("/#projects")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {m.project_not_found_cta()}
          </a>
        </div>
      </main>
    </div>
  );
}

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

          {frontmatter.decision && (
            <CaseStudySection title={m.case_study_decision()}>
              <p className="text-pretty text-muted-foreground">{frontmatter.decision}</p>
            </CaseStudySection>
          )}

          {frontmatter.outcome && (
            <CaseStudySection title={m.case_study_outcome()}>
              <p className="text-pretty text-muted-foreground">{frontmatter.outcome.summary}</p>
              {frontmatter.outcome.metrics && frontmatter.outcome.metrics.length > 0 && (
                <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {frontmatter.outcome.metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="flex flex-col gap-1 rounded-md border border-border bg-card p-4"
                    >
                      <dt className="text-sm text-muted-foreground">{metric.label}</dt>
                      <dd className="text-2xl font-bold tracking-tight">{metric.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </CaseStudySection>
          )}

          {frontmatter.learnings && frontmatter.learnings.length > 0 && (
            <CaseStudySection title={m.case_study_learnings()}>
              <ul className="flex list-disc flex-col gap-2 pl-5 text-pretty text-muted-foreground">
                {frontmatter.learnings.map((learning) => (
                  <li key={learning}>{learning}</li>
                ))}
              </ul>
            </CaseStudySection>
          )}
        </article>
      </main>
    </div>
  );
}

function CaseStudySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 border-t border-border pt-10">
      <h2 className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
      {children}
    </section>
  );
}
