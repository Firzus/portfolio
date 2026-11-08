import { Provisional } from "../../../components/ui/Provisional";
import { person } from "../../../content";
import { cn } from "../../../lib/utils";
import { frame, textLink } from "./frame";

/** A rest on a white field: the statement as a paragraph, with the ways to read further. */
export function About() {
  return (
    <section
      id="a-propos"
      data-slot="about"
      aria-labelledby="a-about-title"
      className={cn(frame, "grid gap-8 bg-field py-24 text-field-ink lg:grid-cols-12 lg:gap-8 lg:py-40")}
    >
      <h2 id="a-about-title" data-reveal className="font-display text-head lg:col-span-4">
        À propos
      </h2>
      <div className="lg:col-span-8">
        <p data-reveal className="max-w-[40ch] text-lead font-medium">
          <Provisional value={person.about} />
        </p>
        <ul data-reveal className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-body font-medium">
          {person.links.map((link) => (
            <li key={link.href}>
              <a className={textLink} href={link.href}>
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a className={textLink} href={person.cv.href}>
              {person.cv.label}
            </a>
            <Provisional value={{ text: "", provisional: person.cv.provisional }} />
          </li>
        </ul>
      </div>
    </section>
  );
}
