import { findProject, person, projects } from "./content";
import { piste } from "./pistes/d";
import { href } from "./pistes/types";

// The site root opens the direction's home page directly, alongside its own /d/ address.
export const routes = ["/", href(piste.id), ...projects.map((project) => href(piste.id, project.slug))];

function slugOf(path: string) {
  const [, section, slug] = path.split("/").filter(Boolean);
  return section === "projets" ? slug : undefined;
}

export function headFor(path: string) {
  const slug = slugOf(path);
  const project = slug ? findProject(slug) : undefined;
  const title = project ? `${project.name}, ${person.name}` : `${person.name}, ${person.title}`;
  return `<title>${title}</title>${piste.head}`;
}

export function App({ path }: { path: string }) {
  const slug = slugOf(path);
  const project = slug ? findProject(slug) : undefined;
  return (
    <div data-piste={piste.id} className="min-h-svh bg-ground font-text text-ink">
      {project ? <piste.Project project={project} /> : <piste.Home />}
    </div>
  );
}
