import { Provisional } from "../../../components/ui/Provisional";
import { person } from "../../../content";
import { cn } from "../../../lib/utils";
import { frame, textLink } from "./frame";

const [user, domain] = person.email.split("@");

/** The email address set as display type, on the page's inverse colours. */
export function Contact() {
  return (
    <section
      id="contact"
      data-slot="contact"
      aria-labelledby="a-contact-title"
      className={cn(frame, "a-on-ink a-contact flex flex-col justify-between gap-28 bg-ink py-8 text-ground lg:py-10")}
    >
      <h2 id="a-contact-title" data-reveal className="max-w-[24ch] text-lead font-medium">
        <Provisional value={{ text: "Pour parler d'un jeu ou d'un outil, écrivez-moi.", provisional: true }} />
      </h2>
      <a
        data-reveal
        href={`mailto:${person.email}`}
        className="a-email block font-display font-medium break-words transition-colors duration-150 hover:text-field motion-reduce:transition-none"
      >
        <span className="max-md:block">{user}@</span>
        <span className="max-md:block">{domain}</span>
      </a>
      <div data-reveal className="flex flex-col gap-3 text-small font-medium md:flex-row md:justify-between">
        <p>
          <a className={textLink} href={person.cv.href}>
            {person.cv.label}
          </a>
          <Provisional value={{ text: "", provisional: person.cv.provisional }} />
        </p>
        <ul className="flex gap-6">
          {person.links.map((link) => (
            <li key={link.href}>
              <a className={textLink} href={link.href}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
