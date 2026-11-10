import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { externalLinkProps, isExternal } from "../../../lib/site";
import { cn } from "../../../lib/utils";
import { NewTabNote } from "../new-tab-note";

export const textLinkVariants = cva("rounded-md transition-colors motion-reduce:transition-none", {
  variants: {
    variant: {
      /** A secondary link, often led by an icon, that brightens to the ink on hover. */
      muted: "inline-flex items-center gap-2 text-muted hover:text-ink",
      /**
       * A link that stands out in running text. Underlined at rest, since its colour alone is too
       * close to the text around it to mark it as a link; the line brightens on hover.
       */
      accent:
        "text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent",
    },
  },
  defaultVariants: { variant: "muted" },
});

export type TextLinkProps = React.ComponentProps<"a"> & VariantProps<typeof textLinkVariants>;

/** A text link. A link to another site opens in a new tab. */
export function TextLink({ className, variant, children, ...props }: TextLinkProps) {
  return (
    <a
      data-slot="text-link"
      className={cn(textLinkVariants({ variant }), className)}
      {...externalLinkProps(props.href)}
      {...props}
    >
      {children}
      {isExternal(props.href) && <NewTabNote />}
    </a>
  );
}
