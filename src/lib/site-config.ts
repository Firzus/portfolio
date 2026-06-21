/**
 * Static, non-localized site metadata: identity, social links and the
 * primary navigation map. Labels are resolved separately via Paraglide
 * messages so this stays a single source of truth for URLs/paths.
 */
export const siteConfig = {
  /** GitHub handle, used both for the profile link and the live activity API. */
  githubUsername: "Firzus",
  /** Real person name for Person/author structured data (recruiter-facing). */
  fullName: "Firzus",
  /** Human-readable site name for `og:site_name` / titles. */
  siteName: "Firzus — Portfolio",
  social: {
    github: "https://github.com/Firzus",
    // TODO: replace with the real LinkedIn URL.
    linkedin: "https://www.linkedin.com/in/firzus",
  },
  /** Public path to the downloadable CV (PDF). Replace the placeholder file. */
  cvPath: "/cv-firzus.pdf",
} as const;

export type NavItem = {
  /** Canonical (un-prefixed) path; localize with `localizeHref` at render. */
  href: string;
  /** Paraglide message key resolving the localized label. */
  labelKey: "nav_home" | "nav_projects" | "nav_blog" | "nav_contact";
};

export const navItems: readonly NavItem[] = [
  { href: "/", labelKey: "nav_home" },
  // The home renders a narrative `#projects` section (no standalone /projects
  // index route exists); link to the anchor rather than a 404.
  { href: "/#projects", labelKey: "nav_projects" },
  { href: "/blog", labelKey: "nav_blog" },
  { href: "/contact", labelKey: "nav_contact" },
] as const;
