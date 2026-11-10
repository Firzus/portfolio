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

/** Whether a link leaves the portfolio for another site (an e-mail link opens the mail app). */
export function isExternal(href: string | undefined): boolean {
  return !!href && /^https?:\/\//.test(href) && new URL(href).origin !== siteOrigin;
}

/**
 * The attributes of a link to another site: it opens in a new tab, and that tab gets no handle on
 * this page.
 */
export function externalLinkProps(href: string | undefined) {
  return isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};
}
