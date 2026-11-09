import { Link } from "@tanstack/react-router";
import { gutter } from "../lib/layout";
import type { LocalizedPage } from "../lib/site";
import { cn } from "../lib/utils";
import type { Locale } from "../paraglide/runtime.js";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MainNav } from "./MainNav";
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
        "no-js:max-md:h-auto no-js:max-md:flex-wrap no-js:max-md:gap-y-3 no-js:max-md:py-3",
      )}
    >
      <Link
        to="/"
        // Animates like the plain links, which use cross-document view transitions.
        viewTransition
        data-home
        className="flex items-center gap-2.5 rounded-md text-body font-semibold tracking-tight"
      >
        <span
          aria-hidden="true"
          className="grid size-7 place-items-center rounded-md bg-ink text-label font-bold tracking-tight text-ground"
        >
          LP
        </span>
        Lilian PRIEU
      </Link>
      <MainNav current={current} />
      <div className="ml-auto">
        <LanguageSwitcher pages={pages} currentLocale={currentLocale} />
      </div>
    </header>
  );
}
