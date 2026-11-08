import { Language } from "iconoir-react";
import type { LocalizedPage } from "../lib/site";
import { m } from "../paraglide/messages.js";
import type { Locale } from "../paraglide/runtime.js";
import { TextLink } from "./ui/text-link";

interface LanguageSwitcherProps {
  pages: LocalizedPage[];
  currentLocale: Locale;
}

export function LanguageSwitcher({ pages, currentLocale }: LanguageSwitcherProps) {
  const otherPages = pages.filter((page) => page.locale !== currentLocale);
  if (otherPages.length === 0) return null;

  return (
    <nav aria-label={m.language_switcher_label()}>
      <ul className="flex gap-4 text-caption font-medium">
        {otherPages.map((page) => (
          <li key={page.locale}>
            {/* A plain link, not a router link: the full page load lets the
                server render every text in the new locale. */}
            <TextLink
              href={page.href}
              hrefLang={page.locale}
              lang={page.locale}
              data-language-switch
            >
              <Language className="size-4" aria-hidden="true" />
              {m.language_name({}, { locale: page.locale })}
            </TextLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
