import { person, projects } from "../../../content";
import { cn } from "../../../lib/utils";
import { href } from "../../types";
import { frame, textLink } from "./frame";

/** The name opens the footer at full width; the projects follow as the places to go. */
export function SiteFooter() {
  return (
    <footer data-slot="site-footer" className={cn(frame, "bg-ground pt-40 pb-6 text-ink")}>
      <p data-reveal aria-hidden="true" className="a-footer-name font-display font-extrabold whitespace-nowrap">
        {person.name}
      </p>
      <div className="mt-16 grid gap-10 md:grid-cols-12">
        <ul data-reveal className="flex flex-col gap-2 text-lead font-extrabold md:col-span-6">
          {projects.map((project) => (
            <li key={project.slug}>
              <a className={textLink} href={href("a", project.slug)}>
                {project.name}
              </a>
            </li>
          ))}
        </ul>
        <ul data-reveal className="flex flex-col gap-2 text-body font-medium md:col-span-5 md:col-start-8">
          <li>
            <a className={textLink} href={`mailto:${person.email}`}>
              {person.email}
            </a>
          </li>
          {person.links.map((link) => (
            <li key={link.href}>
              <a className={textLink} href={link.href}>
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a className={textLink} href="/">
              Les trois pistes de direction
            </a>
          </li>
        </ul>
      </div>
      <div data-reveal className="mt-24 flex justify-between gap-4 text-small">
        <p>
          {person.name}, {person.title}
        </p>
        <a className={textLink} href="#top">
          Haut de page
        </a>
      </div>
    </footer>
  );
}
