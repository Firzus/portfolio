import { listPostSlugs } from "#/lib/content/posts";
import { listProjectSlugs } from "#/lib/content/projects";
import { locales, localizeUrl, type Locale } from "#/paraglide/runtime";

const STATIC_PATHS = ["/", "/contact", "/blog"] as const;

export interface SitemapUrl {
  loc: string;
  /** ISO 8601 date (YYYY-MM-DD) when known. */
  lastmod?: string;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function localizedLoc(origin: string, pathname: string, locale: Locale): string {
  return localizeUrl(new URL(pathname, origin), { locale }).href;
}

/**
 * Build a sitemap index document listing one child sitemap per locale.
 * Each child URL is `/sitemap-{locale}.xml` on the same origin.
 */
export function buildSitemapIndex(origin: string): string {
  const entries = locales
    .map(
      (locale) =>
        `  <sitemap>\n    <loc>${escapeXml(`${origin}/api/sitemap/locale.xml?locale=${locale}`)}</loc>\n  </sitemap>`,
    )
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    "</sitemapindex>",
    "",
  ].join("\n");
}

/**
 * Build a locale-specific urlset sitemap. Includes static routes plus every
 * project and blog post slug (canonical `en` slug set, localized URLs).
 */
export async function buildLocaleSitemap(origin: string, locale: Locale): Promise<string> {
  const [projectSlugs, postSlugs] = await Promise.all([listProjectSlugs(), listPostSlugs()]);

  const urls: SitemapUrl[] = [
    ...STATIC_PATHS.map((pathname) => ({ loc: localizedLoc(origin, pathname, locale) })),
    ...projectSlugs.map((slug) => ({
      loc: localizedLoc(origin, `/projects/${slug}`, locale),
    })),
    ...postSlugs.map((slug) => ({
      loc: localizedLoc(origin, `/blog/${slug}`, locale),
    })),
  ];

  const body = urls
    .map((url) => {
      const lastmod = url.lastmod ? `\n    <lastmod>${escapeXml(url.lastmod)}</lastmod>` : "";
      return `  <url>\n    <loc>${escapeXml(url.loc)}</loc>${lastmod}\n  </url>`;
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    "</urlset>",
    "",
  ].join("\n");
}
