import { person } from "../../../content";
import { mailto } from "../lib/hooks";

/** A single quiet line at the foot of the page. */
export function Footer() {
  const links = [...person.links, { label: "E-mail", href: mailto(person.email) }];
  return (
    <footer className="px-6 pt-[16svh] pb-8 text-small">
      <div className="flex flex-col gap-2 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-baseline lg:gap-6">
        <p data-reveal className="text-muted">Portfolio de {person.name}</p>
        <ul data-reveal className="flex flex-wrap gap-x-6 gap-y-1">
          {links.map((link) => (
            <li key={link.label}>
              <a className="underline decoration-1 underline-offset-4 hover:decoration-2" href={link.href}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <p data-reveal className="text-muted lg:text-right">
          2026,{" "}
          <a className="text-ink underline decoration-1 underline-offset-4 hover:decoration-2" href="/">
            toutes les pistes
          </a>
        </p>
      </div>
    </footer>
  );
}
