import { listPosts } from "#/lib/content/posts";
import { listProjects } from "#/lib/content/projects";
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
  const href = localizeUrl(new URL(pathname, origin), { locale }).href;
  // Normalize the localized home (`/fr/` → `/fr`); keep the base-locale root
  // (`https://host/`) intact.
  const url = new URL(href);
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }
  return url.href;
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
 * project and blog post that genuinely exists in this locale (no en-fallback
 * duplicates), with `<lastmod>` populated from `publishedDate` when present.
 */
export async function buildLocaleSitemap(origin: string, locale: Locale): Promise<string> {
  const [projects, posts] = await Promise.all([listProjects(locale), listPosts(locale)]);

  const urls: SitemapUrl[] = [
    ...STATIC_PATHS.map((pathname) => ({ loc: localizedLoc(origin, pathname, locale) })),
    ...projects
      .filter((project) => project.availableLocales.includes(locale))
      .map((project) => ({
        loc: localizedLoc(origin, `/projects/${project.slug}`, locale),
        lastmod: project.frontmatter.publishedDate,
      })),
    ...posts
      .filter((post) => post.availableLocales.includes(locale))
      .map((post) => ({
        loc: localizedLoc(origin, `/blog/${post.slug}`, locale),
        lastmod: post.frontmatter.publishedDate,
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
