import { createFileRoute } from "@tanstack/react-router";

/**
 * Dynamic robots.txt with an absolute sitemap URL derived from the request
 * origin. Replaces the static `public/robots.txt` at runtime.
 */
async function handle({ request }: { request: Request }): Promise<Response> {
  const origin = new URL(request.url).origin;
  const body = [
    "# https://www.robotstxt.org/robotstxt.html",
    "User-agent: *",
    "Allow: /",
    "Disallow: /keystatic/",
    "Disallow: /api/",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600",
    },
  });
}

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: handle,
    },
  },
});
