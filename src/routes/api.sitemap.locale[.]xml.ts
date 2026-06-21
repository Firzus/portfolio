import { createFileRoute } from "@tanstack/react-router";

import { buildLocaleSitemap } from "#/lib/content/sitemap";
import { resolveLocale } from "#/lib/i18n";

/**
 * Per-locale urlset at `/api/sitemap/locale.xml?locale=`. Locale is chosen
 * via query param (same pattern as the RSS feed) so we avoid dynamic path
 * segments with file extensions.
 */
async function handle({ request }: { request: Request }): Promise<Response> {
  const url = new URL(request.url);
  const locale = resolveLocale(url.searchParams.get("locale"));
  const xml = await buildLocaleSitemap(url.origin, locale);

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600",
    },
  });
}

export const Route = createFileRoute("/api/sitemap/locale.xml")({
  server: {
    handlers: {
      GET: handle,
    },
  },
});
