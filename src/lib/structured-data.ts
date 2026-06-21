import { siteConfig } from "#/lib/site-config";
import type { ProjectFrontmatter } from "#/lib/content/schema";
import { getUrlOrigin, type Locale, localizeUrl } from "#/paraglide/runtime";

/**
 * Minimal schema.org `CreativeWork` shape. We keep it as a plain object so it
 * can be serialized into a `<script type="application/ld+json">` tag via the
 * route `head` (TanStack Router renders a `script:ld+json` meta entry).
 */
export interface CreativeWorkJsonLd {
  "@context": "https://schema.org";
  "@type": "CreativeWork";
  name: string;
  description: string;
  url: string;
  author: { "@type": "Person"; name: string; url: string };
  genre: string;
  keywords: string;
  datePublished?: string;
  sameAs?: string[];
}

/**
 * Build a `CreativeWork` JSON-LD object for a project case study. The canonical
 * URL is localized so each locale advertises its own absolute URL. Returns a
 * plain object; callers serialize it as `{ "script:ld+json": jsonLd }`.
 */
export function projectJsonLd(
  slug: string,
  frontmatter: ProjectFrontmatter,
  locale: Locale,
): CreativeWorkJsonLd {
  const url = localizeUrl(new URL(`/projects/${slug}`, getUrlOrigin()), { locale }).href;
  const sameAs = [frontmatter.liveUrl, frontmatter.repoUrl].filter((link): link is string =>
    Boolean(link),
  );

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: frontmatter.title,
    description: frontmatter.summary,
    url,
    author: {
      "@type": "Person",
      name: siteConfig.githubUsername,
      url: siteConfig.social.github,
    },
    genre: frontmatter.category,
    keywords: frontmatter.stack.join(", "),
    ...(frontmatter.publishedDate ? { datePublished: frontmatter.publishedDate } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}
