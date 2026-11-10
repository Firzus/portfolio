import { ArrowRight } from "iconoir-react";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { gutter } from "../lib/layout";
import { cn } from "../lib/utils";
import { m } from "../paraglide/messages.js";
import { useLiquidPill } from "./motion/fluid";
import { navLinks, type NavItem } from "./navigation";
import { Dialog, DialogClose, DialogPopup, DialogTitle, DialogTrigger } from "./ui/dialog";
import { MenuIcon } from "./ui/menu-icon";

/**
 * The site's sections. Wide screens list the links, with a liquid pill that flows to the hovered
 * or focused link and back to the current one. Below md, once scripts run, the links fold into a
 * menu that covers the screen; without scripts they stay a plain list.
 */
interface MainNavProps {
  current?: NavItem;
  /** Shown at the foot of the folded menu, which covers the header and what it holds. */
  tools?: React.ReactNode;
}

/**
 * The menu item to mark: the page's own, except on the home page, where Projets takes over while
 * the projects section crosses the middle of the screen, so the link chosen stays marked once its
 * section is reached and the mark follows the reader's scrolling.
 */
function useCurrentSection(page?: NavItem) {
  const [inProjects, setInProjects] = useState(false);
  useEffect(() => {
    const section = page === "home" ? document.getElementById("projects") : null;
    if (!section) return;
    const watch = new IntersectionObserver(
      ([entry]) => setInProjects(entry?.isIntersecting ?? false),
      { rootMargin: "-50% 0px -50% 0px" },
    );
    watch.observe(section);
    return () => {
      watch.disconnect();
      setInProjects(false);
    };
  }, [page]);
  return page === "home" && inProjects ? "projects" : page;
}

export function MainNav({ current: page, tools }: MainNavProps) {
  const current = useCurrentSection(page);
  const links = navLinks();
  const list = useRef<HTMLElement>(null);
  const pill = useLiquidPill(
    list,
    "[data-slot='nav-link']",
    links.findIndex((link) => link.item === current),
  );
  // The folded menu needs scripts to open, so the server renders the plain list in its place.
  const [enhanced, setEnhanced] = useState(false);
  useEffect(() => setEnhanced(true), []);
  // Controlled so that a link closes it: a link to a section of the same page leaves the page
  // where it is, and the menu would otherwise stay over it.
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav
        ref={list}
        data-slot="main-nav"
        aria-label={m.nav_label()}
        className="relative isolate js:max-md:hidden"
      >
        <span
          ref={pill}
          data-slot="nav-pill"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <span className="absolute top-0 left-0 rounded-md bg-pill opacity-0" />
          <span className="absolute top-0 left-0 rounded-md bg-pill opacity-0" />
        </span>
        <ul className="flex items-center gap-1">
          {links.map((link) => (
            <li key={link.item}>
              <a
                href={link.href}
                data-slot="nav-link"
                aria-current={link.item === current ? "page" : undefined}
                // Without scripts the pill is never placed, so the current link carries its fill.
                className="block rounded-md px-2.5 py-1.5 text-caption font-medium text-muted transition-colors hover:text-ink aria-[current=page]:text-ink motion-reduce:transition-none no-js:aria-[current=page]:bg-pill"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {enhanced && (
        // A landmark of its own, since the list's is hidden at this width.
        <nav aria-label={m.nav_label()} className="ml-auto md:hidden">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              {m.nav_menu()}
              <MenuIcon />
            </DialogTrigger>
            {/* Framed like the page's column, so its content keeps the page's edges. */}
            <DialogPopup className="border-x border-line">
              {/* The same bar as the header, so the close button lands where the trigger was. */}
              <div
                className={cn(
                  gutter,
                  "flex h-16 shrink-0 items-center justify-between border-b border-line",
                )}
              >
                <DialogTitle className="text-body font-semibold tracking-tight">
                  {m.nav_menu()}
                </DialogTitle>
                <DialogClose>
                  <span data-slot="menu-label">{m.nav_close()}</span>
                  <MenuIcon open />
                </DialogClose>
              </div>
              <nav aria-label={m.nav_label()} className="flex flex-1 flex-col">
                {/* The rows share the height left by the two bars, so the links fill the screen
                    and each one is a target as wide and as tall as its row. */}
                <ul className="flex flex-1 flex-col">
                  {links.map((link) => (
                    <li
                      key={link.item}
                      className="flex flex-1 overflow-hidden border-b border-line"
                    >
                      <a
                        href={link.href}
                        data-slot="nav-sheet-link"
                        aria-current={link.item === current ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className={cn(
                          gutter,
                          "group flex flex-1 items-center justify-between gap-4 py-6 font-display text-menu font-heading -outline-offset-4 aria-[current=page]:text-accent",
                        )}
                      >
                        {link.label}
                        <ArrowRight
                          aria-hidden="true"
                          className="size-6 shrink-0 text-muted group-aria-[current=page]:hidden"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              {tools && (
                <div
                  data-slot="nav-sheet-tools"
                  className={cn(gutter, "flex h-16 shrink-0 items-center justify-between")}
                >
                  {/* The switcher's own label names it for assistive technology. */}
                  <span aria-hidden="true" className="text-body text-muted">
                    {m.language_switcher_label()}
                  </span>
                  {tools}
                </div>
              )}
            </DialogPopup>
          </Dialog>
        </nav>
      )}
    </>
  );
}
