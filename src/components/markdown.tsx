import * as React from "react";

/**
 * Minimal, dependency-free markdown renderer for content bodies. It is NOT a
 * full MDX/CommonMark engine — it covers the subset our content actually uses:
 * `##`/`###` headings, paragraphs, unordered (`-`/`*`) and ordered (`1.`) lists,
 * and inline `**bold**`, `*italic*`, `` `code` `` and `[links](url)`.
 *
 * XSS-safe by construction: everything renders through React text/elements (no
 * `dangerouslySetInnerHTML`), and links are restricted to http(s)/mailto.
 */

const INLINE_PATTERN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|\*[^*]+\*)/g;

function isSafeHref(href: string): boolean {
  return /^(https?:\/\/|mailto:|\/)/i.test(href);
}

/** Parse inline markdown in a single line into React nodes. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(INLINE_PATTERN).filter((part) => part !== "");

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={key}>{part.slice(1, -1)}</code>;
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const [, label, href] = link;
      if (isSafeHref(href)) {
        const external = /^https?:\/\//i.test(href);
        return (
          <a
            key={key}
            href={href}
            {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
          >
            {label}
          </a>
        );
      }
      return <span key={key}>{label}</span>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

const UNORDERED = /^[-*]\s+/;
const ORDERED = /^\d+\.\s+/;

/** Render a markdown body (block-level + inline) as semantic React elements. */
export function Markdown({ body, className }: { body: string; className?: string }) {
  if (!body) return null;

  const blocks = body.split(/\n\n+/);

  return (
    <div className={className ?? "prose prose-neutral dark:prose-invert mt-10 max-w-none"}>
      {blocks.map((block, blockIndex) => {
        const key = `b${blockIndex}`;

        if (block.startsWith("### ")) {
          return <h3 key={key}>{renderInline(block.slice(4), key)}</h3>;
        }
        if (block.startsWith("## ")) {
          return <h2 key={key}>{renderInline(block.slice(3), key)}</h2>;
        }

        const lines = block.split("\n");

        if (lines.every((line) => UNORDERED.test(line))) {
          return (
            <ul key={key}>
              {lines.map((line, i) => (
                <li key={`${key}-${i}`}>
                  {renderInline(line.replace(UNORDERED, ""), `${key}-${i}`)}
                </li>
              ))}
            </ul>
          );
        }

        if (lines.every((line) => ORDERED.test(line))) {
          return (
            <ol key={key}>
              {lines.map((line, i) => (
                <li key={`${key}-${i}`}>
                  {renderInline(line.replace(ORDERED, ""), `${key}-${i}`)}
                </li>
              ))}
            </ol>
          );
        }

        return <p key={key}>{renderInline(block, key)}</p>;
      })}
    </div>
  );
}
