import { siteConfig } from "#/lib/site-config";
import {
  baseLocale,
  getLocale,
  getUrlOrigin,
  locales,
  localizeUrl,
  type Locale,
} from "#/paraglide/runtime";

const OG_IMAGE_PATH = "/og-image.png";
const OG_IMAGE_WIDTH = "1200";
const OG_IMAGE_HEIGHT = "630";

export type PageHeadInput = {
  title: string;
  description: string;
  /** Canonical pathname without locale prefix, e.g. `/` or `/blog/my-post`. */
  pathname: string;
  locale?: Locale;
  ogType?: "website" | "article";
  /**
   * Locales in which this page genuinely exists. Used to emit hreflang and
   * `og:locale:alternate` only for real translations (not en-fallback pages).
   * Defaults to all locales (for static pages translated via the UI catalog).
   */
  availableLocales?: readonly Locale[];
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
  availableLocales = locales,
  extraMeta = [],
}: PageHeadInput) {
  const canonical = localizedPageUrl(pathname, locale);
  const ogImage = new URL(OG_IMAGE_PATH, getUrlOrigin()).href;

  // Only advertise locales the page actually exists in, so hreflang/og don't
  // point crawlers at en-fallback duplicates.
  const alternates = locales.filter((alt) => availableLocales.includes(alt));

  const meta = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: ogType },
    { property: "og:url", content: canonical },
    { property: "og:site_name", content: siteConfig.siteName },
    { property: "og:locale", content: ogLocaleTag(locale) },
    ...alternates
      .filter((alt) => alt !== locale)
      .map((alt) => ({ property: "og:locale:alternate", content: ogLocaleTag(alt) })),
    { property: "og:image", content: ogImage },
    { property: "og:image:width", content: OG_IMAGE_WIDTH },
    { property: "og:image:height", content: OG_IMAGE_HEIGHT },
    { property: "og:image:alt", content: title },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
    ...extraMeta,
  ];

  const links: Record<string, string>[] = [
    { rel: "canonical", href: canonical },
    // Per-page hreflang built from the real pathname (the root route can't —
    // its `match.pathname` is always `/`). Only real translations are listed.
    ...alternates.map((alt) => ({
      rel: "alternate",
      hreflang: alt,
      href: localizedPageUrl(pathname, alt),
    })),
  ];

  if (alternates.includes(baseLocale)) {
    links.push({
      rel: "alternate",
      hreflang: "x-default",
      href: localizedPageUrl(pathname, baseLocale),
    });
  }

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
