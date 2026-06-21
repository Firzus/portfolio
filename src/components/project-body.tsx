import { Markdown } from "#/components/markdown";

type ProjectBodyProps = {
  body: string;
};

/**
 * Renders a project MDX body as semantic HTML via the shared `Markdown`
 * renderer (headings, paragraphs, ordered/unordered lists, inline bold/italic/
 * code/links). No JSX components are used in project files, so a full MDX
 * runtime is intentionally avoided.
 */
export function ProjectBody({ body }: ProjectBodyProps) {
  if (!body) return null;
  return <Markdown body={body} />;
}
