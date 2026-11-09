import type * as React from "react";
import { cn } from "../../../lib/utils";
import { TextLink } from "../text-link";

interface PullQuoteProps extends Omit<React.ComponentProps<"figure">, "children"> {
  /** Address of the quoted source; the caption links to it. */
  cite: string;
  /** Name of the source, shown in the caption. */
  source: React.ReactNode;
  /** Note before the source, such as the language it was translated from. */
  note?: React.ReactNode;
  children: React.ReactNode;
}

/** A sentence lifted out of the text and set large, with its source linked below it. */
export function PullQuote({ cite, source, note, className, children, ...props }: PullQuoteProps) {
  return (
    <figure
      data-slot="pull-quote"
      className={cn("border-l-2 border-accent py-1 pl-5 md:pl-7", className)}
      {...props}
    >
      <blockquote cite={cite} className="text-lead font-medium text-ink">
        <p>{children}</p>
      </blockquote>
      <figcaption className="mt-3 text-caption text-muted">
        {note && <span>{note} </span>}
        <TextLink variant="accent" href={cite}>
          {source}
        </TextLink>
      </figcaption>
    </figure>
  );
}
