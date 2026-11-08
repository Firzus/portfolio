import { baseLocale, locales, localizeUrl, type Locale } from "../paraglide/runtime.js";

export const siteOrigin = "https://portfolio.lprieu.dev";

export interface LocalizedPage {
  locale: Locale;
  /** Path on this site, for links. */
  href: string;
  /** Absolute URL on the public domain, for `hreflang` links. */
  absoluteHref: string;
}

/** Lists one page in every locale, from its path without locale (e.g. `/`). */
export function localizedPages(pathname: string): LocalizedPage[] {
  return locales.map((locale) => {
    const url = localizeUrl(new URL(pathname, siteOrigin), { locale });
    return { locale, href: url.pathname, absoluteHref: url.href };
  });
}

export function defaultPage(pages: LocalizedPage[]): LocalizedPage | undefined {
  return pages.find((page) => page.locale === baseLocale);
}
