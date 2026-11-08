import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../../../lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors motion-reduce:transition-none",
  {
    variants: {
      variant: {
        /** The main action of a section. */
        solid: "bg-accent text-accent-ink hover:bg-ink hover:text-ground",
        /** A secondary action beside the main one. */
        outline: "border border-ink/12 text-ink hover:border-ink/30",
      },
      size: {
        md: "h-11 px-5 text-small",
        sm: "h-9 px-3.5 text-caption",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
  },
);

export type LinkButtonProps = React.ComponentProps<"a"> & VariantProps<typeof buttonVariants>;

/** A link that looks like a button, for actions that navigate. */
export function LinkButton({ className, variant, size, ...props }: LinkButtonProps) {
  return (
    <a
      data-slot="link-button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
