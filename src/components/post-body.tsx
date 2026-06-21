type PostBodyProps = {
  body: string;
};

/**
 * Renders a blog post MDX body as semantic HTML. Content is plain markdown
 * (headings, paragraphs, unordered lists); no JSX components are used in post
 * files yet, so a full MDX runtime is intentionally avoided.
 */
export function PostBody({ body }: PostBodyProps) {
  if (!body) return null;

  return (
    <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
      {body.split(/\n\n+/).map((block) => {
        const key = block.slice(0, 48);

        if (block.startsWith("### ")) {
          return <h3 key={key}>{block.slice(4)}</h3>;
        }
        if (block.startsWith("## ")) {
          return <h2 key={key}>{block.slice(3)}</h2>;
        }

        const lines = block.split("\n");
        if (lines.every((line) => line.startsWith("- "))) {
          return (
            <ul key={key}>
              {lines.map((line) => (
                <li key={line}>{line.slice(2)}</li>
              ))}
            </ul>
          );
        }

        return <p key={key}>{block}</p>;
      })}
    </div>
  );
}
