import { NavArrowDown } from "iconoir-react";
import { useEffect, useRef, useState } from "react";
import { m } from "../paraglide/messages.js";
import { useLiquidPill } from "./motion/fluid";
import { navLinks, type NavItem } from "./navigation";
import { Menu, MenuLinkItem, MenuPopup, MenuTrigger } from "./ui/menu";

/**
 * The site's sections. Wide screens list the links, with a liquid pill that flows to the hovered
 * or focused link and back to the current one. Below md, once scripts run, the links fold into a
 * menu; without scripts they stay a plain list.
 */
export function MainNav({ current }: { current?: NavItem }) {
  const links = navLinks();
  const list = useRef<HTMLUListElement>(null);
  const pill = useLiquidPill(
    list,
    "[data-slot='nav-link']",
    links.findIndex((link) => link.item === current),
  );
  // The folded menu needs scripts to open, so the server renders the plain list in its place.
  const [enhanced, setEnhanced] = useState(false);
  useEffect(() => setEnhanced(true), []);

  return (
    <>
      <nav data-slot="main-nav" aria-label={m.nav_label()} className="js:max-md:hidden">
        <ul ref={list} className="relative isolate flex items-center gap-1">
          <span
            ref={pill}
            data-slot="nav-pill"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <span className="absolute top-0 left-0 rounded-md bg-pill opacity-0" />
            <span className="absolute top-0 left-0 rounded-md bg-pill opacity-0" />
          </span>
          {links.map((link) => (
            <li key={link.item}>
              <a
                href={link.href}
                data-slot="nav-link"
                aria-current={link.item === current ? "page" : undefined}
                className="block rounded-md px-2.5 py-1.5 text-caption font-medium text-muted transition-colors hover:text-ink aria-[current=page]:text-ink motion-reduce:transition-none"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {enhanced && (
        <Menu>
          <MenuTrigger className="order-last md:hidden">
            {m.nav_menu()}
            <NavArrowDown aria-hidden="true" className="size-4" />
          </MenuTrigger>
          <MenuPopup>
            {links.map((link) => (
              <MenuLinkItem
                key={link.item}
                href={link.href}
                aria-current={link.item === current ? "page" : undefined}
              >
                {link.label}
              </MenuLinkItem>
            ))}
          </MenuPopup>
        </Menu>
      )}
    </>
  );
}
