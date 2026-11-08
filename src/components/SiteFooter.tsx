import { Github, Linkedin, Mail } from "iconoir-react";
import { gutter } from "../lib/layout";
import { cn } from "../lib/utils";
import { m } from "../paraglide/messages.js";

export function SiteFooter() {
  const contacts = [
    { href: "https://www.linkedin.com/in/lprieu/", label: m.contact_linkedin(), Icon: Linkedin },
    { href: "mailto:lprieu.infos@gmail.com", label: m.contact_email(), Icon: Mail },
    { href: "https://github.com/Firzus", label: m.contact_github(), Icon: Github },
  ];

  return (
    <footer className="border-t border-line">
      <nav aria-labelledby="contact-heading" className={cn(gutter, "py-14")}>
        <h2 id="contact-heading" className="text-caption font-medium text-muted">
          {m.contact_heading()}
        </h2>
        <ul className="mt-4 flex flex-col gap-2.5 text-caption">
          {contacts.map(({ href, label, Icon }) => (
            <li key={href}>
              <a
                href={href}
                data-contact
                className="inline-flex items-center gap-2 text-muted transition-colors hover:text-ink motion-reduce:transition-none"
              >
                <Icon width={16} height={16} aria-hidden="true" />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <p className={cn(gutter, "border-t border-line py-5 text-caption text-muted")}>
        Lilian PRIEU · {m.job_title()}
      </p>
    </footer>
  );
}
