import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProjectPage } from "../../components/ProjectPage";
import { findProject, lookupProject } from "../../content/projects";
import { m } from "../../paraglide/messages.js";

// Declared under the French path only; Paraglide's URL patterns map /en/projects/… to it.
export const Route = createFileRoute("/projets/$slug")({
  loader: ({ params }) => {
    if (!lookupProject(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const project = lookupProject(params.slug);
    if (!project) return {};
    return {
      meta: [
        { title: `${project.name}, ${m.project_meta_suffix()} · Lilian PRIEU` },
        { name: "description", content: project.summary() },
      ],
    };
  },
  component: ProjectRoute,
});

function ProjectRoute() {
  const { slug } = Route.useParams();
  return <ProjectPage project={findProject(slug)} />;
}
