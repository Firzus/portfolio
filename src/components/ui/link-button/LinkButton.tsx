import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { useMemo } from "react";
import { cn, mergeRefs } from "../../../lib/utils";
import { useMagnetic } from "../../motion/fluid";
import { ShaderLayer, useHover } from "../../motion/shaders/ShaderLayer";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors motion-reduce:transition-none",
  {
    variants: {
      variant: {
        /** The main action of a section, drawn on a live accent shader (see LinkButton). */
        solid: "relative isolate overflow-hidden bg-accent text-accent-ink hover:text-ground",
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

/**
 * A link that looks like a button, for actions that navigate. The solid variant flows on a liquid
 * shader and is pulled toward the pointer like a drop.
 */
export function LinkButton({ className, variant, size, children, ref, ...props }: LinkButtonProps) {
  const solid = (variant ?? "solid") === "solid";
  const { hover, bind } = useHover();
  const magnet = useMagnetic<HTMLAnchorElement>(0.28);
  const refs = useMemo(() => mergeRefs(ref, solid ? magnet : undefined), [ref, magnet, solid]);
  return (
    <a
      ref={refs}
      data-slot="link-button"
      data-variant={variant ?? "solid"}
      className={cn(buttonVariants({ variant, size }), className)}
      {...(solid ? bind : {})}
      {...props}
    >
      {solid ? (
        <>
          <ShaderLayer scene="button" hover={hover} className="-z-10" />
          <span data-magnetic-inner className="inline-flex items-center gap-2">
            {children}
          </span>
        </>
      ) : (
        children
      )}
    </a>
  );
}
