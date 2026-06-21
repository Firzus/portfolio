/**
 * Static, non-localized site metadata: identity, social links and the
 * primary navigation map. Labels are resolved separately via Paraglide
 * messages so this stays a single source of truth for URLs/paths.
 */
export const siteConfig = {
  social: {
    github: "https://github.com/Firzus",
    // TODO: replace with the real LinkedIn URL.
    linkedin: "https://www.linkedin.com/in/firzus",
  },
} as const;

export type NavItem = {
  /** Canonical (un-prefixed) path; localize with `localizeHref` at render. */
  href: string;
  /** Paraglide message key resolving the localized label. */
  labelKey: "nav_home" | "nav_projects" | "nav_blog" | "nav_contact";
};

export const navItems: readonly NavItem[] = [
  { href: "/", labelKey: "nav_home" },
  { href: "/projects", labelKey: "nav_projects" },
  { href: "/blog", labelKey: "nav_blog" },
  { href: "/contact", labelKey: "nav_contact" },
] as const;
