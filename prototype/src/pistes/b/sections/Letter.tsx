import { Provisional } from "../../../components/ui/Provisional";
import { person } from "../../../content";
import { mailto } from "../lib/hooks";

// The about text is two sentences; the second one is the phrase the letter marks.
const cut = person.about.text.indexOf(". ") + 1;
const opening = person.about.text.slice(0, cut);
const marked = person.about.text.slice(cut).trim();

/** Zigzag bottom edge of the sheet, so the strip below reads as torn off it. */
const teeth = 36;
const torn = `polygon(0 0, 100% 0, ${Array.from({ length: teeth * 2 + 1 }, (_, i) => {
  const x = 100 - (i * 100) / (teeth * 2);
  return `${x}% ${i % 2 ? "100%" : "calc(100% - 10px)"}`;
}).join(", ")})`;

/** The founder's letter, set on a paper sheet with its email address on a tear-off strip. */
export function Letter() {
  return (
    <section id="lettre" aria-labelledby="lettre-titre" className="flex scroll-mt-24 justify-center px-6 py-24 md:py-40">
      <div className="w-full max-w-[40rem]">
        <article className="bg-field px-6 pt-10 pb-16 text-field-ink md:px-15 md:pt-15 md:pb-20" style={{ clipPath: torn }}>
          <h2 id="lettre-titre" data-reveal className="font-display text-head font-bold">
            Entre le jeu et l'outil
          </h2>
          <p data-reveal className="mt-8 max-w-[52ch]">{opening}</p>
          {marked && (
            <p data-reveal className="mt-6 max-w-[52ch]">
              <mark className="bg-accent px-1 text-accent-ink [box-decoration-break:clone]">{marked}</mark>
              <Provisional value={{ text: "", provisional: person.about.provisional }} />
            </p>
          )}
          <p data-reveal className="mt-10 text-lead italic">{person.name}</p>
          <p data-reveal className="text-small text-field-ink/75">{person.title}</p>
        </article>
        <p data-reveal className="mt-2 bg-field px-6 py-6 text-field-ink md:px-15">
          <a className="text-body font-semibold underline decoration-1 underline-offset-4 hover:decoration-2" href={mailto(person.email)}>
            {person.email}
          </a>
        </p>
      </div>
    </section>
  );
}
