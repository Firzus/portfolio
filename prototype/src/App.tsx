import { findProject, person, projects } from "./content";
import { piste as a } from "./pistes/a";
import { piste as b } from "./pistes/b";
import { piste as c } from "./pistes/c";
import { href, type Piste } from "./pistes/types";

const pistes: Piste[] = [a, b, c];

export const routes = ["/", ...pistes.flatMap((p) => [href(p.id), ...projects.map((pr) => href(p.id, pr.slug))])];

type Match = { piste?: Piste; slug?: string };

function match(path: string): Match {
  const [id, section, slug] = path.split("/").filter(Boolean);
  const piste = pistes.find((p) => p.id === id);
  if (!piste) return {};
  return section === "projets" ? { piste, slug } : { piste };
}

export function headFor(path: string) {
  const { piste, slug } = match(path);
  const project = slug ? findProject(slug) : undefined;
  const title = project ? `${project.name}, ${person.name}` : `${person.name}, ${person.title}`;
  const label = piste ? ` (piste ${piste.id.toUpperCase()})` : " (pistes de direction)";
  return `<title>${title}${label}</title>${piste?.head ?? ""}`;
}

export function App({ path }: { path: string }) {
  const { piste, slug } = match(path);
  if (!piste) return <Hub />;
  const project = slug ? findProject(slug) : undefined;
  return (
    <div data-piste={piste.id} className="min-h-svh bg-ground font-text text-ink">
      {project ? <piste.Project project={project} /> : <piste.Home />}
    </div>
  );
}

function Hub() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-head font-semibold">Direction artistique : trois pistes</h1>
      <p className="mt-6 max-w-prose">
        Prototype du ticket FIR-419. Chaque piste montre l'accueil et une page projet avec le même contenu.
      </p>
      <ul className="mt-16 flex flex-col gap-12">
        {pistes.map((p) => (
          <li key={p.id}>
            <h2 className="text-lead font-semibold">
              <a className="underline decoration-2 underline-offset-4" href={href(p.id)}>
                Piste {p.id.toUpperCase()} : {p.name}
              </a>
            </h2>
            <p className="mt-2 max-w-prose">{p.pitch}</p>
            <p className="mt-2">
              <a className="underline underline-offset-4" href={href(p.id, "huzounet")}>
                Page projet : Huzounet
              </a>
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
