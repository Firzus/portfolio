import { Github, Linkedin, Mail } from "iconoir-react";
import { m } from "../paraglide/messages.js";

export function HomePage() {
  const contacts = [
    { href: "https://www.linkedin.com/in/lprieu/", label: m.contact_linkedin(), Icon: Linkedin },
    { href: "mailto:lprieu.infos@gmail.com", label: m.contact_email(), Icon: Mail },
    { href: "https://github.com/Firzus", label: m.contact_github(), Icon: Github },
  ];

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center gap-10 px-6">
      <div>
        <h1 className="font-display text-5xl font-semibold tracking-tight">Lilian PRIEU</h1>
        <p className="mt-3 text-xl text-muted">{m.job_title()}</p>
      </div>
      <section aria-labelledby="contact-heading">
        <h2 id="contact-heading" className="text-sm font-medium tracking-wide text-muted uppercase">
          {m.contact_heading()}
        </h2>
        <ul className="mt-4 flex flex-wrap gap-6">
          {contacts.map(({ href, label, Icon }) => (
            <li key={href}>
              <a
                href={href}
                className="inline-flex items-center gap-2 hover:text-accent"
                data-contact
              >
                <Icon width={20} height={20} aria-hidden="true" />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
