import { person } from "../../../content";
import { cn } from "../../../lib/utils";
import { href } from "../../types";
import { frame } from "./frame";

const home = href("a");

const navLink =
  "inline-flex min-h-11 items-center underline decoration-transparent decoration-2 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-ink motion-reduce:transition-none";

/** Wordmark and three anchors; on project pages the anchors point back to the home page. */
export function SiteHeader({ onHome = true }: { onHome?: boolean }) {
  const base = onHome ? "" : home;
  return (
    <header id="top" data-slot="site-header" className={cn(frame, "flex items-center justify-between gap-4 py-2 text-small font-medium")}>
      <a href={home} className={cn(navLink, "font-extrabold")}>
        {person.name}
      </a>
      <nav aria-label="Sections">
        <ul className="flex gap-4 md:gap-8">
          <li>
            <a className={navLink} href={`${base}#projets`}>
              Projets
            </a>
          </li>
          <li>
            <a className={navLink} href={`${base}#a-propos`}>
              À propos
            </a>
          </li>
          <li>
            <a className={navLink} href={`${base}#contact`}>
              Contact
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
