import { createFileRoute } from "@tanstack/react-router";

import { listPosts } from "#/lib/content/posts";
import { buildRssFeed } from "#/lib/content/rss";
import { resolveLocale } from "#/lib/i18n";
import { localizeUrl } from "#/paraglide/runtime";

/**
 * RSS 2.0 feed for the blog. Lives under `/api/` so it is excluded from the
 * i18n route middleware (no locale prefix / redirect). The served locale is
 * chosen via the `?locale=` query param, defaulting to `en`. Post links are
 * localized so each item points at the right localized page.
 */
async function handle({ request }: { request: Request }): Promise<Response> {
  const url = new URL(request.url);
  const locale = resolveLocale(url.searchParams.get("locale"));
  const posts = await listPosts(locale);

  const origin = url.origin;
  const blogUrl = localizeUrl(new URL("/blog", origin), { locale }).href.replace(/\/$/, "");

  const xml = buildRssFeed(
    {
      title: "Firzus — Blog",
      description: "Posts on agentic / AI workflows and modern web engineering.",
      siteUrl: origin,
      feedUrl: url.href,
      blogUrl,
    },
    posts,
  );

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600",
    },
  });
}

export const Route = createFileRoute("/api/blog/rss.xml")({
  server: {
    handlers: {
      GET: handle,
    },
  },
});
