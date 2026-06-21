import { createFileRoute } from "@tanstack/react-router";

import { buildSitemapIndex } from "#/lib/content/sitemap";

/**
 * Sitemap index at `/sitemap.xml`. Lists one child sitemap per locale
 * (`/sitemap-{locale}.xml`). Excluded from i18n middleware.
 */
async function handle({ request }: { request: Request }): Promise<Response> {
  const origin = new URL(request.url).origin;
  const xml = buildSitemapIndex(origin);

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600",
    },
  });
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: handle,
    },
  },
});
