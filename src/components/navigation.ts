import { m } from "../paraglide/messages.js";
import { localizeHref } from "../paraglide/runtime.js";

export type NavItem = "home" | "projects" | "agents";

/** The section of the header menu a path belongs to, from the router's path without locale. */
export function currentNavItem(pathname: string): NavItem | undefined {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/projets/")) return "projects";
  if (pathname === "/agents-ia") return "agents";
  return undefined;
}

export interface NavLink {
  item: NavItem;
  label: string;
  href: string;
}

/** The header menu's links, in the current locale. */
export function navLinks(): NavLink[] {
  return [
    { item: "home", label: m.nav_home(), href: localizeHref("/") },
    { item: "projects", label: m.nav_projects(), href: `${localizeHref("/")}#projects` },
    { item: "agents", label: m.nav_agents(), href: localizeHref("/agents-ia") },
  ];
}
