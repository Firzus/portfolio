import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { useMemo } from "react";
import { externalLinkProps, isExternal } from "../../../lib/site";
import { cn, mergeRefs } from "../../../lib/utils";
import { useMagnetic } from "../../motion/fluid";
import { ShaderLayer, useHover } from "../../motion/shaders/ShaderLayer";
import { NewTabNote } from "../new-tab-note";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors motion-reduce:transition-none",
  {
    variants: {
      variant: {
        /** The main action of a section. LinkButton also draws it on a live accent shader. */
        solid:
          "relative isolate overflow-hidden bg-accent text-accent-ink hover:bg-ink hover:text-ground",
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
 * shader and is pulled toward the pointer like a drop. A link to another site opens in a new tab.
 */
export function LinkButton({
  className,
  variant,
  size,
  children,
  ref,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: LinkButtonProps) {
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
      onPointerEnter={(e) => {
        if (solid) bind.onPointerEnter();
        onPointerEnter?.(e);
      }}
      onPointerLeave={(e) => {
        if (solid) bind.onPointerLeave();
        onPointerLeave?.(e);
      }}
      onFocus={(e) => {
        if (solid) bind.onFocus();
        onFocus?.(e);
      }}
      onBlur={(e) => {
        if (solid) bind.onBlur();
        onBlur?.(e);
      }}
      {...externalLinkProps(props.href)}
      {...props}
    >
      {solid ? (
        <>
          <ShaderLayer scene="button" hover={hover} className="-z-10" />
          <span
            data-slot="link-button-label"
            data-magnetic-inner
            className="inline-flex items-center gap-2"
          >
            {children}
            {isExternal(props.href) && <NewTabNote />}
          </span>
        </>
      ) : (
        <>
          {children}
          {isExternal(props.href) && <NewTabNote />}
        </>
      )}
    </a>
  );
}
