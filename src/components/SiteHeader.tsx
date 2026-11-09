import { Link } from "@tanstack/react-router";
import { gutter } from "../lib/layout";
import type { LocalizedPage } from "../lib/site";
import { cn } from "../lib/utils";
import type { Locale } from "../paraglide/runtime.js";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface SiteHeaderProps {
  /** The current page in every locale; empty when the page has no other version. */
  pages: LocalizedPage[];
  currentLocale: Locale;
}

export function SiteHeader({ pages, currentLocale }: SiteHeaderProps) {
  return (
    <header
      data-slot="site-header"
      className={cn(
        gutter,
        "sticky top-0 z-10 flex h-16 items-center justify-between gap-6 border-b border-line bg-ground",
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
      <LanguageSwitcher pages={pages} currentLocale={currentLocale} />
    </header>
  );
}
