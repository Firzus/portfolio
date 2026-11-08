import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../../../lib/utils";

export const textLinkVariants = cva("rounded-md transition-colors motion-reduce:transition-none", {
  variants: {
    variant: {
      /** A secondary link, often led by an icon, that brightens to the ink on hover. */
      muted: "inline-flex items-center gap-2 text-muted hover:text-ink",
      /** A link that stands out in running text. */
      accent: "text-accent underline-offset-4 hover:underline",
    },
  },
  defaultVariants: { variant: "muted" },
});

export type TextLinkProps = React.ComponentProps<"a"> & VariantProps<typeof textLinkVariants>;

export function TextLink({ className, variant, ...props }: TextLinkProps) {
  return (
    <a data-slot="text-link" className={cn(textLinkVariants({ variant }), className)} {...props} />
  );
}
