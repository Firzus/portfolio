import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "#/components/site-header";
import { Badge } from "#/components/ui/badge";
import { getPosts } from "#/lib/content/server";
import { formatDate } from "#/lib/format-date";
import { buildPageHead } from "#/lib/seo/meta";
import { collectionPageJsonLd } from "#/lib/structured-data";
import { getLocale, localizeHref } from "#/paraglide/runtime";
import * as m from "#/paraglide/messages";

export const Route = createFileRoute("/blog/")({
  head: () => {
    const title = `${m.blog_title()} — ${m.meta_title()}`;
    const description = m.blog_meta_description();
    const page = buildPageHead({ title, description, pathname: "/blog" });
    return {
      meta: [
        ...page.meta,
        {
          "script:ld+json": collectionPageJsonLd(getLocale(), "/blog", m.blog_title(), description),
        },
      ],
      links: [
        ...page.links,
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: `${m.blog_title()} — ${m.nav_brand()}`,
          href: `/api/blog/rss.xml?locale=${getLocale()}`,
        },
      ],
    };
  },
  loader: () => getPosts({ data: { locale: getLocale() } }),
  component: BlogIndex,
});

function BlogIndex() {
  const posts = Route.useLoaderData();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              {m.blog_title()}
            </h1>
            <p className="max-w-2xl text-pretty text-muted-foreground">{m.blog_subtitle()}</p>
          </div>

          {posts.length === 0 ? (
            <p className="mt-12 rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
              {m.blog_empty()}
            </p>
          ) : (
            <ul className="mt-12 flex flex-col gap-8">
              {posts.map((post) => (
                <li key={post.slug}>
                  <article className="group flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <time dateTime={post.frontmatter.publishedDate}>
                        {formatDate(post.frontmatter.publishedDate)}
                      </time>
                      {post.frontmatter.tags.length > 0 && (
                        <ul className="flex flex-wrap gap-1.5">
                          {post.frontmatter.tags.map((tag) => (
                            <li key={tag}>
                              <Badge variant="muted">{tag}</Badge>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      <a
                        href={localizeHref(`/blog/${post.slug}`)}
                        className="transition-colors hover:text-accent-gold"
                      >
                        {post.frontmatter.title}
                      </a>
                    </h2>
                    <p className="text-pretty text-muted-foreground">{post.frontmatter.summary}</p>
                    <a
                      href={localizeHref(`/blog/${post.slug}`)}
                      className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-accent-gold"
                    >
                      {m.blog_read_more()}
                    </a>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
