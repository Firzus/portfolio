import { Provisional } from "../../../components/ui/Provisional";
import { person } from "../../../content";
import { href } from "../../types";
import { ArrowLink } from "./ArrowLink";

const linkedIn = person.links.find((l) => l.label === "LinkedIn")!;
const gitHub = person.links.find((l) => l.label === "GitHub")!;

/** Closing row: the statement, Atelier's mark standing in for a portrait, then the question and two links. */
export function ContactBand() {
  return (
    <section
      id="contact"
      aria-labelledby="c-contact-title"
      data-slot="contact"
      className="grid gap-x-5 gap-y-8 px-5 pt-36 pb-16 max-md:pt-28 md:grid-cols-12"
    >
      <p data-reveal="" className="text-lead md:col-span-9 lg:col-span-5">
        <Provisional value={{ text: "Un jeu à programmer ou un outil à construire, pour des joueurs ou pour Unity ? Écrivez-moi.", provisional: true }} />
      </p>
      <div className="flex min-w-0 gap-5 max-sm:flex-col md:col-span-12 lg:col-span-5 lg:col-start-8 lg:grid lg:grid-cols-subgrid lg:gap-x-5">
        <div data-reveal="" className="grid size-24 shrink-0 place-items-center bg-field md:size-32 lg:col-span-2 lg:size-40">
          <img src="/assets/atelier-mark.svg" alt="Marque d'Atelier" width={100} height={100} className="h-3/5 w-auto" loading="lazy" />
        </div>
        <div data-reveal="" className="flex min-w-0 flex-col gap-5 lg:col-span-3 lg:col-start-3">
          <h2 id="c-contact-title" className="text-body font-semibold">
            Un projet de jeu ou d'outil ?
          </h2>
          <ul className="flex flex-col gap-3 text-body">
            <li>
              <ArrowLink variant="solid" href={`mailto:${person.email}`}>{person.email}</ArrowLink>
            </li>
            <li>
              <a href={linkedIn.href} className="underline decoration-2 underline-offset-4 hover:decoration-4">
                {linkedIn.label}
              </a>
            </li>
          </ul>
          <p className="text-small text-muted">
            Code sur{" "}
            <a href={gitHub.href} className="text-ink underline underline-offset-4">
              GitHub
            </a>
            ,{" "}
            <a href={person.cv.href} className="text-ink underline underline-offset-4">
              {person.cv.label}
            </a>
            <Provisional value={{ text: "", provisional: person.cv.provisional }} />
          </p>
        </div>
      </div>
    </section>
  );
}

/** A single quiet line after open ground: what this is, the links, the year. */
export function FooterLine() {
  return (
    <footer
      data-slot="footer"
      className="mt-[22svh] grid items-baseline gap-2 px-5 pb-8 text-small text-muted max-md:mt-[16svh] md:grid-cols-[1fr_auto_1fr]"
    >
      <p className="flex items-center gap-3">
        <a href={href("c")} aria-label="Lilian PRIEU, accueil" className="grid size-8 place-items-center bg-accent font-semibold text-accent-ink">
          LP
        </a>
        Portfolio de {person.name}
      </p>
      <ul className="flex flex-wrap gap-x-6 gap-y-1">
        <li>
          <a className="text-ink hover:underline" href={`mailto:${person.email}`}>
            E-mail
          </a>
        </li>
        {person.links.map((link) => (
          <li key={link.label}>
            <a className="text-ink hover:underline" href={link.href}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <p className="md:text-right">2026</p>
    </footer>
  );
}
