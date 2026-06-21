type ProjectBodyProps = {
  body: string;
};

/**
 * Renders project MDX body as semantic HTML. Current content is plain markdown
 * (## headings + paragraphs); no JSX components are used in project files yet.
 */
export function ProjectBody({ body }: ProjectBodyProps) {
  if (!body) return null;

  return (
    <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
      {body.split(/\n\n+/).map((block) => {
        const key = block.slice(0, 48);
        if (block.startsWith("## ")) {
          return <h2 key={key}>{block.slice(3)}</h2>;
        }
        return <p key={key}>{block}</p>;
      })}
    </div>
  );
}
