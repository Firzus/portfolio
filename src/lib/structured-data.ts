import { siteConfig } from "#/lib/site-config";
import type { ProjectFrontmatter } from "#/lib/content/schema";
import { allSkills } from "#/lib/skills";
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

export interface PersonJsonLd {
  "@context": "https://schema.org";
  "@type": "Person";
  name: string;
  url: string;
  jobTitle: string;
  description: string;
  sameAs: string[];
  knowsAbout: string[];
}

export interface ContactPageJsonLd {
  "@context": "https://schema.org";
  "@type": "ContactPage";
  name: string;
  description: string;
  url: string;
  mainEntity: PersonJsonLd;
}

export interface CollectionPageJsonLd {
  "@context": "https://schema.org";
  "@type": "CollectionPage";
  name: string;
  description: string;
  url: string;
}

function personEntity(locale: Locale): PersonJsonLd {
  const url = localizeUrl(new URL("/", getUrlOrigin()), { locale }).href;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.githubUsername,
    url,
    jobTitle: "Agentic / AI Developer",
    description:
      "Junior developer with a full-stack foundation and a game-dev practice, shipping agentic AI tools and case studies.",
    sameAs: [siteConfig.social.github, siteConfig.social.linkedin],
    knowsAbout: [...allSkills],
  };
}

/** Person schema for the home page — signals identity to recruiters and search engines. */
export function personJsonLd(locale: Locale): PersonJsonLd {
  return personEntity(locale);
}

/** ContactPage schema wrapping the site owner as `mainEntity`. */
export function contactPageJsonLd(
  locale: Locale,
  title: string,
  description: string,
): ContactPageJsonLd {
  const url = localizeUrl(new URL("/contact", getUrlOrigin()), { locale }).href;
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: title,
    description,
    url,
    mainEntity: personEntity(locale),
  };
}

/** CollectionPage schema for index routes (blog, etc.). */
export function collectionPageJsonLd(
  locale: Locale,
  pathname: string,
  title: string,
  description: string,
): CollectionPageJsonLd {
  const url = localizeUrl(new URL(pathname, getUrlOrigin()), { locale }).href;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url,
  };
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
