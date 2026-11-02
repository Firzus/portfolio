import { getAbsoluteLocaleUrl, getRelativeLocaleUrl } from "astro:i18n";
import { baseLocale, locales, type Locale } from "../paraglide/runtime.js";

/** Returns the page path shared by every locale, e.g. `/en/about/` → `about/`. */
export function pathWithoutLocale(pathname: string, locale: Locale): string {
  const prefix = locale === baseLocale ? "/" : `/${locale}/`;
  const path = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname;
  return path.replace(/^\/+/, "");
}

export interface LocalizedPage {
  locale: Locale;
  href: string;
  absoluteHref: string;
}

/** Lists the same page in every locale, for the language switcher and `hreflang` links. */
export function localizedPages(pathname: string, currentLocale: Locale): LocalizedPage[] {
  const path = pathWithoutLocale(pathname, currentLocale);
  return locales.map((locale) => ({
    locale,
    href: getRelativeLocaleUrl(locale, path),
    absoluteHref: getAbsoluteLocaleUrl(locale, path),
  }));
}
