import { Language } from "iconoir-react";
import type * as React from "react";
import type { LocalizedPage } from "../lib/site";
import { cn } from "../lib/utils";
import { m } from "../paraglide/messages.js";
import type { Locale } from "../paraglide/runtime.js";
import { TextLink } from "./ui/text-link";

interface LanguageSwitcherProps extends React.ComponentProps<"nav"> {
  pages: LocalizedPage[];
  currentLocale: Locale;
}

export function LanguageSwitcher({
  pages,
  currentLocale,
  className,
  ...props
}: LanguageSwitcherProps) {
  const otherPages = pages.filter((page) => page.locale !== currentLocale);
  if (otherPages.length === 0) return null;

  return (
    <nav
      data-slot="language-switcher"
      aria-label={m.language_switcher_label()}
      className={cn("text-caption font-medium", className)}
      {...props}
    >
      <ul className="flex gap-4">
        {otherPages.map((page) => (
          <li key={page.locale}>
            {/* A plain link, not a router link: the full page load lets the
                server render every text in the new locale. */}
            <TextLink
              href={page.href}
              hrefLang={page.locale}
              lang={page.locale}
              data-language-switch
              // Tall enough for a finger, since the text alone is a single short line.
              className="min-h-11"
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
