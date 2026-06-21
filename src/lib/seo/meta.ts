import { siteConfig } from "#/lib/site-config";
import { getLocale, getUrlOrigin, locales, localizeUrl, type Locale } from "#/paraglide/runtime";

const OG_IMAGE_PATH = "/logo512.png";

export type PageHeadInput = {
  title: string;
  description: string;
  /** Canonical pathname without locale prefix, e.g. `/` or `/blog/my-post`. */
  pathname: string;
  locale?: Locale;
  ogType?: "website" | "article";
  /** Extra `<meta>` entries (JSON-LD via `script:ld+json`, etc.). */
  extraMeta?: Record<string, unknown>[];
};

function localizedPageUrl(pathname: string, locale: Locale): string {
  return localizeUrl(new URL(pathname, getUrlOrigin()), { locale }).href;
}

/**
 * Build route-level `<head>` meta and link entries: description, Open Graph,
 * Twitter cards, canonical URL and locale alternates (hreflang is on the root).
 */
export function buildPageHead({
  title,
  description,
  pathname,
  locale = getLocale(),
  ogType = "website",
  extraMeta = [],
}: PageHeadInput) {
  const canonical = localizedPageUrl(pathname, locale);
  const ogImage = new URL(OG_IMAGE_PATH, getUrlOrigin()).href;

  const meta = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: ogType },
    { property: "og:url", content: canonical },
    { property: "og:site_name", content: siteConfig.githubUsername },
    { property: "og:locale", content: ogLocaleTag(locale) },
    ...locales
      .filter((alt) => alt !== locale)
      .map((alt) => ({ property: "og:locale:alternate", content: ogLocaleTag(alt) })),
    { property: "og:image", content: ogImage },
    { property: "og:image:alt", content: title },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
    ...extraMeta,
  ];

  const links = [{ rel: "canonical", href: canonical }];

  return { meta, links };
}

/** Map Paraglide locale codes to Open Graph locale tags (`en` → `en_US`). */
function ogLocaleTag(locale: Locale): string {
  const map: Record<Locale, string> = {
    en: "en_US",
    fr: "fr_FR",
    es: "es_ES",
    de: "de_DE",
  };
  return map[locale];
}
