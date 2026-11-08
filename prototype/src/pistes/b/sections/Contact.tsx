import { Provisional } from "../../../components/ui/Provisional";
import { findProject, person } from "../../../content";
import { mailto } from "../lib/hooks";

const sky = findProject("lysandra")!.pictures[0];
const linkClass = "underline decoration-1 underline-offset-4 transition-[text-decoration-thickness] duration-150 hover:decoration-2";

/** Closing band: a sentence, a square crop of Lysandra's sky and the ways to write. */
export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-titre"
      className="grid scroll-mt-24 grid-cols-[6rem_minmax(0,1fr)] gap-x-5 px-6 pt-16 pb-24 md:grid-cols-12 md:gap-x-6 md:pt-24"
    >
      <div data-reveal className="col-span-2 md:col-span-7 lg:col-span-5">
        <p className="max-w-[24ch] font-display text-lead font-bold md:text-head md:leading-[1.1]">
          Un jeu à programmer, un outil pour joueurs, un éditeur pour Unity : parlons-en.
        </p>
        <Provisional value={{ text: "", provisional: true }} className="mt-3 block [&>span]:ml-0" />
      </div>
      <div
        data-reveal
        className="mt-12 aspect-square w-24 overflow-hidden md:col-span-4 md:col-start-9 md:row-start-1 md:mt-1 md:w-32 lg:col-span-2 lg:col-start-8 lg:w-40"
      >
        <img
          src={sky.src}
          alt="Détail du site de Lysandra : l'île flottante dans le ciel."
          width={sky.width}
          height={sky.height}
          loading="lazy"
          className="size-full origin-[18%_22%] scale-[2.4] object-cover object-left"
        />
      </div>
      <div data-reveal className="mt-12 md:col-span-4 md:col-start-9 md:mt-8 lg:col-span-3 lg:col-start-10 lg:row-start-1 lg:mt-0">
        <h2 id="contact-titre" className="text-body font-semibold">
          Un projet en tête ?
        </h2>
        <ul className="mt-5 flex flex-col gap-2 text-body">
          <li>
            <a className={linkClass} href={mailto(person.email)}>
              {person.email}
            </a>
          </li>
          {person.links.map((link) => (
            <li key={link.href}>
              <a className={linkClass} href={link.href}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-small text-muted">
          <a className={linkClass} href={person.cv.href}>
            {person.cv.label}
          </a>
          <Provisional value={{ text: "", provisional: person.cv.provisional }} />
        </p>
      </div>
    </section>
  );
}
