import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { PostBody } from "#/components/post-body";
import { SiteHeader } from "#/components/site-header";
import { Badge } from "#/components/ui/badge";
import { getPost } from "#/lib/content/server";
import { formatDate } from "#/lib/format-date";
import { getLocale, localizeHref } from "#/paraglide/runtime";
import * as m from "#/paraglide/messages";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getPost({ data: { slug: params.slug, locale: getLocale() } });
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData ? `${loaderData.frontmatter.title} — ${m.meta_title()}` : m.meta_title(),
      },
      { name: "description", content: loaderData?.frontmatter.summary ?? m.meta_description() },
    ],
  }),
  component: PostPage,
});

function PostPage() {
  const post = Route.useLoaderData();
  const { frontmatter, body } = post;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <a
            href={localizeHref("/blog")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {m.nav_blog()}
          </a>

          <header className="mt-8 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <time dateTime={frontmatter.publishedDate}>
                {formatDate(frontmatter.publishedDate)}
              </time>
              {frontmatter.tags.length > 0 && (
                <ul className="flex flex-wrap gap-1.5">
                  {frontmatter.tags.map((tag) => (
                    <li key={tag}>
                      <Badge variant="muted">{tag}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              {frontmatter.title}
            </h1>
            <p className="text-pretty text-lg text-muted-foreground">{frontmatter.summary}</p>
          </header>

          <PostBody body={body} />
        </article>
      </main>
    </div>
  );
}
