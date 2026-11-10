import { Link } from "@tanstack/react-router";
import { gutter } from "../lib/layout";
import type { LocalizedPage } from "../lib/site";
import { cn } from "../lib/utils";
import type { Locale } from "../paraglide/runtime.js";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MainNav } from "./MainNav";
import { NameMark } from "./motion/NameMark";
import type { NavItem } from "./navigation";

interface SiteHeaderProps {
  /** The current page in every locale; empty when the page has no other version. */
  pages: LocalizedPage[];
  currentLocale: Locale;
  /** The menu section the page belongs to, if any. */
  current?: NavItem;
}

export function SiteHeader({ pages, currentLocale, current }: SiteHeaderProps) {
  return (
    <header
      data-slot="site-header"
      className={cn(
        gutter,
        "sticky top-0 z-10 flex h-16 items-center gap-6 border-b border-line bg-ground",
        // Without scripts the menu stays a list, which needs a second line on a phone.
        "no-js:max-md:h-auto no-js:max-md:flex-wrap no-js:max-md:gap-y-1 no-js:max-md:py-2",
      )}
    >
      <Link
        to="/"
        // Animates like the plain links, which use cross-document view transitions.
        viewTransition
        data-home
        className="flex min-h-11 items-center rounded-md"
      >
        <NameMark />
        <span className="sr-only">Lilian PRIEU</span>
      </Link>
      <MainNav
        current={current}
        tools={
          pages.some((page) => page.locale !== currentLocale) && (
            <LanguageSwitcher pages={pages} currentLocale={currentLocale} className="text-body" />
          )
        }
      />
      {/* On a phone the folded menu holds the language link, which leaves the bar to the name and
          the menu button. */}
      <LanguageSwitcher
        pages={pages}
        currentLocale={currentLocale}
        className="ml-auto js:max-md:hidden"
      />
    </header>
  );
}
