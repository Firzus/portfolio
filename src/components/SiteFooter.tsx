import { Github, Linkedin, Mail } from "iconoir-react";
import { gutter } from "../lib/layout";
import { cn } from "../lib/utils";
import { m } from "../paraglide/messages.js";
import { TextLink } from "./ui/text-link";

export function SiteFooter() {
  const contacts = [
    { href: "https://www.linkedin.com/in/lprieu/", label: m.contact_linkedin(), Icon: Linkedin },
    { href: "mailto:lprieu.infos@gmail.com", label: m.contact_email(), Icon: Mail },
    { href: "https://github.com/Firzus", label: m.contact_github(), Icon: Github },
  ];

  return (
    <footer className="border-t border-line">
      <section aria-labelledby="contact-heading" className={cn(gutter, "py-14")}>
        <h2 id="contact-heading" className="text-caption font-medium text-muted">
          {m.contact_heading()}
        </h2>
        <ul className="mt-4 flex flex-col gap-2.5 text-caption">
          {contacts.map(({ href, label, Icon }) => (
            <li key={href}>
              <TextLink href={href} data-contact>
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </TextLink>
            </li>
          ))}
        </ul>
      </section>
      <p className={cn(gutter, "border-t border-line py-5 text-caption text-muted")}>
        Lilian PRIEU · {m.job_title()}
      </p>
    </footer>
  );
}
