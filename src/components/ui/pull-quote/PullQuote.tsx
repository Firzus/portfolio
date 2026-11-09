import type * as React from "react";
import { cn } from "../../../lib/utils";

interface PullQuoteProps extends Omit<React.ComponentProps<"figure">, "children"> {
  /** Address of the quoted source; the caption links to it. */
  cite: string;
  /** Name of the source, shown in the caption. */
  source: React.ReactNode;
  /** Note before the source, such as the language it was translated from. */
  note?: React.ReactNode;
  /** Language of the quoted text, when it differs from the page's. */
  quoteLang?: string;
  children: React.ReactNode;
}

/** A sentence lifted out of the text and set large, with its source linked below it. */
export function PullQuote({
  cite,
  source,
  note,
  quoteLang,
  className,
  children,
  ...props
}: PullQuoteProps) {
  return (
    <figure
      data-slot="pull-quote"
      className={cn("border-l-2 border-accent py-1 pl-5 md:pl-7", className)}
      {...props}
    >
      <blockquote cite={cite} lang={quoteLang} className="text-lead font-medium text-ink">
        <p>{children}</p>
      </blockquote>
      <figcaption className="mt-3 text-caption text-muted">
        {note && <span>{note} </span>}
        <a
          href={cite}
          className="rounded-sm text-accent underline-offset-4 transition-colors hover:underline motion-reduce:transition-none"
        >
          {source}
        </a>
      </figcaption>
    </figure>
  );
}
