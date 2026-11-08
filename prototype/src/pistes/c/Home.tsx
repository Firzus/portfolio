import { useRef } from "react";
import { Provisional } from "../../components/ui/Provisional";
import { person, projects } from "../../content";
import { useReveal } from "../../lib/motion";
import { ArrowLink } from "./components/ArrowLink";
import { ContactBand, FooterLine } from "./components/Closing";
import { WorkSheet } from "./components/WorkSheet";
import { chronological } from "./frames";

const kinds = [...new Set(chronological.map((p) => p.kind))];
const years = chronological.map((p) => p.year);
const huzounet = projects.find((p) => p.slug === "huzounet")!;
const atelier = projects.find((p) => p.slug === "atelier")!;
const fact = (project: typeof huzounet, label: string) => project.facts.find((f) => f.label === label)!.value;

const record = [
  { name: "Équipements recensés sur Huzounet", value: "1 901" },
  { name: "Outils regroupés sur Huzounet", value: "5" },
  { name: "Extension de navigateur", value: fact(huzounet, "Extension") },
  { name: "Démo de Lysandra", value: "Jouable" },
  { name: "Financement de Lysandra", value: "Kickstarter" },
  { name: "Moteur d'Atelier", value: fact(atelier, "Moteur") },
  { name: "Licence d'Atelier", value: fact(atelier, "Licence") },
];

export function Home() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <>
      <main ref={root}>
        <header className="px-5 pt-5 pb-12 md:pb-16">
          <h1 className="font-display text-display font-normal">
            <span className="block">{person.name}</span>
            <span className="block">{person.title}</span>
          </h1>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-6 text-body md:grid-cols-12">
            <p data-reveal="" className="col-span-2 md:col-span-4">
              <Provisional value={person.lead} />
            </p>
            <ul data-reveal="" aria-label="Domaines" className="md:col-span-3">
              {kinds.map((kind) => (
                <li key={kind}>{kind}</li>
              ))}
            </ul>
            <ul data-reveal="" aria-label="Liens" className="md:col-span-2">
              {person.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="underline decoration-2 underline-offset-4 hover:decoration-4">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div data-reveal="" className="col-span-2 md:col-span-3 md:justify-self-end">
              <ArrowLink variant="solid" href={`mailto:${person.email}`}>Écrire un e-mail</ArrowLink>
            </div>
          </div>
        </header>

        <WorkSheet />

        <section aria-labelledby="c-about-title" data-slot="about" className="c-field mt-36 bg-ground px-5 py-28 text-ink max-md:mt-28 md:py-36">
          <div className="grid gap-x-5 gap-y-8 md:grid-cols-12">
            <h2 id="c-about-title" className="text-lead font-normal md:col-span-4 lg:col-span-3">
              À propos
            </h2>
            <p data-reveal="" className="text-lead md:col-span-8 md:col-start-5 md:row-span-2 lg:col-span-7 lg:col-start-5">
              <Provisional value={person.about} />
            </p>
            <dl data-reveal="" className="grid grid-cols-2 content-start gap-x-5 gap-y-5 text-small md:col-span-4 md:grid-cols-1 lg:col-span-3">
              <div>
                <dt className="text-muted">Métier</dt>
                <dd>{person.title}</dd>
              </div>
              <div>
                <dt className="text-muted">Domaines</dt>
                <dd>Jeux vidéo et outils</dd>
              </div>
              <div>
                <dt className="text-muted">Projets présentés</dt>
                <dd>
                  {chronological.length}, de {years[0]} à {years[years.length - 1]}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-24 grid gap-x-5 gap-y-10 md:mt-28 md:grid-cols-12">
            <h3 data-reveal="" className="text-small font-semibold md:col-span-4 lg:col-span-3">
              Repères
            </h3>
            <ul data-reveal="" aria-label="Projets et années" className="flex flex-col gap-2.5 text-small md:col-span-4 md:col-start-5 lg:col-span-3">
              {chronological.map((p) => (
                <li key={p.slug} className="flex justify-between gap-4">
                  <span>{p.name}</span>
                  <span className="text-muted">{p.year}</span>
                </li>
              ))}
            </ul>
            <ul data-reveal="" aria-label="Faits sur les projets" className="flex flex-col gap-2.5 text-small md:col-span-4 lg:col-span-4 lg:col-start-9">
              {record.map((r) => (
                <li key={r.name} className="flex justify-between gap-4">
                  <span>{r.name}</span>
                  <span className="text-right whitespace-nowrap text-muted">{r.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <ContactBand />
      </main>
      <FooterLine />
    </>
  );
}
