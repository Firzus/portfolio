import { Markdown } from "#/components/markdown";

type PostBodyProps = {
  body: string;
};

/**
 * Renders a blog post MDX body as semantic HTML via the shared `Markdown`
 * renderer (headings, paragraphs, ordered/unordered lists, inline bold/italic/
 * code/links). No JSX components are used in post files, so a full MDX runtime
 * is intentionally avoided.
 */
export function PostBody({ body }: PostBodyProps) {
  if (!body) return null;
  return <Markdown body={body} />;
}
