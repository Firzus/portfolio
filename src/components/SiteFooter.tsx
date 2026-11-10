import { Github, Linkedin, Mail } from "iconoir-react";
import { contact } from "../content/contact";
import { gutter } from "../lib/layout";
import { cn } from "../lib/utils";
import { m } from "../paraglide/messages.js";
import { NameMark } from "./motion/NameMark";
import { ShaderLayer, useHover } from "./motion/shaders/ShaderLayer";
import { navLinks } from "./navigation";
import { TextLink } from "./ui/text-link";

/**
 * The end of every page: the sections and the contacts over a glow of the site's liquid, rising
 * from the bottom right, and Lilian's name across the whole width in the hand lettering of the
 * loading screen, melting into the glow.
 */
export function SiteFooter() {
  const { hover, bind } = useHover();
  const contacts = [
    { href: contact.linkedin, label: m.contact_linkedin(), Icon: Linkedin },
    { href: contact.email, label: m.contact_email(), Icon: Mail },
    { href: contact.github, label: m.contact_github(), Icon: Github },
  ];

  return (
    <footer className="p-2 md:p-3">
      <div
        {...bind}
        className="relative isolate overflow-hidden rounded-2xl border border-line bg-surface"
      >
        <div data-footer-glow className="absolute inset-0 -z-10">
          <ShaderLayer scene="hero" hover={hover} />
        </div>
        <div className={cn(gutter, "grid gap-10 pt-10 md:grid-cols-2 md:pt-14")}>
          <nav aria-label={m.footer_nav_label()}>
            <ul className="flex flex-col gap-1.5">
              {navLinks().map((link) => (
                <li key={link.item}>
                  <a
                    href={link.href}
                    className="rounded-md text-lead font-medium transition-colors hover:text-accent motion-reduce:transition-none"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <section aria-labelledby="contact-heading" className="flex flex-col md:items-end">
            <h2 id="contact-heading" className="text-caption font-medium text-muted">
              {m.contact_heading()}
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-caption md:items-end">
              {contacts.map(({ href, label, Icon }) => (
                <li key={href}>
                  <TextLink href={href} data-contact>
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                  </TextLink>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-caption text-muted">Lilian PRIEU · {m.job_title()}</p>
          </section>
        </div>
        <div data-footer-name className={cn(gutter, "mt-14 pb-5 md:mt-20 md:pb-8")}>
          <NameMark className="h-auto w-full fill-ink/25" />
        </div>
      </div>
    </footer>
  );
}
